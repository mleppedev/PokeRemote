using System;
using System.Drawing;
using System.Drawing.Imaging;
using SharpDX;
using SharpDX.Direct3D11;
using SharpDX.DXGI;
using Device = SharpDX.Direct3D11.Device;

namespace PokeRemote.Core.Capture
{
    public class ScreenCapturer : IDisposable
    {
        private readonly Factory1 _factory;
        private readonly Adapter1 _adapter;
        private readonly Device _device;
        private readonly Output _output;
        private readonly Output1 _output1;
        private readonly Texture2D _screenTexture;
        private readonly int _width;
        private readonly int _height;

        public ScreenCapturer(int outputIndex = 0)
        {
            // Create DXGI Factory1
            _factory = new Factory1();
            
            // Get first adapter
            _adapter = _factory.GetAdapter1(0);
            
            // Create Direct3D device
            _device = new Device(_adapter);
            
            // Get output (monitor)
            _output = _adapter.GetOutput(outputIndex);
            _output1 = _output.QueryInterface<Output1>();
            
            // Get screen dimensions
            var bounds = _output.Description.DesktopBounds;
            _width = bounds.Right - bounds.Left;
            _height = bounds.Bottom - bounds.Top;
            
            // Create texture for screen capture
            _screenTexture = new Texture2D(_device, new Texture2DDescription
            {
                CpuAccessFlags = CpuAccessFlags.Read,
                BindFlags = BindFlags.None,
                Format = Format.B8G8R8A8_UNorm,
                Width = _width,
                Height = _height,
                OptionFlags = ResourceOptionFlags.None,
                MipLevels = 1,
                ArraySize = 1,
                SampleDescription = { Count = 1, Quality = 0 },
                Usage = ResourceUsage.Staging
            });
        }

        public Bitmap CaptureScreen()
        {
            try
            {
                // Capture screen
                _output1.DuplicateOutput(_device, out var screenDuplication);

                using (screenDuplication)
                {
                    try
                    {
                        // Try to get screenshot
                        var result = screenDuplication.TryAcquireNextFrame(100, out _, out var screenResource);
                        
                        if (result.Success)
                        {
                            using (screenResource)
                            using (var screenTexture2D = screenResource.QueryInterface<Texture2D>())
                            {
                                // Copy resource to a staging texture
                                _device.ImmediateContext.CopyResource(screenTexture2D, _screenTexture);
                                
                                // Map the staging texture for CPU reading
                                var mapSource = _device.ImmediateContext.MapSubresource(
                                    _screenTexture,
                                    0,
                                    MapMode.Read,
                                    MapFlags.None,
                                    out var dataStream);
                                
                                // Create bitmap from the screen data
                                var bitmap = new Bitmap(_width, _height, PixelFormat.Format32bppArgb);
                                var bitmapData = bitmap.LockBits(
                                    new Rectangle(0, 0, _width, _height),
                                    ImageLockMode.WriteOnly,
                                    bitmap.PixelFormat);
                                
                                // Copy pixels from the mapped staging texture to the bitmap
                                for (var y = 0; y < _height; y++)
                                {
                                    var sourcePtr = mapSource.DataPointer + y * mapSource.RowPitch;
                                    var destPtr = bitmapData.Scan0 + y * bitmapData.Stride;
                                    Utilities.CopyMemory(destPtr, sourcePtr, _width * 4); // 4 bytes per pixel (BGRA)
                                }
                                
                                // Unlock and unmap resources
                                bitmap.UnlockBits(bitmapData);
                                _device.ImmediateContext.UnmapSubresource(_screenTexture, 0);
                                screenDuplication.ReleaseFrame();
                                
                                return bitmap;
                            }
                        }
                    }
                    catch (Exception)
                    {
                        screenDuplication.ReleaseFrame();
                    }
                }
            }
            catch (Exception)
            {
                // Handle exception
            }

            return null;
        }

        public void Dispose()
        {
            _screenTexture?.Dispose();
            _output1?.Dispose();
            _output?.Dispose();
            _device?.Dispose();
            _adapter?.Dispose();
            _factory?.Dispose();
        }

        public int Width => _width;
        public int Height => _height;
    }
}

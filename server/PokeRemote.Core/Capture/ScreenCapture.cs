using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Runtime.InteropServices;
using System.Threading;

namespace PokeRemote.Core.Capture
{
    public class ScreenCapture
    {
        // Variables para la captura
        private int _captureWidth;
        private int _captureHeight;
        private int _captureX;
        private int _captureY;
        private int _frameRate;
        private bool _isCapturing;
        private Thread? _captureThread;
        private int _frameDelayMs;

        // Eventos
        public delegate void FrameCapturedHandler(Bitmap frame);
        public event FrameCapturedHandler? FrameCaptured;

        public ScreenCapture(int x = 0, int y = 0, int width = 0, int height = 0, int frameRate = 10)
        {
            // Si width o height son 0, capturar toda la pantalla
            if (width == 0 || height == 0)
            {
#pragma warning disable CA1416 // Validar la compatibilidad de la plataforma
                _captureWidth = System.Windows.Forms.Screen.PrimaryScreen.Bounds.Width;
                _captureHeight = System.Windows.Forms.Screen.PrimaryScreen.Bounds.Height;
#pragma warning restore CA1416 // Validar la compatibilidad de la plataforma
            }
            else
            {
                _captureWidth = width;
                _captureHeight = height;
            }

            _captureX = x;
            _captureY = y;
            _frameRate = frameRate;
            _frameDelayMs = 1000 / frameRate;
            _isCapturing = false;
        }

        public void Start()
        {
            if (_isCapturing) return;

            _isCapturing = true;
            _captureThread = new Thread(CaptureLoop);
            _captureThread.IsBackground = true;
            _captureThread.Start();
        }

        public void Stop()
        {
            _isCapturing = false;
            _captureThread?.Join(1000); // Esperar 1 segundo a que termine el hilo
            _captureThread = null;
        }

        private void CaptureLoop()
        {
            while (_isCapturing)
            {
                try
                {
                    // Capturar frame
#pragma warning disable CA1416 // Validar la compatibilidad de la plataforma
                    using (Bitmap frame = new Bitmap(_captureWidth, _captureHeight))
                    {
                        using (Graphics g = Graphics.FromImage(frame))
                        {
                            g.CopyFromScreen(_captureX, _captureY, 0, 0, frame.Size);
                        }

                        // Notificar a los suscriptores
                        FrameCaptured?.Invoke(frame);
                    }
#pragma warning restore CA1416 // Validar la compatibilidad de la plataforma
                }
                catch (Exception ex)
                {
                    // Log error
                    Console.WriteLine($"Error en la captura de pantalla: {ex.Message}");
                }

                // Esperar para mantener la tasa de frames
                Thread.Sleep(_frameDelayMs);
            }
        }

        // Convertir Bitmap a array de bytes para WebRTC
        public static byte[] BitmapToBytes(Bitmap bitmap, ImageFormat? format = null)
        {
#pragma warning disable CA1416 // Validar la compatibilidad de la plataforma
            format ??= ImageFormat.Jpeg;
            using (MemoryStream stream = new MemoryStream())
            {
                bitmap.Save(stream, format);
                return stream.ToArray();
            }
#pragma warning restore CA1416 // Validar la compatibilidad de la plataforma
        }
    }
}

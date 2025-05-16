using System;
using System.Runtime.InteropServices;

namespace PokeRemote.Core.Input
{
    public class KeyboardInjector
    {
        [DllImport("user32.dll")]
        private static extern uint SendInput(uint nInputs, INPUT[] pInputs, int cbSize);

        [StructLayout(LayoutKind.Sequential)]
        private struct INPUT
        {
            public InputType Type;
            public InputUnion U;
        }

        private enum InputType : uint
        {
            INPUT_KEYBOARD = 1
        }

        [StructLayout(LayoutKind.Explicit)]
        private struct InputUnion
        {
            [FieldOffset(0)] public KEYBDINPUT ki;
        }

        [StructLayout(LayoutKind.Sequential)]
        private struct KEYBDINPUT
        {
            public ushort wVk;
            public ushort wScan;
            public uint dwFlags;
            public uint time;
            public IntPtr dwExtraInfo;
        }

        [Flags]
        private enum KEYEVENTF : uint
        {
            KEYDOWN = 0x0000,
            EXTENDEDKEY = 0x0001,
            KEYUP = 0x0002,
            UNICODE = 0x0004,
            SCANCODE = 0x0008
        }

        public bool SendKeyDown(ushort keyCode)
        {
            var inputs = new INPUT[1];
            inputs[0].Type = InputType.INPUT_KEYBOARD;
            inputs[0].U.ki.wVk = keyCode;
            inputs[0].U.ki.wScan = 0;
            inputs[0].U.ki.dwFlags = (uint)KEYEVENTF.KEYDOWN;
            inputs[0].U.ki.time = 0;
            inputs[0].U.ki.dwExtraInfo = IntPtr.Zero;

            return SendInput(1, inputs, Marshal.SizeOf<INPUT>()) > 0;
        }

        public bool SendKeyUp(ushort keyCode)
        {
            var inputs = new INPUT[1];
            inputs[0].Type = InputType.INPUT_KEYBOARD;
            inputs[0].U.ki.wVk = keyCode;
            inputs[0].U.ki.wScan = 0;
            inputs[0].U.ki.dwFlags = (uint)KEYEVENTF.KEYUP;
            inputs[0].U.ki.time = 0;
            inputs[0].U.ki.dwExtraInfo = IntPtr.Zero;

            return SendInput(1, inputs, Marshal.SizeOf<INPUT>()) > 0;
        }

        public bool SendKey(ushort keyCode)
        {
            var keyDown = SendKeyDown(keyCode);
            var keyUp = SendKeyUp(keyCode);
            return keyDown && keyUp;
        }
        
        // Common virtual key codes
        public static class VirtualKeys
        {
            public const ushort VK_UP = 0x26;     // Arrow Up
            public const ushort VK_DOWN = 0x28;   // Arrow Down
            public const ushort VK_LEFT = 0x25;   // Arrow Left
            public const ushort VK_RIGHT = 0x27;  // Arrow Right
            public const ushort VK_RETURN = 0x0D; // Enter
            public const ushort VK_SPACE = 0x20;  // Space
            public const ushort VK_ESCAPE = 0x1B; // Escape
            public const ushort VK_A = 0x41;      // A key
            public const ushort VK_B = 0x42;      // B key
            public const ushort VK_X = 0x58;      // X key
            public const ushort VK_Y = 0x59;      // Y key
            public const ushort VK_Z = 0x5A;      // Z key
        }
    }
}

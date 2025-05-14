using System;
using System.Runtime.InteropServices;

namespace PokeRemote.Core.Input
{
    public class KeyboardInput
    {
        // Constantes de Win32 API
        private const int INPUT_KEYBOARD = 1;
        private const uint KEYEVENTF_KEYUP = 0x0002;
        private const uint KEYEVENTF_EXTENDEDKEY = 0x0001;

        // Estructura para entrada de teclado
        [StructLayout(LayoutKind.Sequential)]
        private struct INPUT
        {
            public int type;
            public InputUnion union;
        }

        [StructLayout(LayoutKind.Explicit)]
        private struct InputUnion
        {
            [FieldOffset(0)]
            public KEYBDINPUT ki;
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

        [DllImport("user32.dll")]
        private static extern uint SendInput(uint nInputs, INPUT[] pInputs, int cbSize);

        // Mapeo de teclas
        private static readonly Dictionary<string, ushort> KeyMap = new Dictionary<string, ushort>
        {
            // Flechas (D-Pad)
            { "UP", 0x26 },    // VK_UP
            { "DOWN", 0x28 },  // VK_DOWN
            { "LEFT", 0x25 },  // VK_LEFT
            { "RIGHT", 0x27 }, // VK_RIGHT
            
            // Botones de acción
            { "A", 0x5A },     // Z
            { "B", 0x58 },     // X
            
            // Botones de sistema
            { "START", 0x0D }, // Enter
            { "SELECT", 0x20 }, // Space
        };

        // Método para simular presión de tecla
        public static bool SendKeyDown(string key)
        {
            if (!KeyMap.TryGetValue(key, out ushort virtualKey))
            {
                Console.WriteLine($"Tecla no reconocida: {key}");
                return false;
            }

            INPUT[] inputs = new INPUT[1];
            inputs[0].type = INPUT_KEYBOARD;
            inputs[0].union.ki.wVk = virtualKey;
            inputs[0].union.ki.dwFlags = KEYEVENTF_EXTENDEDKEY;
            inputs[0].union.ki.time = 0;
            inputs[0].union.ki.wScan = 0;
            inputs[0].union.ki.dwExtraInfo = IntPtr.Zero;

            return SendInput(1, inputs, Marshal.SizeOf(typeof(INPUT))) > 0;
        }

        // Método para simular liberación de tecla
        public static bool SendKeyUp(string key)
        {
            if (!KeyMap.TryGetValue(key, out ushort virtualKey))
            {
                Console.WriteLine($"Tecla no reconocida: {key}");
                return false;
            }

            INPUT[] inputs = new INPUT[1];
            inputs[0].type = INPUT_KEYBOARD;
            inputs[0].union.ki.wVk = virtualKey;
            inputs[0].union.ki.dwFlags = KEYEVENTF_KEYUP | KEYEVENTF_EXTENDEDKEY;
            inputs[0].union.ki.time = 0;
            inputs[0].union.ki.wScan = 0;
            inputs[0].union.ki.dwExtraInfo = IntPtr.Zero;

            return SendInput(1, inputs, Marshal.SizeOf(typeof(INPUT))) > 0;
        }

        // Método para simular presionar y soltar una tecla
        public static bool SendKeyPress(string key)
        {
            return SendKeyDown(key) && SendKeyUp(key);
        }
    }
}

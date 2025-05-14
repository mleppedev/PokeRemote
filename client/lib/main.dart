import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

// Importaremos estos archivos una vez que los creemos
// import 'screens/home_screen.dart';
// import 'services/webrtc_service.dart';
// import 'providers/connection_provider.dart';
// import 'providers/orientation_provider.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.landscapeLeft,
    DeviceOrientation.landscapeRight,
  ]);
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'PokeRemote',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF8BC34A)),
        useMaterial3: true,
      ),
      home: const MyHomePage(title: 'PokeRemote'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});

  // This widget is the home page of your application. It is stateful, meaning
  // that it has a State object (defined below) that contains fields that affect
  // how it looks.

  // This class is the configuration for the state. It holds the values (in this
  // case the title) provided by the parent (in this case the App widget) and
  // used by the build method of the State. Fields in a Widget subclass are
  // always marked "final".

  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  @override
  Widget build(BuildContext context) {
    // Determinar la orientación actual
    final orientation = MediaQuery.of(context).orientation;
    final isPortrait = orientation == Orientation.portrait;

    return Scaffold(
      backgroundColor: const Color(0xFF8BC34A), // Color verde GameBoy
      appBar: AppBar(
        backgroundColor: const Color(0xFF2E7D32), // Verde oscuro
        title: Text(widget.title, style: const TextStyle(color: Colors.white)),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings, color: Colors.white),
            onPressed: () {
              // TODO: Mostrar configuración
            },
          ),
        ],
      ),
      body: isPortrait ? _buildPortraitLayout() : _buildLandscapeLayout(),
    );
  }

  Widget _buildPortraitLayout() {
    // Layout vertical con pantalla y controles táctiles
    return Column(
      children: [
        Expanded(flex: 3, child: _buildGameboyScreen()),
        Expanded(flex: 4, child: _buildTouchControls()),
      ],
    );
  }

  Widget _buildLandscapeLayout() {
    // Layout horizontal con solo pantalla (controles físicos)
    return Center(
      child: AspectRatio(aspectRatio: 16 / 9, child: _buildGameboyScreen()),
    );
  }

  Widget _buildGameboyScreen() {
    // Esta pantalla eventualmente mostrará el stream de WebRTC
    return Container(
      margin: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF9BBC0F), // Color verde pantalla GameBoy
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.black, width: 2),
      ),
      child: const Center(
        child: Text(
          'ESPERANDO CONEXIÓN',
          style: TextStyle(
            color: Color(0xFF0F380F),
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }

  Widget _buildTouchControls() {
    // Controles táctiles estilo GameBoy
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          // D-Pad
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const SizedBox(width: 40),
              _buildDirectionButton(Icons.arrow_upward, 'UP'),
              const SizedBox(width: 40),
            ],
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildDirectionButton(Icons.arrow_back, 'LEFT'),
              const SizedBox(width: 40),
              _buildDirectionButton(Icons.arrow_forward, 'RIGHT'),
            ],
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const SizedBox(width: 40),
              _buildDirectionButton(Icons.arrow_downward, 'DOWN'),
              const SizedBox(width: 40),
            ],
          ),
          const SizedBox(height: 20),
          // Botones A/B
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Spacer(),
              _buildActionButton('B'),
              const SizedBox(width: 20),
              _buildActionButton('A'),
              const Spacer(),
            ],
          ),
          const SizedBox(height: 20),
          // Botones Start/Select
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildSystemButton('SELECT'),
              const SizedBox(width: 40),
              _buildSystemButton('START'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDirectionButton(IconData icon, String direction) {
    return GestureDetector(
      onTapDown: (_) => _handleButtonPress(direction),
      onTapUp: (_) => _handleButtonRelease(direction),
      child: Container(
        width: 50,
        height: 50,
        decoration: BoxDecoration(
          color: const Color(0xFF303030),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(icon, color: Colors.white),
      ),
    );
  }

  Widget _buildActionButton(String label) {
    return GestureDetector(
      onTapDown: (_) => _handleButtonPress(label),
      onTapUp: (_) => _handleButtonRelease(label),
      child: Container(
        width: 60,
        height: 60,
        decoration: BoxDecoration(
          color: label == 'A' ? Colors.red : Colors.blue,
          shape: BoxShape.circle,
        ),
        child: Center(
          child: Text(
            label,
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
              fontSize: 24,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSystemButton(String label) {
    return GestureDetector(
      onTapDown: (_) => _handleButtonPress(label),
      onTapUp: (_) => _handleButtonRelease(label),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: const Color(0xFF303030),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(
          label,
          style: const TextStyle(color: Colors.white, fontSize: 12),
        ),
      ),
    );
  }

  void _handleButtonPress(String button) {
    print('Botón presionado: $button');
    // TODO: Enviar evento al servidor a través de WebRTC DataChannel
  }

  void _handleButtonRelease(String button) {
    print('Botón liberado: $button');
    // TODO: Enviar evento al servidor a través de WebRTC DataChannel
  }
}

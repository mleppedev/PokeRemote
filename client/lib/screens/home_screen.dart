import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/connection_provider.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final TextEditingController _serverController = TextEditingController();
  
  @override
  void initState() {
    super.initState();
    // Valor predeterminado para pruebas locales
    _serverController.text = 'http://192.168.1.100:8080';
  }
  
  @override
  void dispose() {
    _serverController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF8BC34A), // Color verde GameBoy
      appBar: AppBar(
        backgroundColor: const Color(0xFF2E7D32), // Verde oscuro
        title: const Text(
          'PokeRemote',
          style: TextStyle(color: Colors.white),
        ),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              Image.asset(
                'assets/images/gameboy_logo.png',
                width: 200,
                height: 200,
                errorBuilder: (context, error, stackTrace) => 
                  const Icon(Icons.videogame_asset, size: 100, color: Colors.white),
              ),
              const SizedBox(height: 40),
              const Text(
                'Conectar a servidor',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 20),
              TextField(
                controller: _serverController,
                decoration: const InputDecoration(
                  fillColor: Colors.white,
                  filled: true,
                  hintText: 'URL del servidor',
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.url,
              ),
              const SizedBox(height: 20),
              Consumer<ConnectionProvider>(
                builder: (context, provider, child) {
                  if (provider.isConnecting) {
                    return const CircularProgressIndicator(
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    );
                  }
                  
                  if (provider.isConnected) {
                    return Column(
                      children: [
                        const Icon(
                          Icons.check_circle,
                          color: Colors.white,
                          size: 50,
                        ),
                        const SizedBox(height: 10),
                        const Text(
                          '¡Conectado!',
                          style: TextStyle(color: Colors.white, fontSize: 20),
                        ),
                        const SizedBox(height: 20),
                        ElevatedButton.icon(
                          icon: const Icon(Icons.videogame_asset),
                          label: const Text('EMPEZAR A JUGAR'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.white,
                            foregroundColor: const Color(0xFF2E7D32),
                            padding: const EdgeInsets.symmetric(
                              horizontal: 32,
                              vertical: 16,
                            ),
                          ),
                          onPressed: () {
                            Navigator.pushReplacement(
                              context,
                              MaterialPageRoute(
                                builder: (context) => const Placeholder(), // TODO: GameScreen()
                              ),
                            );
                          },
                        ),
                        const SizedBox(height: 20),
                        TextButton(
                          onPressed: () => provider.disconnect(),
                          child: const Text(
                            'Desconectar',
                            style: TextStyle(color: Colors.white),
                          ),
                        ),
                      ],
                    );
                  }
                  
                  return Column(
                    children: [
                      if (provider.errorMessage.isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 20),
                          child: Text(
                            provider.errorMessage,
                            style: const TextStyle(color: Colors.red),
                          ),
                        ),
                      ElevatedButton.icon(
                        icon: const Icon(Icons.play_arrow),
                        label: const Text('CONECTAR'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: const Color(0xFF2E7D32),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 32,
                            vertical: 16,
                          ),
                        ),
                        onPressed: () {
                          provider.connectToServer(_serverController.text);
                        },
                      ),
                    ],
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}

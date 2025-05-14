import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class OrientationProvider extends ChangeNotifier {
  Orientation _currentOrientation = Orientation.portrait;
  bool _isPhysicalControlsEnabled = false;

  Orientation get currentOrientation => _currentOrientation;
  bool get isPhysicalControlsEnabled => _isPhysicalControlsEnabled;

  void updateOrientation(Orientation orientation) {
    if (_currentOrientation != orientation) {
      _currentOrientation = orientation;
      
      // En landscape, asumimos que usarán los controles físicos
      _isPhysicalControlsEnabled = orientation == Orientation.landscape;
      
      notifyListeners();
    }
  }

  void togglePhysicalControls(bool enabled) {
    _isPhysicalControlsEnabled = enabled;
    notifyListeners();
  }
  
  // Método para escuchar los eventos del teclado físico (cuando estamos en landscape)
  void listenToPhysicalControls(RawKeyEvent event) {
    if (!_isPhysicalControlsEnabled) return;
    
    // TODO: Implementar mapeo de teclas físicas a controles de juego
    if (event is RawKeyDownEvent) {
      // Procesar keydown
    } else if (event is RawKeyUpEvent) {
      // Procesar keyup
    }
  }
}

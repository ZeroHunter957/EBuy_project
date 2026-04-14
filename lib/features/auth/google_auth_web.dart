// ignore_for_file: avoid_web_libraries_in_flutter

library google_auth;

import 'dart:async';
import 'dart:js_util';
import 'dart:html';
import 'dart:ui_web' as ui;

import 'package:js/js.dart';

@JS('google.accounts.id.initialize')
external void _initialize(IdConfiguration config);

@JS('google.accounts.id.renderButton')
external void _renderButton(
    Element parent,
    Object options,
    );

Completer<String>? _completer;
bool _initialized = false;

/// 1. Register HTML container (call once)
void registerGoogleDiv(String clientId) {
  // ignore: undefined_prefixed_name
  ui.platformViewRegistry.registerViewFactory(
    'google-btn',
        (int viewId) {
      final div = DivElement()
        ..id = 'google_btn'
        ..style.width = '100%'
        ..style.height = '50px';

      // ✅ Initialize Google ONCE here
      if (!_initialized) {
        _initialize(IdConfiguration(
          client_id: clientId,
          callback: allowInterop((response) {
            final credential = getProperty(response, 'credential');
            _completer?.complete(credential);
          }),
        ));
        _initialized = true;
      }

      // ✅ Render button DIRECTLY here (no querySelector)
      _renderButton(div, {
        "theme": "outline",
        "size": "large",
      });

      return div;
    },
  );
}

/// 4. Wait for login result
Future<String> waitForCredential() {
  _completer = Completer<String>();
  return _completer!.future;
}

@JS()
@anonymous
class IdConfiguration {
  external String get client_id;
  external Function get callback;

  external factory IdConfiguration({
    String client_id,
    Function callback,
  });
}
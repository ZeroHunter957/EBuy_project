import 'package:flutter/foundation.dart';

class ApiConfig {
  ApiConfig._();

  static const String _defaultBase = 'http://localhost:9999';
  static const String _envBaseUrl = String.fromEnvironment('API_BASE_URL');

  /// Base API endpoint adjusted automatically for the current platform.
  static String get baseUrl {
    if (_envBaseUrl.isNotEmpty) {
      return _normalizeLoopback(_envBaseUrl);
    }
    return _normalizeLoopback(_defaultBase);
  }

  /// Map media URLs (possibly relative) to a fetchable absolute URL.
  static String? resolveMediaUrl(String? pathOrUrl) {
    if (pathOrUrl == null || pathOrUrl.isEmpty) return null;

    final normalized = pathOrUrl.startsWith('http')
        ? _normalizeMediaHost(pathOrUrl)
        : _joinPath(baseUrl, pathOrUrl);
    return normalized;
  }

  static String _joinPath(String root, String path) {
    if (path.startsWith('/')) return '$root$path';
    return '$root/$path';
  }

  static String _normalizeMediaHost(String url) {
    final normalizedUrl = _normalizeLoopback(url);

    final mediaUri = Uri.tryParse(normalizedUrl);
    final apiUri = Uri.tryParse(baseUrl);
    if (mediaUri == null || apiUri == null) return normalizedUrl;

    final mediaHost = mediaUri.host.toLowerCase();
    if (mediaHost != 'localhost' && mediaHost != '127.0.0.1') {
      return normalizedUrl;
    }

    return mediaUri
        .replace(
          scheme: apiUri.scheme,
          host: apiUri.host,
          port: apiUri.hasPort ? apiUri.port : null,
        )
        .toString();
  }

  static String _normalizeLoopback(String url) {
    if (kIsWeb) return url;

    final replacements = <String>['http://localhost', 'http://127.0.0.1'];
    final target = _loopbackHost;

    for (final pattern in replacements) {
      if (url.startsWith(pattern)) {
        return url.replaceFirst(pattern, target);
      }
    }
    return url;
  }

  static String get _loopbackHost {
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return 'http://10.0.2.2';
      case TargetPlatform.iOS:
        return 'http://127.0.0.1';
      default:
        return 'http://localhost';
    }
  }
}

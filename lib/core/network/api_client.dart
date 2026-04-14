import 'dart:convert';

import 'package:http/http.dart' as http;

import '../constants.dart';

class ApiException implements Exception {
  ApiException(this.message, {this.statusCode});

  final String message;
  final int? statusCode;

  @override
  String toString() => 'ApiException($statusCode): $message';
}

class ApiClient {
  ApiClient({http.Client? httpClient}) : _client = httpClient ?? http.Client();

  final http.Client _client;

  Future<dynamic> get(
    String path, {
    String? token,
    Map<String, dynamic>? query,
  }) async {
    final uri = Uri.parse('${ApiConfig.baseUrl}$path').replace(
      queryParameters: query?.map((key, value) => MapEntry(key, '$value')),
    );

    final response = await _client.get(uri, headers: _headers(token));
    return _decode(response);
  }

  Future<dynamic> post(
    String path, {
    String? token,
    Map<String, dynamic>? body,
  }) async {
    final uri = Uri.parse('${ApiConfig.baseUrl}$path');
    final response = await _client.post(
      uri,
      headers: _headers(token),
      body: jsonEncode(body ?? {}),
    );
    return _decode(response);
  }

  Future<dynamic> put(
    String path, {
    String? token,
    Map<String, dynamic>? body,
  }) async {
    final uri = Uri.parse('${ApiConfig.baseUrl}$path');
    final response = await _client.put(
      uri,
      headers: _headers(token),
      body: jsonEncode(body ?? {}),
    );
    return _decode(response);
  }

  Future<dynamic> delete(
    String path, {
    String? token,
    Map<String, dynamic>? body,
  }) async {
    final uri = Uri.parse('${ApiConfig.baseUrl}$path');
    final response = await _client.delete(
      uri,
      headers: _headers(token),
      body: body == null ? null : jsonEncode(body),
    );
    return _decode(response);
  }

  Future<dynamic> postMultipart(
    String path, {
    String? token,
    Map<String, String>? fields,
    List<http.MultipartFile>? files,
  }) async {
    final uri = Uri.parse('${ApiConfig.baseUrl}$path');
    final request = http.MultipartRequest('POST', uri);
    request.headers.addAll(_headers(token, isJson: false));
    if (fields != null) request.fields.addAll(fields);
    if (files != null) request.files.addAll(files);

    final streamed = await request.send();
    final response = await http.Response.fromStream(streamed);
    return _decode(response);
  }

  Map<String, String> _headers(String? token, {bool isJson = true}) {
    return {
      if (isJson) 'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  dynamic _decode(http.Response response) {
    final body = response.body.isEmpty ? null : jsonDecode(response.body);

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return body;
    }

    final message = (body is Map<String, dynamic>)
        ? (body['message'] ?? body['error'] ?? 'Unexpected API error')
        : 'Unexpected API error';
    throw ApiException(message.toString(), statusCode: response.statusCode);
  }
}

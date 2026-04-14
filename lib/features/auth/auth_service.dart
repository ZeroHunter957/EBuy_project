import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import 'package:onlineshop_flutterclient/core/models/auth_response.dart';
import 'package:onlineshop_flutterclient/core/models/user.dart';
import 'package:onlineshop_flutterclient/core/network/api_client.dart';
import 'package:onlineshop_flutterclient/core/network/endpoints.dart';
import 'package:onlineshop_flutterclient/features/auth/google_auth_web.dart';

import 'google_auth_web.dart';

class AuthService {
  AuthService(this._client)
      : _googleSignIn = GoogleSignIn(
          scopes: const ['email'],
          serverClientId: kIsWeb ? null : _serverClientId,
        );

  static const String _serverClientId =
      '1064126993104-d4u7tsa73eo9v9imql46pcvo3tk6io4r.apps.googleusercontent.com';

  final ApiClient _client;
  final GoogleSignIn _googleSignIn;

  Future<AuthResponse> login(
      {required String email, required String password}) async {
    final response = await _client.post(
      ApiEndpoints.login,
      body: {
        'email': email,
        'password': password,
      },
    ) as Map<String, dynamic>;
    return AuthResponse.fromJson(response);
  }

  Future<AuthResponse> loginWithGoogle() async {
    if (kIsWeb) {
      return _loginWithGoogleWeb();
    } else {
      return _loginWithGoogleMobile();
    }
  }

  Future<AuthResponse> _loginWithGoogleWeb() async {
    final idToken = await waitForCredential();

    final response = await _client.post(
      ApiEndpoints.googleLogin,
      body: {'token': idToken},
    ) as Map<String, dynamic>;

    return AuthResponse.fromJson(response);
  }

  Future<AuthResponse> _loginWithGoogleMobile() async {
    await _googleSignIn.signOut();
    final account = await _googleSignIn.signIn();

    if (account == null) {
      throw Exception('Google sign in cancelled');
    }

    final authentication = await account.authentication;
    final idToken = authentication.idToken;

    if (idToken == null || idToken.isEmpty) {
      throw Exception('Could not get Google ID token');
    }

    final response = await _client.post(
      ApiEndpoints.googleLogin,
      body: {'token': idToken},
    ) as Map<String, dynamic>;

    return AuthResponse.fromJson(response);
  }

  Future<AuthResponse> register({
    required String username,
    required String email,
    required String password,
    required int roleId,
  }) async {
    final response = await _client.post(
      ApiEndpoints.register,
      body: {
        'username': username,
        'email': email,
        'password': password,
        'roleId': roleId,
      },
    ) as Map<String, dynamic>;
    return AuthResponse.fromJson(response);
  }

  Future<UserModel> currentUser(String token) async {
    final response = await _client.get(
      ApiEndpoints.me,
      token: token,
    ) as Map<String, dynamic>;
    return UserModel.fromJson(response);
  }

  Future<void> verifySeller({
    required String token,
    required String businessDescription,
    required String productDescription,
    required XFile citizenIdImage,
    required XFile businessCertImage,
  }) async {
    final citizenIdFile = http.MultipartFile.fromBytes(
      'citizenIdImage',
      await citizenIdImage.readAsBytes(),
      filename: citizenIdImage.name,
    );
    final businessCertFile = http.MultipartFile.fromBytes(
      'businessCertImage',
      await businessCertImage.readAsBytes(),
      filename: businessCertImage.name,
    );

    await _client.postMultipart(
      ApiEndpoints.sellerVerify,
      token: token,
      fields: {
        'businessDescription': businessDescription,
        'productDescription': productDescription,
      },
      files: [citizenIdFile, businessCertFile],
    );
  }
}

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:onlineshop_flutterclient/core/models/auth_response.dart';

import '../../core/models/user.dart';
import '../../core/storage/token_storage.dart';
import 'auth_service.dart';

class AuthController extends ChangeNotifier {
  AuthController(this._authService);

  final AuthService _authService;

  UserModel? currentUser;
  String? token;
  bool isLoading = false;
  String? error;

  Future<void> initialize() async {
    isLoading = true;
    notifyListeners();
    token = await TokenStorage.readToken();
    if (token != null) {
      try {
        currentUser = await _authService.currentUser(token!);
      } catch (_) {
        token = null;
        currentUser = null;
        await TokenStorage.clear();
      }
    }
    isLoading = false;
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    error = null;
    isLoading = true;
    notifyListeners();

    try {
      final auth = await _authService.login(email: email, password: password);
      token = auth.token;
      currentUser = auth.user;
      await TokenStorage.saveToken(token!);
      return true;
    } catch (e) {
      error = e.toString();
      return false;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> loginWithGoogle() async {
    error = null;
    isLoading = true;
    notifyListeners();

    try {
      final auth = await _authService.loginWithGoogle();
      token = auth.token;
      currentUser = auth.user;
      await TokenStorage.saveToken(token!);
      return true;
    } catch (e) {
      error = e.toString();
      return false;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> register({
    required String username,
    required String email,
    required String password,
    required int roleId,
  }) async {
    error = null;
    isLoading = true;
    notifyListeners();
    try {
      final auth = await _authService.register(
        username: username,
        email: email,
        password: password,
        roleId: roleId,
      );
      token = auth.token;
      currentUser = auth.user;
      await TokenStorage.saveToken(token!);
      return true;
    } catch (e) {
      error = e.toString();
      return false;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> registerSeller({
    required String username,
    required String email,
    required String password,
    required String businessDescription,
    required String productDescription,
    required XFile citizenIdImage,
    required XFile businessCertImage,
  }) async {
    error = null;
    isLoading = true;
    notifyListeners();
    try {
      await _authService.register(
        username: username,
        email: email,
        password: password,
        roleId: 2,
      );

      final auth = await _authService.login(email: email, password: password);
      await _authService.verifySeller(
        token: auth.token,
        businessDescription: businessDescription,
        productDescription: productDescription,
        citizenIdImage: citizenIdImage,
        businessCertImage: businessCertImage,
      );
      return true;
    } catch (e) {
      error = e.toString();
      return false;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    token = null;
    currentUser = null;
    await TokenStorage.clear();
    notifyListeners();
  }

  bool get isAuthenticated => token != null && currentUser != null;
}

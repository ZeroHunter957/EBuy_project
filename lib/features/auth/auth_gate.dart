import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../admin/admin_shell.dart';
import '../home/home_shell.dart';
import '../seller/seller_shell.dart';
import 'auth_controller.dart';
import 'login_screen.dart';

class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthController>(
      builder: (context, auth, _) {
        if (auth.isAuthenticated) {
          final role = auth.currentUser?.role.name.toUpperCase();
          switch (role) {
            case 'ADMIN':
              return const AdminShell();
            case 'SELLER':
              return const SellerShell();
            default:
              return const HomeShell();
          }
        }
        if (auth.isLoading) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }
        return const LoginScreen();
      },
    );
  }
}

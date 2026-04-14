import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'core/network/api_client.dart';
import 'core/services/cart_service.dart';
import 'core/services/category_service.dart';
import 'core/services/checkout_service.dart';
import 'core/services/feedback_service.dart';
import 'core/services/product_image_service.dart';
import 'core/services/product_service.dart';
import 'core/services/review_service.dart';
import 'core/services/seller_verification_service.dart';
import 'core/services/user_service.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/auth_controller.dart';
import 'features/auth/auth_gate.dart';
import 'features/auth/auth_service.dart';
import 'features/cart/cart_controller.dart';
import 'features/catalog/catalog_controller.dart';

class OnlineShopApp extends StatelessWidget {
  const OnlineShopApp({super.key});

  @override
  Widget build(BuildContext context) {
    final apiClient = ApiClient();
    final productService = ProductService(apiClient);
    final categoryService = CategoryService(apiClient);
    final cartService = CartService(apiClient);
    final checkoutService = CheckoutService(apiClient);
    final feedbackService = FeedbackService(apiClient);
    final reviewService = ReviewService(apiClient);
    final userService = UserService(apiClient);
    final sellerVerificationService = SellerVerificationService(apiClient);
    final productImageService = ProductImageService(apiClient);

    return MultiProvider(
      providers: [
        Provider.value(value: productService),
        Provider.value(value: categoryService),
        Provider.value(value: cartService),
        Provider.value(value: checkoutService),
        Provider.value(value: feedbackService),
        Provider.value(value: reviewService),
        Provider.value(value: userService),
        Provider.value(value: sellerVerificationService),
        Provider.value(value: productImageService),
        ChangeNotifierProvider(
          create: (_) => AuthController(AuthService(apiClient))..initialize(),
        ),
        ChangeNotifierProxyProvider<AuthController, CartController>(
          create: (_) => CartController(cartService),
          update: (_, auth, cart) => cart!..updateToken(auth.token),
        ),
        ChangeNotifierProxyProvider<AuthController, CatalogController>(
          create: (_) => CatalogController(productService, categoryService),
          update: (_, auth, catalog) => catalog!..updateToken(auth.token),
        ),
      ],
      child: MaterialApp(
        title: 'Sem4 Online Shop',
        theme: AppTheme.lightTheme,
        debugShowCheckedModeBanner: false,
        home: const AuthGate(),
      ),
    );
  }
}

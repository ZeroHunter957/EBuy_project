import 'package:flutter/material.dart';

import '../../core/models/order.dart';
import '../../core/models/product.dart';
import '../../core/services/checkout_service.dart';
import '../../core/services/product_service.dart';

class SellerDashboardController extends ChangeNotifier {
  SellerDashboardController(
    this._productService, {
    required CheckoutService checkoutService,
    required this.sellerId,
    required this.token,
  }) : _checkoutService = checkoutService {
    _productService.updateToken(token);
    _checkoutService.updateToken(token);
  }

  final ProductService _productService;
  final CheckoutService _checkoutService;
  final int? sellerId;
  final String? token;

  List<Product> products = [];
  List<Order> orders = [];
  bool isLoading = false;
  String? error;

  int get pendingCount =>
      products.where((p) => (p.status ?? '').toUpperCase() == 'PENDING').length;
  int get ordersCount => orders.length;

  List<Product> filteredProducts({
    required String tab,
    required String searchName,
    required String sortKey,
  }) {
    final query = searchName.trim().toLowerCase();
    final filtered = products.where((p) {
      final status = (p.status ?? '').toUpperCase();
      final matchesTab = switch (tab) {
        'PENDING' => status == 'PENDING',
        'APPROVED' => status == 'APPROVED',
        'REJECTED' => status == 'REJECTED',
        _ => true,
      };
      final matchesSearch =
          query.isEmpty || p.name.toLowerCase().contains(query);
      return matchesTab && matchesSearch;
    }).toList();

    filtered.sort((a, b) {
      switch (sortKey) {
        case 'price_asc':
          return a.price.compareTo(b.price);
        case 'price_desc':
          return b.price.compareTo(a.price);
        case 'stock_asc':
          return (a.stock ?? 0).compareTo(b.stock ?? 0);
        case 'stock_desc':
          return (b.stock ?? 0).compareTo(a.stock ?? 0);
        case 'id_asc':
          return a.id.compareTo(b.id);
        default:
          return b.id.compareTo(a.id);
      }
    });

    return filtered;
  }

  Future<void> load() async {
    if (sellerId == null) return;
    isLoading = true;
    error = null;
    notifyListeners();
    try {
      final results = await Future.wait([
        _productService.bySeller(sellerId!),
        _checkoutService.fetchSellerOrders(),
      ]);
      products = results[0] as List<Product>;
      orders = results[1] as List<Order>;
    } catch (e) {
      error = e.toString();
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }
}

import 'package:flutter/material.dart';

import '../../core/models/product.dart';
import '../../core/services/product_service.dart';

class SellerProductsController extends ChangeNotifier {
  SellerProductsController(this._productService,
      {required this.sellerId, required this.token}) {
    _productService.updateToken(token);
  }

  final ProductService _productService;
  final int? sellerId;
  final String? token;

  List<Product> _allProducts = [];
  List<Product> filteredProducts = [];
  bool isLoading = false;
  String? error;
  String searchQuery = '';
  String statusFilter = 'ALL';

  Future<void> load() async {
    if (sellerId == null) return;
    isLoading = true;
    error = null;
    notifyListeners();
    try {
      _allProducts = await _productService.bySeller(sellerId!);
      _applyFilters();
    } catch (e) {
      error = e.toString();
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  void updateSearch(String query) {
    searchQuery = query;
    _applyFilters();
  }

  void updateStatusFilter(String filter) {
    statusFilter = filter;
    _applyFilters();
  }

  void _applyFilters() {
    var list = _allProducts;
    if (searchQuery.isNotEmpty) {
      list = list
          .where(
              (p) => p.name.toLowerCase().contains(searchQuery.toLowerCase()))
          .toList();
    }
    if (statusFilter != 'ALL') {
      list = list
          .where((p) => (p.status ?? 'PENDING').toUpperCase() == statusFilter)
          .toList();
    }
    filteredProducts = list;
    notifyListeners();
  }
}

import 'package:flutter/material.dart';

import '../../core/models/category.dart';
import '../../core/models/product.dart';
import '../../core/services/category_service.dart';
import '../../core/services/product_service.dart';

class CatalogController extends ChangeNotifier {
  CatalogController(this._productService, this._categoryService);

  final ProductService _productService;
  final CategoryService _categoryService;

  List<Category> categories = [];
  List<Product> featuredProducts = [];
  List<Product> latestProducts = [];
  bool isLoading = false;
  String? error;

  void updateToken(String? token) {
    _productService.updateToken(token);
    _categoryService.updateToken(token);
  }

  Future<void> loadLanding() async {
    isLoading = true;
    error = null;
    notifyListeners();

    try {
      categories = await _categoryService.fetchAll();
      featuredProducts = await _productService.fetchAll();
      latestProducts = List<Product>.from(featuredProducts)
        ..sort((a, b) {
          final aTime = a.createdAt;
          final bTime = b.createdAt;
          if (aTime == null && bTime == null) return b.id.compareTo(a.id);
          if (aTime == null) return 1;
          if (bTime == null) return -1;
          return bTime.compareTo(aTime);
        });
    } catch (e) {
      error = e.toString();
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<List<Product>> search(
      {String? query, int page = 0, int size = 30}) async {
    return _productService.search(name: query, page: page, size: size);
  }

  Future<List<Product>> byCategory(int categoryId) async {
    return _productService.byCategory(categoryId, page: 0, size: 30);
  }
}

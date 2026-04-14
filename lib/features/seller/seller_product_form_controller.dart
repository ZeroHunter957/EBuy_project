import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../../core/models/category.dart';
import '../../core/models/product.dart';
import '../../core/services/category_service.dart';
import '../../core/services/product_image_service.dart';
import '../../core/services/product_service.dart';

class SellerProductFormController extends ChangeNotifier {
  SellerProductFormController({
    required ProductService productService,
    required CategoryService categoryService,
    required ProductImageService imageService,
    required this.sellerId,
    required this.token,
    this.initialProduct,
  })  : _productService = productService,
        _categoryService = categoryService,
        _imageService = imageService {
    _productService.updateToken(token);
    _categoryService.updateToken(token);
    _imageService.updateToken(token);
    _hydrateFromProduct();
  }

  final ProductService _productService;
  final CategoryService _categoryService;
  final ProductImageService _imageService;
  final int? sellerId;
  final String? token;
  final Product? initialProduct;

  bool get isEditing => initialProduct != null;

  final ImagePicker _picker = ImagePicker();

  List<Category> categories = [];
  final Set<int> selectedCategoryIds = {};
  final List<XFile> pendingImages = [];
  int primaryIndex = 0;

  String name = '';
  String description = '';
  String price = '';
  String stock = '';

  double get parsedPrice => double.tryParse(price) ?? 0.0;
  int get parsedStock => int.tryParse(stock) ?? 0;

  bool isLoadingCategories = false;
  bool isSubmitting = false;
  String? error;

  void _hydrateFromProduct() {
    if (initialProduct == null) return;
    name = initialProduct!.name;
    price = initialProduct!.price.toStringAsFixed(2);
    stock = (initialProduct!.stock ?? 0).toString();
    description = initialProduct!.description ?? '';
    selectedCategoryIds.addAll(initialProduct!.categories.map((c) => c.id));
  }

  Future<void> loadCategories() async {
    isLoadingCategories = true;
    notifyListeners();
    try {
      categories = await _categoryService.fetchAll();
    } catch (e) {
      error = e.toString();
    } finally {
      isLoadingCategories = false;
      notifyListeners();
    }
  }

  void toggleCategory(int id) {
    if (selectedCategoryIds.contains(id)) {
      selectedCategoryIds.remove(id);
    } else {
      selectedCategoryIds.add(id);
    }
    notifyListeners();
  }

  void updatePrimaryIndex(int index) {
    primaryIndex = index;
    notifyListeners();
  }

  Future<void> pickImages() async {
    final files = await _picker.pickMultiImage(imageQuality: 85);
    if (files.isEmpty) return;
    pendingImages.addAll(files);
    notifyListeners();
  }

  void removeImage(int index) {
    pendingImages.removeAt(index);
    if (primaryIndex >= pendingImages.length) {
      primaryIndex = 0;
    }
    notifyListeners();
  }

  Future<Product?> submit() async {
    if (sellerId == null) {
      error = 'Missing seller/admin profile';
      notifyListeners();
      return null;
    }

    if (name.trim().isEmpty ||
        price.trim().isEmpty ||
        stock.trim().isEmpty ||
        selectedCategoryIds.isEmpty) {
      error = 'Please fill in all required fields and select categories.';
      notifyListeners();
      return null;
    }

    if (parsedPrice < 0 || parsedStock < 0) {
      error = 'Price and stock must be >= 0';
      notifyListeners();
      return null;
    }

    isSubmitting = true;
    error = null;
    notifyListeners();

    try {
      final basePayload = {
        'name': name.trim(),
        'price': parsedPrice,
        'stock': parsedStock,
        'description': description.trim(),
        'categoryIds': selectedCategoryIds.toList(),
      };

      final product = isEditing
          ? await _productService.update(initialProduct!.id, {
              ...basePayload,
              'userId': sellerId,
              'available': initialProduct?.available ?? true,
            })
          : await _productService.create(basePayload);

      for (var i = 0; i < pendingImages.length; i++) {
        final pending = pendingImages[i];
        await _imageService.upload(
          file: pending,
          productId: product.id,
          primary: i == primaryIndex,
        );
      }

      return product;
    } catch (e) {
      error = e.toString();
      return null;
    } finally {
      isSubmitting = false;
      notifyListeners();
    }
  }
}

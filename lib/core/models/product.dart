import 'category.dart';
import 'product_image.dart';

class Product {
  Product({
    required this.id,
    required this.name,
    required this.price,
    this.description,
    this.stock,
    this.available = true,
    this.status,
    this.createdAt,
    this.categories = const [],
    this.images = const [],
  });

  final int id;
  final String name;
  final double price;
  final String? description;
  final int? stock;
  final bool available;
  final String? status;
  final DateTime? createdAt;
  final List<Category> categories;
  final List<ProductImage> images;

  String? get primaryImageUrl {
    if (images.isEmpty) return null;

    final primary = images.firstWhere(
      (img) => img.isPrimary,
      orElse: () => images.first,
    );

    if (primary.url.isEmpty) return null;
    return primary.url;
  }

  factory Product.fromJson(Map<String, dynamic> json) {
    final imageList = (json['images'] as List?)
            ?.map((e) => ProductImage.fromJson(e as Map<String, dynamic>))
            .toList() ??
        const [];

    final categoryList = (json['categories'] as List?)
            ?.map((e) => Category.fromJson(e as Map<String, dynamic>))
            .toList() ??
        (json['category'] != null
            ? [Category.fromJson(json['category'] as Map<String, dynamic>)]
            : const []);

    return Product(
      id: (json['id'] as num?)?.toInt() ?? 0,
      name: json['name']?.toString() ?? 'Unnamed product',
      price: (json['price'] as num?)?.toDouble() ?? 0,
      description: json['description']?.toString(),
      stock: (json['stock'] as num?)?.toInt(),
      available: json['available'] as bool? ?? true,
      status: json['status']?.toString(),
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString())
          : null,
      categories: categoryList,
      images: imageList,
    );
  }
}

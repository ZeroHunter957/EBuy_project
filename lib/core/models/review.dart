import 'product.dart';
import 'user.dart';

class Review {
  Review({
    required this.id,
    required this.rating,
    required this.comment,
    this.user,
    this.product,
    this.createdAt,
  });

  final int id;
  final int rating;
  final String comment;
  final UserModel? user;
  final Product? product;
  final DateTime? createdAt;

  factory Review.fromJson(Map<String, dynamic> json) {
    return Review(
      id: json['id'] as int,
      rating: json['rating'] as int? ?? (json['stars'] as int? ?? 0),
      comment: json['comment']?.toString() ?? json['content']?.toString() ?? '',
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString())
          : null,
      user: json['user'] != null
          ? UserModel.fromJson(json['user'] as Map<String, dynamic>)
          : null,
      product: json['product'] != null
          ? Product.fromJson(json['product'] as Map<String, dynamic>)
          : null,
    );
  }
}

// class ProductImage {
//   ProductImage({required this.id, required this.url, this.isPrimary = false});
//
//   final int id;
//   final String url;
//   final bool isPrimary;
//
//   factory ProductImage.fromJson(Map<String, dynamic> json) {
//     return ProductImage(
//       id: json['id'] as int,
//       url: json['imageUrl']?.toString() ?? '',
//       isPrimary: (json['primary'] as bool?) ?? (json['isPrimary'] as bool?) ?? false,
//     );
//   }
// }
class ProductImage {
  ProductImage({
    required this.id,
    required this.url,
    this.isPrimary = false,
  });

  final int id;
  final String url;
  final bool isPrimary;

  factory ProductImage.fromJson(Map<String, dynamic> json) {
    final rawUrl =
        json['imageUrl'] ?? json['url'] ?? json['image']; // thử lần lượt

    return ProductImage(
      id: json['id'] as int,
      url: rawUrl?.toString() ?? '',
      isPrimary:
          (json['primary'] as bool?) ?? (json['isPrimary'] as bool?) ?? false,
    );
  }
}

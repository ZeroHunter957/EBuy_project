import 'product.dart';

class OrderItemModel {
  OrderItemModel({
    required this.id,
    required this.product,
    this.quantity = 0,
    this.unitPrice = 0,
  });

  final int id;
  final Product product;
  final int quantity;
  final double unitPrice;

  double get total => quantity * unitPrice;
  double get subtotal => total; // Alias for compatibility

  factory OrderItemModel.fromJson(Map<String, dynamic> json) {
    final productJson =
        json['product'] as Map<String, dynamic>? ?? const <String, dynamic>{};

    return OrderItemModel(
      id: (json['id'] as num?)?.toInt() ?? 0,
      product: Product.fromJson(productJson),
      quantity: (json['quantity'] as num?)?.toInt() ?? 0,
      unitPrice: (json['unitPrice'] as num?)?.toDouble() ??
          ((productJson['price'] as num?)?.toDouble() ?? 0),
    );
  }
}

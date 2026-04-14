import 'product.dart';

class CartItem {
  CartItem({
    this.id,
    this.cartId,
    required this.product,
    this.quantity = 1,
  });

  final int? id;
  final int? cartId;
  final Product product;
  int quantity;

  double get total => quantity * product.price;

  factory CartItem.fromJson(Map<String, dynamic> json) {
    return CartItem(
      id: json['id'] as int?,
      cartId: json['cartId'] as int?,
      quantity: json['quantity'] as int? ?? 1,
      product: Product.fromJson(json['product'] as Map<String, dynamic>),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      if (cartId != null) 'cart': {'id': cartId},
      'product': {'id': product.id},
      'quantity': quantity,
    };
  }
}

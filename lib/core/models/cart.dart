import 'cart_item.dart';

class Cart {
  Cart({
    required this.id,
    required this.userId,
    required this.items,
  });

  final int id;
  final int userId;
  final List<CartItem> items;

  double get subtotal => items.fold(0, (total, item) => total + item.total);

  factory Cart.fromJson(Map<String, dynamic> json) {
    final itemsJson =
        json['items'] as List? ?? json['cartItems'] as List? ?? [];
    return Cart(
      id: json['id'] as int,
      userId: json['userId'] as int? ?? json['user']?['id'] as int? ?? 0,
      items: itemsJson
          .map((e) => CartItem.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}

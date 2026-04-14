import 'order_item.dart';
import 'user.dart';

class Order {
  Order({
    required this.id,
    this.status,
    this.totalAmount = 0,
    this.orderDate,
    this.user,
    this.items = const [],
  });

  final int id;
  final String? status;
  final double totalAmount;
  final DateTime? orderDate;
  final UserModel? user;
  final List<OrderItemModel> items;

  factory Order.fromJson(Map<String, dynamic> json) {
    final itemsJson =
        json['items'] as List? ?? json['orderItems'] as List? ?? [];
    return Order(
      id: json['id'] as int,
      status: json['status']?.toString(),
      totalAmount: (json['totalAmount'] as num?)?.toDouble() ?? 0,
      orderDate: json['orderDate'] != null
          ? DateTime.tryParse(json['orderDate'].toString())
          : null,
      user: json['user'] != null
          ? UserModel.fromJson(json['user'] as Map<String, dynamic>)
          : null,
      items: itemsJson
          .map((e) => OrderItemModel.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}

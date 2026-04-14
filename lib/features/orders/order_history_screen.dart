import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../core/models/order.dart';
import '../../core/services/checkout_service.dart';
import '../auth/auth_controller.dart';

class OrderHistoryScreen extends StatefulWidget {
  const OrderHistoryScreen({super.key});

  @override
  State<OrderHistoryScreen> createState() => _OrderHistoryScreenState();
}

class _OrderHistoryScreenState extends State<OrderHistoryScreen> {
  late Future<List<Order>> _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<List<Order>> _load() {
    final auth = context.read<AuthController>();
    final checkoutService = context.read<CheckoutService>()
      ..updateToken(auth.token);
    final userId = auth.currentUser?.id;
    if (userId == null) return Future.value(const <Order>[]);
    return checkoutService.fetchByUser(userId);
  }

  Future<void> _refresh() async {
    final next = _load();
    setState(() => _future = next);
    await next;
  }

  @override
  Widget build(BuildContext context) {
    final currency = NumberFormat.simpleCurrency();
    return Scaffold(
      appBar: AppBar(title: const Text('Order History')),
      body: RefreshIndicator(
        onRefresh: _refresh,
        child: FutureBuilder<List<Order>>(
          future: _future,
          builder: (context, snapshot) {
            final orders = snapshot.data ?? const <Order>[];
            if (snapshot.hasError) {
              return ListView(
                children: [
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Text('Load orders failed: ${snapshot.error}'),
                  )
                ],
              );
            }
            if (!snapshot.hasData) {
              return const Center(child: CircularProgressIndicator());
            }
            if (orders.isEmpty) {
              return ListView(
                children: const [
                  Padding(
                    padding: EdgeInsets.all(16),
                    child: Card(
                        child: Padding(
                      padding: EdgeInsets.all(16),
                      child: Text('No orders yet.'),
                    )),
                  )
                ],
              );
            }
            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: orders.length,
              itemBuilder: (context, index) {
                final order = orders[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ExpansionTile(
                    title: Text('Order #${order.id}'),
                    subtitle: Text(order.status ?? 'PENDING'),
                    trailing: Text(currency.format(order.totalAmount)),
                    children: [
                      if (order.orderDate != null)
                        ListTile(title: Text('Date: ${order.orderDate}')),
                      ...order.items.map(
                        (item) => ListTile(
                          title: Text(item.product.name),
                          subtitle: Text('Qty: ${item.quantity}'),
                          trailing: Text(currency.format(item.subtotal)),
                        ),
                      ),
                    ],
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../core/services/checkout_service.dart';
import '../auth/auth_controller.dart';
import '../cart/cart_controller.dart';
import '../catalog/catalog_screen.dart';
import '../orders/order_history_screen.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  final Map<int, TextEditingController> _qtyControllers = {};
  bool _checkoutJustCreated = false;

  @override
  void dispose() {
    for (final controller in _qtyControllers.values) {
      controller.dispose();
    }
    super.dispose();
  }

  TextEditingController _controllerFor(int itemId, int quantity) {
    final controller = _qtyControllers.putIfAbsent(
      itemId,
      () => TextEditingController(text: quantity.toString()),
    );
    if (controller.text != quantity.toString()) {
      controller.text = quantity.toString();
    }
    return controller;
  }

  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat.simpleCurrency();
    final checkoutService = context.read<CheckoutService>();
    final auth = context.read<AuthController>();

    return Scaffold(
      backgroundColor: const Color(0xFFEAeded),
      appBar: AppBar(title: const Text('Your Cart')),
      body: Consumer<CartController>(
        builder: (context, cart, _) {
          if (cart.items.isEmpty) {
            if (_checkoutJustCreated) {
              return Center(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.check_circle_outline,
                          size: 72, color: Colors.green),
                      const SizedBox(height: 16),
                      const Text(
                        'Checkout created successfully',
                        style: TextStyle(
                            fontSize: 22, fontWeight: FontWeight.bold),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Your cart is now empty because the order was created.',
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 20),
                      Wrap(
                        spacing: 12,
                        runSpacing: 12,
                        alignment: WrapAlignment.center,
                        children: [
                          OutlinedButton(
                            onPressed: () => Navigator.of(context).push(
                              MaterialPageRoute(
                                  builder: (_) => const CatalogScreen()),
                            ),
                            child: const Text('Continue shopping'),
                          ),
                          FilledButton(
                            onPressed: () {
                              Navigator.of(context).push(
                                MaterialPageRoute(
                                  builder: (_) => const OrderHistoryScreen(),
                                ),
                              );
                            },
                            child: const Text('View orders'),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            }

            return const Center(child: Text('Cart is empty.'));
          }

          if (_checkoutJustCreated) {
            WidgetsBinding.instance.addPostFrameCallback((_) {
              if (mounted) {
                setState(() {
                  _checkoutJustCreated = false;
                });
              }
            });
          }

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Your Cart',
                      style: Theme.of(context).textTheme.headlineSmall),
                  OutlinedButton.icon(
                    onPressed: () async {
                      final confirmed = await showDialog<bool>(
                        context: context,
                        builder: (dialogContext) => AlertDialog(
                          title: const Text('Clear cart'),
                          content: const Text('Clear your cart?'),
                          actions: [
                            TextButton(
                              onPressed: () =>
                                  Navigator.of(dialogContext).pop(false),
                              child: const Text('Cancel'),
                            ),
                            FilledButton(
                              onPressed: () =>
                                  Navigator.of(dialogContext).pop(true),
                              child: const Text('Clear'),
                            ),
                          ],
                        ),
                      );
                      if (confirmed == true) {
                        await cart.clear();
                        if (mounted) {
                          setState(() {
                            _checkoutJustCreated = false;
                          });
                        }
                      }
                    },
                    icon: const Icon(Icons.delete_outline),
                    label: const Text('Clear'),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              ...cart.items.map(
                (item) {
                  final qtyController =
                      _controllerFor(item.id ?? item.product.id, item.quantity);
                  return Card(
                    margin: const EdgeInsets.only(bottom: 12),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: [
                          Row(
                            children: [
                              CircleAvatar(
                                radius: 24,
                                child: Text(item.product.name.isNotEmpty
                                    ? item.product.name[0].toUpperCase()
                                    : '?'),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(item.product.name,
                                        style: const TextStyle(
                                            fontWeight: FontWeight.bold)),
                                    const SizedBox(height: 4),
                                    Text(formatter.format(item.product.price)),
                                  ],
                                ),
                              ),
                              Text(formatter.format(item.total)),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Expanded(
                                child: TextField(
                                  controller: qtyController,
                                  keyboardType: TextInputType.number,
                                  decoration: const InputDecoration(
                                    labelText: 'Quantity',
                                    border: OutlineInputBorder(),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              FilledButton(
                                onPressed: () async {
                                  final newQty =
                                      int.tryParse(qtyController.text) ??
                                          item.quantity;
                                  final stock = item.product.stock ?? 0;
                                  if (newQty < 0) return;
                                  if (stock > 0 && newQty > stock) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(
                                          content: Text(
                                              'Quantity exceeds available stock')),
                                    );
                                    return;
                                  }
                                  try {
                                    await cart.setQuantity(
                                        item.product, newQty);
                                  } catch (e) {
                                    if (!context.mounted) return;
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                          content: Text(
                                              'Update cart item failed: $e')),
                                    );
                                  }
                                },
                                child: const Text('Update'),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Total',
                              style: TextStyle(
                                  fontSize: 18, fontWeight: FontWeight.bold)),
                          Text(formatter.format(cart.total),
                              style: const TextStyle(fontSize: 18)),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton(
                              onPressed: () => Navigator.of(context).push(
                                MaterialPageRoute(
                                    builder: (_) => const CatalogScreen()),
                              ),
                              child: const Text('Continue shopping'),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: FilledButton(
                              onPressed: () async {
                                try {
                                  checkoutService.updateToken(auth.token);
                                  await checkoutService.createFromCart();
                                  await cart.syncFromServer();
                                  if (!context.mounted) return;
                                  setState(() {
                                    _checkoutJustCreated = true;
                                  });
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                        content: Text(
                                            'Checkout created successfully')),
                                  );
                                } catch (e) {
                                  if (!context.mounted) return;
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                        content: Text('Checkout failed: $e')),
                                  );
                                }
                              },
                              child: const Text('Checkout'),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

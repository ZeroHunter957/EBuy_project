import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/models/product.dart';
import '../../core/services/product_service.dart';
import '../auth/auth_controller.dart';
import 'seller_product_form_screen.dart';
import 'seller_products_controller.dart';

class SellerProductsScreen extends StatelessWidget {
  const SellerProductsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthController>();
    final productService = context.read<ProductService>();

    return ChangeNotifierProvider(
      create: (_) => SellerProductsController(
        productService,
        sellerId: auth.currentUser?.id,
        token: auth.token,
      )..load(),
      child: const _SellerProductsView(),
    );
  }
}

class _SellerProductsView extends StatelessWidget {
  const _SellerProductsView();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Products')),
      body: Consumer<SellerProductsController>(
        builder: (context, controller, _) {
          if (controller.sellerId == null) {
            return const Center(child: Text('Seller profile not found.'));
          }
          if (controller.isLoading && controller.filteredProducts.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }
          return Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    TextField(
                      decoration: const InputDecoration(
                        prefixIcon: Icon(Icons.search),
                        hintText: 'Search products',
                      ),
                      onChanged: controller.updateSearch,
                    ),
                    const SizedBox(height: 12),
                    _StatusFilter(
                      current: controller.statusFilter,
                      onChanged: controller.updateStatusFilter,
                    ),
                  ],
                ),
              ),
              Expanded(
                child: RefreshIndicator(
                  onRefresh: controller.load,
                  child: ListView.builder(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    itemCount: controller.filteredProducts.length,
                    itemBuilder: (context, index) {
                      final product = controller.filteredProducts[index];
                      return _SellerProductTile(product: product);
                    },
                  ),
                ),
              ),
              if (controller.filteredProducts.isEmpty && !controller.isLoading)
                const Padding(
                  padding: EdgeInsets.all(32),
                  child: Text('No products match your filters.'),
                ),
            ],
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => const SellerProductFormScreen()),
          );
        },
        icon: const Icon(Icons.add_circle_outline),
        label: const Text('Add product'),
      ),
    );
  }
}

class _StatusFilter extends StatelessWidget {
  const _StatusFilter({required this.current, required this.onChanged});

  final String current;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    final filters = ['ALL', 'APPROVED', 'PENDING', 'REJECTED'];
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: filters
            .map(
              (value) => Padding(
                padding: const EdgeInsets.only(right: 8),
                child: ChoiceChip(
                  selected: current == value,
                  label: Text(value),
                  onSelected: (_) => onChanged(value),
                ),
              ),
            )
            .toList(),
      ),
    );
  }
}

class _SellerProductTile extends StatelessWidget {
  const _SellerProductTile({required this.product});

  final Product product;

  @override
  Widget build(BuildContext context) {
    final status = (product.status ?? 'PENDING').toUpperCase();
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(
            child: Text(
                product.name.isNotEmpty ? product.name[0].toUpperCase() : '?')),
        title: Text(product.name),
        subtitle: Text(
            'Stock ${product.stock ?? 0} • ${product.categories.map((c) => c.name).join(', ')}'),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text('\$${product.price.toStringAsFixed(2)}',
                style: const TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            _StatusBadge(status: status),
          ],
        ),
        onTap: () async {
          try {
            final productService = context.read<ProductService>();
            final controller = context.read<SellerProductsController>();
            final fullProduct = await productService.fetchById(product.id);
            if (!context.mounted) return;
            final updated = await Navigator.of(context).push<Product>(
              MaterialPageRoute(
                builder: (_) => SellerProductFormScreen(product: fullProduct),
              ),
            );
            if (updated != null && context.mounted) {
              controller.load();
            }
          } catch (e) {
            if (!context.mounted) return;
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Failed to load product details: $e')),
            );
          }
        },
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  const _StatusBadge({required this.status});

  final String status;

  @override
  Widget build(BuildContext context) {
    Color color;
    switch (status) {
      case 'APPROVED':
        color = Colors.green;
        break;
      case 'REJECTED':
        color = Colors.red;
        break;
      default:
        color = Colors.orange;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(status,
          style: TextStyle(color: color, fontWeight: FontWeight.w600)),
    );
  }
}

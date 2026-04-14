import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../core/constants.dart';
import '../../core/models/order.dart';
import '../../core/models/product.dart';
import '../../core/models/review.dart';
import '../../core/services/checkout_service.dart';
import '../../core/services/product_service.dart';
import '../../core/services/review_service.dart';
import '../auth/auth_controller.dart';
import '../profile/profile_screen.dart';
import 'seller_dashboard_controller.dart';
import 'seller_product_form_screen.dart';
import 'seller_products_screen.dart';

class SellerShell extends StatefulWidget {
  const SellerShell({super.key});

  @override
  State<SellerShell> createState() => _SellerShellState();
}

class _SellerShellState extends State<SellerShell> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const SellerDashboardScreen(),
    const SellerProductsScreen(),
    const SellerOrdersScreen(),
    const SellerReviewsScreen(),
    const ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_currentIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) => setState(() => _currentIndex = index),
        destinations: const [
          NavigationDestination(
              icon: Icon(Icons.dashboard_outlined), label: 'Dashboard'),
          NavigationDestination(
              icon: Icon(Icons.inventory_2_outlined), label: 'Products'),
          NavigationDestination(
              icon: Icon(Icons.receipt_long_outlined), label: 'Orders'),
          NavigationDestination(
              icon: Icon(Icons.forum_outlined), label: 'Reviews'),
          NavigationDestination(
              icon: Icon(Icons.person_outline), label: 'Profile'),
        ],
      ),
    );
  }
}

class SellerDashboardScreen extends StatelessWidget {
  const SellerDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthController>();
    final productService = context.read<ProductService>();
    final checkoutService = context.read<CheckoutService>();

    return ChangeNotifierProvider(
      create: (_) => SellerDashboardController(
        productService,
        checkoutService: checkoutService,
        sellerId: auth.currentUser?.id,
        token: auth.token,
      )..load(),
      child: const _SellerDashboardView(),
    );
  }
}

class _SellerDashboardView extends StatefulWidget {
  const _SellerDashboardView();

  @override
  State<_SellerDashboardView> createState() => _SellerDashboardViewState();
}

class _SellerDashboardViewState extends State<_SellerDashboardView> {
  final _searchController = TextEditingController();
  String _tab = 'ALL';
  String _sortKey = 'id_desc';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Seller Dashboard')),
      body: Consumer<SellerDashboardController>(
        builder: (context, controller, _) {
          if (controller.sellerId == null) {
            return const Center(
                child: Text('Missing seller profile information.'));
          }

          if (controller.isLoading && controller.products.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          final filteredProducts = controller.filteredProducts(
            tab: _tab,
            searchName: _searchController.text,
            sortKey: _sortKey,
          );

          return RefreshIndicator(
            onRefresh: controller.load,
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                _SellerStats(controller: controller),
                const SizedBox(height: 16),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                  'Pending approval: ${controller.pendingCount}'),
                              const SizedBox(height: 4),
                              Text(
                                'Your orders: ${controller.ordersCount}',
                                style: Theme.of(context)
                                    .textTheme
                                    .bodyMedium
                                    ?.copyWith(color: Colors.black54),
                              ),
                            ],
                          ),
                        ),
                        OutlinedButton(
                          onPressed: () => Navigator.of(context).push(
                            MaterialPageRoute(
                                builder: (_) => const SellerOrdersScreen()),
                          ),
                          child: const Text('View orders'),
                        ),
                      ],
                    ),
                  ),
                ),
                if (controller.error != null) ...[
                  const SizedBox(height: 16),
                  _ErrorNotice(
                      message: controller.error!, onRetry: controller.load),
                ],
                const SizedBox(height: 16),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: ['ALL', 'PENDING', 'APPROVED', 'REJECTED']
                      .map(
                        (tab) => ChoiceChip(
                          label: Text(tab),
                          selected: _tab == tab,
                          onSelected: (_) => setState(() => _tab = tab),
                        ),
                      )
                      .toList(),
                ),
                const SizedBox(height: 16),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        TextField(
                          controller: _searchController,
                          decoration: const InputDecoration(
                            prefixIcon: Icon(Icons.search),
                            hintText: 'Search by name...',
                          ),
                          onChanged: (_) => setState(() {}),
                        ),
                        const SizedBox(height: 12),
                        DropdownButtonFormField<String>(
                          initialValue: _sortKey,
                          decoration: const InputDecoration(labelText: 'Sort'),
                          items: const [
                            DropdownMenuItem(
                                value: 'id_desc', child: Text('Newest')),
                            DropdownMenuItem(
                                value: 'id_asc', child: Text('Oldest')),
                            DropdownMenuItem(
                                value: 'price_asc', child: Text('Price (asc)')),
                            DropdownMenuItem(
                                value: 'price_desc',
                                child: Text('Price (desc)')),
                            DropdownMenuItem(
                                value: 'stock_asc', child: Text('Stock (asc)')),
                            DropdownMenuItem(
                                value: 'stock_desc',
                                child: Text('Stock (desc)')),
                          ],
                          onChanged: (value) =>
                              setState(() => _sortKey = value ?? 'id_desc'),
                        ),
                        const SizedBox(height: 12),
                        Align(
                          alignment: Alignment.centerRight,
                          child: TextButton(
                            onPressed: () {
                              setState(() {
                                _searchController.clear();
                                _sortKey = 'id_desc';
                              });
                            },
                            child: const Text('Reset'),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                Text('My products',
                    style: Theme.of(context).textTheme.titleLarge),
                const SizedBox(height: 12),
                ...filteredProducts
                    .map((product) => _ProductCard(product: product)),
                if (filteredProducts.isEmpty)
                  Container(
                    padding: const EdgeInsets.all(32),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.grey.shade200),
                    ),
                    alignment: Alignment.center,
                    child:
                        const Text('No products match your current filters.'),
                  ),
              ],
            ),
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
        label: const Text('New product'),
      ),
    );
  }
}

class _SellerStats extends StatelessWidget {
  const _SellerStats({required this.controller});

  final SellerDashboardController controller;

  @override
  Widget build(BuildContext context) {
    final total = controller.products.length;
    final pending = controller.pendingCount;
    final outOfStock =
        controller.products.where((p) => (p.stock ?? 0) <= 0).length;

    return Row(
      children: [
        _StatCard(
            label: 'Active listings',
            value: total.toString(),
            icon: Icons.inventory_2_outlined),
        const SizedBox(width: 12),
        _StatCard(
            label: 'Awaiting approval',
            value: pending.toString(),
            icon: Icons.verified_outlined,
            color: Colors.orange.shade600),
        const SizedBox(width: 12),
        _StatCard(
            label: 'Out of stock',
            value: outOfStock.toString(),
            icon: Icons.warning_amber_outlined,
            color: Colors.red.shade400),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard(
      {required this.label,
      required this.value,
      required this.icon,
      this.color});

  final String label;
  final String value;
  final IconData icon;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          color: (color ?? Theme.of(context).colorScheme.primary)
              .withValues(alpha: 0.1),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: color ?? Theme.of(context).colorScheme.primary),
            const SizedBox(height: 8),
            Text(value,
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    color: color ?? Theme.of(context).colorScheme.primary)),
            const SizedBox(height: 4),
            Text(label,
                style: Theme.of(context)
                    .textTheme
                    .bodyMedium
                    ?.copyWith(color: Colors.black54)),
          ],
        ),
      ),
    );
  }
}

class _ProductCard extends StatelessWidget {
  const _ProductCard({required this.product});

  final Product product;

  @override
  Widget build(BuildContext context) {
    final imageUrl = ApiConfig.resolveMediaUrl(product.primaryImageUrl);
    final status = (product.status ?? 'PENDING').toUpperCase();
    final isRejected = status == 'REJECTED';

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (imageUrl != null)
            CachedNetworkImage(
              imageUrl: imageUrl,
              width: double.infinity,
              height: 180,
              fit: BoxFit.cover,
              errorWidget: (_, __, ___) => Container(
                height: 180,
                color: Colors.grey.shade200,
                alignment: Alignment.center,
                child: const Icon(Icons.broken_image_outlined),
              ),
            ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(product.name,
                    style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 8),
                _StatusBadge(status: status),
                const SizedBox(height: 8),
                Text('Price: \$${product.price.toStringAsFixed(2)}'),
                Text('Stock: ${product.stock ?? 0}'),
                const SizedBox(height: 12),
                OutlinedButton(
                  onPressed: isRejected
                      ? null
                      : () async {
                          try {
                            final fullProduct = await context
                                .read<ProductService>()
                                .fetchById(product.id);
                            if (!context.mounted) return;
                            final updated =
                                await Navigator.of(context).push<Product>(
                              MaterialPageRoute(
                                  builder: (_) => SellerProductFormScreen(
                                      product: fullProduct)),
                            );
                            if (updated != null && context.mounted) {
                              context.read<SellerDashboardController>().load();
                            }
                          } catch (e) {
                            if (!context.mounted) return;
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                  content: Text(
                                      'Failed to load product details: $e')),
                            );
                          }
                        },
                  child: Text(isRejected
                      ? 'Rejected products cannot be edited'
                      : 'Edit'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ErrorNotice extends StatelessWidget {
  const _ErrorNotice({required this.message, required this.onRetry});

  final String message;
  final Future<void> Function() onRetry;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        color: Colors.red.shade50,
        border: Border.all(color: Colors.red.shade200),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
              child: Text(message, style: const TextStyle(color: Colors.red))),
          const SizedBox(width: 12),
          TextButton.icon(
            onPressed: onRetry,
            icon: const Icon(Icons.refresh),
            label: const Text('Retry'),
          ),
        ],
      ),
    );
  }
}

class SellerOrdersScreen extends StatefulWidget {
  const SellerOrdersScreen({super.key});

  @override
  State<SellerOrdersScreen> createState() => _SellerOrdersScreenState();
}

class _SellerOrdersScreenState extends State<SellerOrdersScreen> {
  String _filterProductId = 'all';

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthController>();
    final checkoutService = context.read<CheckoutService>()
      ..updateToken(auth.token);
    final currency = NumberFormat.simpleCurrency();

    return FutureBuilder<List<Order>>(
      future: checkoutService.fetchSellerOrders(),
      builder: (context, snapshot) {
        if (snapshot.hasError) {
          return Scaffold(
            appBar: AppBar(title: const Text('Seller Orders')),
            body: Center(child: Text(snapshot.error.toString())),
          );
        }
        if (!snapshot.hasData) {
          return Scaffold(
            appBar: AppBar(title: const Text('Seller Orders')),
            body: const Center(child: CircularProgressIndicator()),
          );
        }

        final orders = snapshot.data!;
        final productOptions = <int, String>{};
        for (final order in orders) {
          for (final item in order.items) {
            productOptions[item.product.id] = item.product.name;
          }
        }

        final filteredOrders = orders.where((order) {
          if (_filterProductId == 'all') return true;
          final productId = int.tryParse(_filterProductId);
          return order.items.any((item) => item.product.id == productId);
        }).toList();

        return Scaffold(
          appBar: AppBar(title: const Text('Seller Orders')),
          body: orders.isEmpty
              ? const Center(child: Text('No seller orders yet.'))
              : ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    if (productOptions.isNotEmpty)
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: DropdownButtonFormField<String>(
                            initialValue: _filterProductId,
                            decoration: const InputDecoration(
                                labelText: 'Filter by product'),
                            items: [
                              const DropdownMenuItem(
                                  value: 'all', child: Text('All products')),
                              ...productOptions.entries.map(
                                (entry) => DropdownMenuItem(
                                  value: '${entry.key}',
                                  child: Text(entry.value),
                                ),
                              ),
                            ],
                            onChanged: (value) => setState(
                                () => _filterProductId = value ?? 'all'),
                          ),
                        ),
                      ),
                    const SizedBox(height: 12),
                    if (filteredOrders.isEmpty)
                      const Center(child: Text('No matching orders.'))
                    else
                      ...filteredOrders.map(
                        (order) => Card(
                          margin: const EdgeInsets.only(bottom: 12),
                          child: ListTile(
                            title: Text('Order #${order.id}'),
                            subtitle: Text(order.status ?? 'PENDING'),
                            trailing: Text(currency.format(order.totalAmount)),
                            onTap: () => Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) =>
                                    SellerOrderDetailScreen(orderId: order.id),
                              ),
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
        );
      },
    );
  }
}

class SellerOrderDetailScreen extends StatelessWidget {
  const SellerOrderDetailScreen({super.key, required this.orderId});

  final int orderId;

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthController>();
    final checkoutService = context.read<CheckoutService>()
      ..updateToken(auth.token);
    final currency = NumberFormat.simpleCurrency();

    return FutureBuilder<Order>(
      future: checkoutService.fetchSellerOrderById(orderId),
      builder: (context, snapshot) {
        if (snapshot.hasError) {
          return Scaffold(
            appBar: AppBar(title: Text('Order #$orderId')),
            body: Center(child: Text(snapshot.error.toString())),
          );
        }
        if (!snapshot.hasData) {
          return Scaffold(
            appBar: AppBar(title: Text('Order #$orderId')),
            body: const Center(child: CircularProgressIndicator()),
          );
        }

        final order = snapshot.data!;
        return Scaffold(
          appBar: AppBar(title: Text('Order #${order.id}')),
          body: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Wrap(
                    spacing: 24,
                    runSpacing: 12,
                    children: [
                      _OrderMeta(label: 'Status', value: order.status ?? '—'),
                      _OrderMeta(
                          label: 'Total',
                          value: currency.format(order.totalAmount)),
                      _OrderMeta(
                        label: 'Order date',
                        value: order.orderDate != null
                            ? DateFormat('dd/MM/yyyy HH:mm')
                                .format(order.orderDate!)
                            : '—',
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Text('Items', style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 12),
              ...order.items.map(
                (item) => Card(
                  child: ListTile(
                    title: Text(item.product.name),
                    subtitle: Text(
                        'Qty: ${item.quantity} • Unit: ${currency.format(item.unitPrice)}'),
                    trailing: Text(currency.format(item.total)),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _OrderMeta extends StatelessWidget {
  const _OrderMeta({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: Theme.of(context)
                .textTheme
                .bodySmall
                ?.copyWith(color: Colors.black54)),
        const SizedBox(height: 4),
        Text(value, style: Theme.of(context).textTheme.titleMedium),
      ],
    );
  }
}

class SellerReviewsScreen extends StatelessWidget {
  const SellerReviewsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthController>();
    final reviewService = context.read<ReviewService>()
      ..updateToken(auth.token);

    return FutureBuilder<List<Review>>(
      future: reviewService.bySeller(),
      builder: (context, snapshot) {
        if (snapshot.hasError) {
          return Scaffold(
            appBar: AppBar(title: const Text('Seller Reviews')),
            body: Center(child: Text(snapshot.error.toString())),
          );
        }
        if (!snapshot.hasData) {
          return Scaffold(
            appBar: AppBar(title: const Text('Seller Reviews')),
            body: const Center(child: CircularProgressIndicator()),
          );
        }

        final reviews = snapshot.data!;
        return Scaffold(
          appBar: AppBar(title: const Text('Seller Reviews')),
          body: reviews.isEmpty
              ? const Center(child: Text('No reviews yet for your products.'))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: reviews.length,
                  itemBuilder: (context, index) {
                    final review = reviews[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    review.product?.name ?? 'Product',
                                    style:
                                        Theme.of(context).textTheme.titleMedium,
                                  ),
                                ),
                                Chip(label: Text('${review.rating}/5')),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'From: ${review.user?.username ?? review.user?.email ?? '—'}',
                              style: Theme.of(context)
                                  .textTheme
                                  .bodyMedium
                                  ?.copyWith(color: Colors.black54),
                            ),
                            const SizedBox(height: 6),
                            Text(review.comment.isEmpty ? '—' : review.comment),
                          ],
                        ),
                      ),
                    );
                  },
                ),
        );
      },
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

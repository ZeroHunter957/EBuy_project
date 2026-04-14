import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../core/constants.dart';
import '../../core/models/category.dart';
import '../../core/models/feedback_entry.dart';
import '../../core/models/order.dart';
import '../../core/models/product.dart';
import '../../core/models/seller_verification.dart';
import '../../core/models/user.dart';
import '../../core/services/category_service.dart';
import '../../core/services/checkout_service.dart';
import '../../core/services/feedback_service.dart';
import '../../core/services/product_service.dart';
import '../../core/services/seller_verification_service.dart';
import '../../core/services/user_service.dart';
import '../auth/auth_controller.dart';
import '../seller/seller_product_form_screen.dart';

class AdminShell extends StatefulWidget {
  const AdminShell({super.key});

  @override
  State<AdminShell> createState() => _AdminShellState();
}

class _AdminShellState extends State<AdminShell> {
  int _selectedIndex = 0;

  static const _labels = [
    'Overview',
    'Products',
    'Categories',
    'Orders',
    'Users',
    'Verify Sellers',
    'Feedback',
  ];

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthController>();
    final productService = context.read<ProductService>()
      ..updateToken(auth.token);
    final categoryService = context.read<CategoryService>()
      ..updateToken(auth.token);
    final checkoutService = context.read<CheckoutService>()
      ..updateToken(auth.token);
    final userService = context.read<UserService>()..updateToken(auth.token);
    final feedbackService = context.read<FeedbackService>()
      ..updateToken(auth.token);
    final sellerVerificationService = context.read<SellerVerificationService>()
      ..updateToken(auth.token);

    final screens = [
      _AdminOverviewScreen(
        productService: productService,
        checkoutService: checkoutService,
        userService: userService,
        feedbackService: feedbackService,
      ),
      _AdminProductsScreen(
          productService: productService, adminId: auth.currentUser?.id),
      _AdminCategoriesScreen(categoryService: categoryService),
      _AdminOrdersScreen(checkoutService: checkoutService),
      _AdminUsersScreen(userService: userService),
      _AdminSellerVerificationScreen(
          verificationService: sellerVerificationService),
      _AdminFeedbackScreen(feedbackService: feedbackService),
    ];

    return Scaffold(
      appBar: AppBar(
        title: Text(_labels[_selectedIndex]),
        actions: [
          IconButton(
            tooltip: 'Sign out',
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await showDialog<void>(
                context: context,
                builder: (dialogContext) => AlertDialog(
                  title: const Text('Sign out'),
                  content: const Text(
                      'Do you want to log out of the admin account?'),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.of(dialogContext).pop(),
                      child: const Text('Cancel'),
                    ),
                    FilledButton(
                      onPressed: () {
                        Navigator.of(dialogContext).pop();
                        context.read<AuthController>().logout();
                      },
                      child: const Text('Log out'),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
      body: screens[_selectedIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (index) =>
            setState(() => _selectedIndex = index),
        destinations: const [
          NavigationDestination(
              icon: Icon(Icons.dashboard_outlined), label: 'Overview'),
          NavigationDestination(
              icon: Icon(Icons.shopping_bag_outlined), label: 'Products'),
          NavigationDestination(
              icon: Icon(Icons.category_outlined), label: 'Categories'),
          NavigationDestination(
              icon: Icon(Icons.receipt_long_outlined), label: 'Orders'),
          NavigationDestination(
              icon: Icon(Icons.people_alt_outlined), label: 'Users'),
          NavigationDestination(
              icon: Icon(Icons.verified_user_outlined), label: 'Verify'),
          NavigationDestination(
              icon: Icon(Icons.forum_outlined), label: 'Feedback'),
        ],
      ),
    );
  }
}

class _AdminOverviewScreen extends StatefulWidget {
  const _AdminOverviewScreen({
    required this.productService,
    required this.checkoutService,
    required this.userService,
    required this.feedbackService,
  });

  final ProductService productService;
  final CheckoutService checkoutService;
  final UserService userService;
  final FeedbackService feedbackService;

  @override
  State<_AdminOverviewScreen> createState() => _AdminOverviewScreenState();
}

class _AdminOverviewScreenState extends State<_AdminOverviewScreen> {
  late Future<_OverviewData> _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<_OverviewData>(
      future: _future,
      builder: (context, snapshot) {
        if (!snapshot.hasData) {
          if (snapshot.hasError) {
            return _ErrorState(message: snapshot.error.toString());
          }
          return const Center(child: CircularProgressIndicator());
        }

        final data = snapshot.data!;
        return RefreshIndicator(
          onRefresh: () async {
            final next = _load();
            setState(() => _future = next);
            await next;
          },
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              LayoutBuilder(
                builder: (context, constraints) {
                  final cardWidth = (constraints.maxWidth - 12) / 2;
                  return Wrap(
                    spacing: 12,
                    runSpacing: 12,
                    children: [
                      SizedBox(
                        width: cardWidth,
                        child: _MetricCard(
                            label: 'Products',
                            value: '${data.products.length}',
                            icon: Icons.shopping_bag_outlined),
                      ),
                      SizedBox(
                        width: cardWidth,
                        child: _MetricCard(
                            label: 'Pending approval',
                            value: '${data.pendingProducts.length}',
                            icon: Icons.pending_actions_outlined,
                            color: Colors.orange),
                      ),
                      SizedBox(
                        width: cardWidth,
                        child: _MetricCard(
                            label: 'Orders',
                            value: '${data.orders.length}',
                            icon: Icons.receipt_long_outlined),
                      ),
                      SizedBox(
                        width: cardWidth,
                        child: _MetricCard(
                            label: 'Users',
                            value: '${data.users.length}',
                            icon: Icons.people_alt_outlined),
                      ),
                      SizedBox(
                        width: cardWidth,
                        child: _MetricCard(
                            label: 'Feedback',
                            value: '${data.feedback.length}',
                            icon: Icons.forum_outlined),
                      ),
                    ],
                  );
                },
              ),
              const SizedBox(height: 24),
              Text('Pending products',
                  style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 12),
              if (data.pendingProducts.isEmpty)
                const _EmptyState(message: 'No products waiting for approval.')
              else
                ...data.pendingProducts.take(5).map(
                      (product) => Card(
                        child: ListTile(
                          title: Text(product.name),
                          subtitle: Text(product.status ?? 'PENDING'),
                        ),
                      ),
                    ),
            ],
          ),
        );
      },
    );
  }

  Future<_OverviewData> _load() async {
    final results = await Future.wait([
      widget.productService.fetchAll(),
      widget.productService.adminPending(),
      widget.checkoutService.fetchAll(),
      widget.userService.fetchAll(),
      widget.feedbackService.fetchAll(),
    ]);

    return _OverviewData(
      products: results[0] as List<Product>,
      pendingProducts: results[1] as List<Product>,
      orders: results[2] as List<Order>,
      users: results[3] as List<UserModel>,
      feedback: results[4] as List<FeedbackEntry>,
    );
  }
}

class _AdminProductsScreen extends StatefulWidget {
  const _AdminProductsScreen(
      {required this.productService, required this.adminId});

  final ProductService productService;
  final int? adminId;

  @override
  State<_AdminProductsScreen> createState() => _AdminProductsScreenState();
}

class _AdminProductsScreenState extends State<_AdminProductsScreen> {
  final _searchController = TextEditingController();
  List<Product> _products = [];
  bool _loading = true;
  bool _pendingOnly = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    if (!mounted) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final products = _pendingOnly
          ? await widget.productService.adminPending(size: 100)
          : await widget.productService.fetchAll();
      if (mounted) setState(() => _products = products);
    } catch (e) {
      if (mounted) _error = e.toString();
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final query = _searchController.text.trim().toLowerCase();
    final filtered =
        _products.where((p) => p.name.toLowerCase().contains(query)).toList();

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _searchController,
                    decoration: const InputDecoration(
                        prefixIcon: Icon(Icons.search),
                        hintText: 'Search products'),
                    onChanged: (_) => setState(() {}),
                  ),
                ),
                const SizedBox(width: 12),
                FilterChip(
                  label: const Text('Pending only'),
                  selected: _pendingOnly,
                  onSelected: (value) {
                    setState(() => _pendingOnly = value);
                    _load();
                  },
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (_loading)
              const Center(
                  child: Padding(
                      padding: EdgeInsets.all(24),
                      child: CircularProgressIndicator()))
            else if (_error != null)
              _ErrorState(message: _error!)
            else if (filtered.isEmpty)
              const _EmptyState(message: 'No products found.')
            else
              ...filtered.map(
                (product) => Card(
                  child: ListTile(
                    leading: _ProductThumbnail(product: product),
                    title: Text(product.name),
                    subtitle: Text(
                        '${product.status ?? 'PENDING'} • Stock ${product.stock ?? 0}'),
                    trailing: PopupMenuButton<String>(
                      onSelected: (value) async {
                        if (value == 'edit') {
                          final fullProduct =
                              await widget.productService.fetchById(product.id);
                          if (!context.mounted) return;
                          final updated =
                              await Navigator.of(context).push<Product>(
                            MaterialPageRoute(
                                builder: (_) => SellerProductFormScreen(
                                    product: fullProduct)),
                          );
                          if (updated != null) _load();
                        }
                        if (value == 'delete') {
                          await widget.productService.delete(product.id);
                          _load();
                        }
                        if (value == 'approve') {
                          await widget.productService.approve(product.id);
                          _load();
                        }
                        if (value == 'reject') {
                          await widget.productService.reject(product.id);
                          _load();
                        }
                      },
                      itemBuilder: (context) => [
                        const PopupMenuItem(value: 'edit', child: Text('Edit')),
                        if ((product.status ?? '').toUpperCase() != 'APPROVED')
                          const PopupMenuItem(
                              value: 'approve', child: Text('Approve')),
                        if ((product.status ?? '').toUpperCase() != 'REJECTED')
                          const PopupMenuItem(
                              value: 'reject', child: Text('Reject')),
                        const PopupMenuItem(
                            value: 'delete', child: Text('Disable/Delete')),
                      ],
                    ),
                    onTap: () => showDialog(
                      context: context,
                      builder: (_) => AlertDialog(
                        title: Text(product.name),
                        content: Text(product.description ?? 'No description'),
                      ),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          final created = await Navigator.of(context).push<Product>(
            MaterialPageRoute(builder: (_) => const SellerProductFormScreen()),
          );
          if (created != null) _load();
        },
        icon: const Icon(Icons.add),
        label: const Text('Add product'),
      ),
    );
  }
}

class _AdminCategoriesScreen extends StatefulWidget {
  const _AdminCategoriesScreen({required this.categoryService});

  final CategoryService categoryService;

  @override
  State<_AdminCategoriesScreen> createState() => _AdminCategoriesScreenState();
}

class _AdminCategoriesScreenState extends State<_AdminCategoriesScreen> {
  List<Category> _categories = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    if (!mounted) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final categories = await widget.categoryService.fetchAll();
      if (mounted) setState(() => _categories = categories);
    } catch (e) {
      if (mounted) _error = e.toString();
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _openEditor([Category? category]) async {
    final controller = TextEditingController(text: category?.name ?? '');
    final saved = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: Text(category == null ? 'Add category' : 'Edit category'),
        content: TextField(
            controller: controller,
            decoration: const InputDecoration(labelText: 'Name')),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Cancel')),
          FilledButton(
              onPressed: () => Navigator.pop(context, true),
              child: const Text('Save')),
        ],
      ),
    );
    if (saved != true || controller.text.trim().isEmpty) return;
    if (category == null) {
      await widget.categoryService.create({'name': controller.text.trim()});
    } else {
      await widget.categoryService
          .update(category.id, {'name': controller.text.trim()});
    }
    _load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            if (_loading)
              const Center(
                  child: Padding(
                      padding: EdgeInsets.all(24),
                      child: CircularProgressIndicator()))
            else if (_error != null)
              _ErrorState(message: _error!)
            else if (_categories.isEmpty)
              const _EmptyState(message: 'No categories yet.')
            else
              ..._categories.map(
                (category) => Card(
                  child: ListTile(
                    title: Text(category.name),
                    trailing: Wrap(
                      spacing: 8,
                      children: [
                        IconButton(
                            icon: const Icon(Icons.edit_outlined),
                            onPressed: () => _openEditor(category)),
                        IconButton(
                          icon: const Icon(Icons.delete_outline),
                          onPressed: () async {
                            await widget.categoryService.delete(category.id);
                            _load();
                          },
                        ),
                      ],
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openEditor,
        icon: const Icon(Icons.add),
        label: const Text('Add category'),
      ),
    );
  }
}

class _AdminOrdersScreen extends StatefulWidget {
  const _AdminOrdersScreen({required this.checkoutService});

  final CheckoutService checkoutService;

  @override
  State<_AdminOrdersScreen> createState() => _AdminOrdersScreenState();
}

class _AdminOrdersScreenState extends State<_AdminOrdersScreen> {
  final _currency = NumberFormat.simpleCurrency();
  List<Order> _orders = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    if (!mounted) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final orders = await widget.checkoutService.fetchAll();
      if (mounted) setState(() => _orders = orders);
    } catch (e) {
      if (mounted) _error = e.toString();
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (_loading)
            const Center(
                child: Padding(
                    padding: EdgeInsets.all(24),
                    child: CircularProgressIndicator()))
          else if (_error != null)
            _ErrorState(message: _error!)
          else if (_orders.isEmpty)
            const _EmptyState(message: 'No orders yet.')
          else
            ..._orders.map(
              (order) => Card(
                child: ListTile(
                  title: Text('Order #${order.id}'),
                  subtitle: Text(
                      '${order.user?.username ?? 'Unknown user'} • ${order.status ?? 'PENDING'}'),
                  trailing: Text(_currency.format(order.totalAmount)),
                  onTap: () => showModalBottomSheet(
                    context: context,
                    isScrollControlled: true,
                    builder: (_) => _OrderDetailSheet(
                        order: order,
                        checkoutService: widget.checkoutService,
                        onUpdated: _load),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _AdminUsersScreen extends StatefulWidget {
  const _AdminUsersScreen({required this.userService});

  final UserService userService;

  @override
  State<_AdminUsersScreen> createState() => _AdminUsersScreenState();
}

class _AdminUsersScreenState extends State<_AdminUsersScreen> {
  List<UserModel> _users = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    if (!mounted) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final users = await widget.userService.fetchAll();
      if (mounted) setState(() => _users = users);
    } catch (e) {
      if (mounted) _error = e.toString();
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (_loading)
            const Center(
                child: Padding(
                    padding: EdgeInsets.all(24),
                    child: CircularProgressIndicator()))
          else if (_error != null)
            _ErrorState(message: _error!)
          else if (_users.isEmpty)
            const _EmptyState(message: 'No users found.')
          else
            ..._users.map(
              (user) => Card(
                child: ListTile(
                  title: Text(user.username),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(user.email),
                      const SizedBox(height: 6),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          Chip(label: Text(user.role.name)),
                          if (user.role.name.toUpperCase() == 'SELLER')
                            Chip(
                              avatar: Icon(
                                user.sellerApproved
                                    ? Icons.verified_outlined
                                    : Icons.pending_outlined,
                                size: 18,
                                color: user.sellerApproved
                                    ? Colors.green
                                    : Colors.orange,
                              ),
                              label: Text(user.sellerApproved
                                  ? 'Approved seller'
                                  : 'Pending seller'),
                            ),
                        ],
                      ),
                    ],
                  ),
                  trailing: IconButton(
                    icon: const Icon(Icons.delete_outline),
                    onPressed: () async {
                      await widget.userService.delete(user.id);
                      _load();
                    },
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _AdminSellerVerificationScreen extends StatefulWidget {
  const _AdminSellerVerificationScreen({required this.verificationService});

  final SellerVerificationService verificationService;

  @override
  State<_AdminSellerVerificationScreen> createState() =>
      _AdminSellerVerificationScreenState();
}

class _AdminSellerVerificationScreenState
    extends State<_AdminSellerVerificationScreen> {
  List<SellerVerification> _items = [];
  bool _loading = true;
  String? _error;
  String _filter = 'ALL';
  final Map<int, TextEditingController> _reasonControllers = {};

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    for (final controller in _reasonControllers.values) {
      controller.dispose();
    }
    super.dispose();
  }

  Future<void> _load() async {
    if (!mounted) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final items = await widget.verificationService.fetchAll();
      items.sort((a, b) {
        if ((a.status ?? '').toUpperCase() == 'REJECTED') return 1;
        if ((b.status ?? '').toUpperCase() == 'REJECTED') return -1;
        return 0;
      });
      if (mounted) setState(() => _items = items);
    } catch (e) {
      if (mounted) _error = e.toString();
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  TextEditingController _reasonControllerFor(int userId) {
    return _reasonControllers.putIfAbsent(
        userId, () => TextEditingController());
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _items.where((item) {
      if (_filter == 'ALL') return true;
      return (item.status ?? '').toUpperCase() == _filter;
    }).toList();

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: ['ALL', 'PENDING', 'APPROVED', 'REJECTED']
                .map(
                  (value) => ChoiceChip(
                    label: Text(value),
                    selected: _filter == value,
                    onSelected: (_) => setState(() => _filter = value),
                  ),
                )
                .toList(),
          ),
          const SizedBox(height: 16),
          if (_loading)
            const Center(
                child: Padding(
                    padding: EdgeInsets.all(24),
                    child: CircularProgressIndicator()))
          else if (_error != null)
            _ErrorState(message: _error!)
          else if (filtered.isEmpty)
            const _EmptyState(message: 'No seller verification requests found.')
          else
            ...filtered.map((item) {
              final userId = item.user?.id ?? 0;
              final reasonController = _reasonControllerFor(userId);
              final isProcessed =
                  (item.status ?? '').toUpperCase() != 'PENDING';
              return Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              item.user?.username ?? 'Unknown seller',
                              style: Theme.of(context).textTheme.titleMedium,
                            ),
                          ),
                          _StatusBadge(
                              status: (item.status ?? 'PENDING').toUpperCase()),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text('Business Description',
                          style: Theme.of(context).textTheme.titleSmall),
                      const SizedBox(height: 4),
                      Text(item.businessDescription ??
                          'No business description'),
                      const SizedBox(height: 12),
                      Text('Product Description',
                          style: Theme.of(context).textTheme.titleSmall),
                      const SizedBox(height: 4),
                      Text(item.productDescription ?? 'No product description'),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: _VerificationImageTile(
                              title: 'Citizen ID',
                              imageUrl: item.citizenIdImageUrl,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _VerificationImageTile(
                              title: 'Business Certificate',
                              imageUrl: item.businessCertImageUrl,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: reasonController,
                        minLines: 2,
                        maxLines: 3,
                        decoration: const InputDecoration(
                          labelText: 'Rejection reason',
                          border: OutlineInputBorder(),
                        ),
                      ),
                      if ((item.rejectReason ?? '').isNotEmpty) ...[
                        const SizedBox(height: 8),
                        Text('Previous reason: ${item.rejectReason}'),
                      ],
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: FilledButton(
                              onPressed: isProcessed || userId == 0
                                  ? null
                                  : () async {
                                      await widget.verificationService
                                          .approve(userId);
                                      _load();
                                    },
                              child: const Text('Approve'),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: OutlinedButton(
                              onPressed: isProcessed || userId == 0
                                  ? null
                                  : () async {
                                      final reason =
                                          reasonController.text.trim();
                                      if (reason.isEmpty) {
                                        if (!context.mounted) return;
                                        ScaffoldMessenger.of(context)
                                            .showSnackBar(
                                          const SnackBar(
                                              content: Text(
                                                  'Please enter a rejection reason.')),
                                        );
                                        return;
                                      }
                                      await widget.verificationService
                                          .reject(userId, reason);
                                      _load();
                                    },
                              child: const Text('Reject'),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            }),
        ],
      ),
    );
  }
}

class _VerificationImageTile extends StatelessWidget {
  const _VerificationImageTile({required this.title, required this.imageUrl});

  final String title;
  final String? imageUrl;

  @override
  Widget build(BuildContext context) {
    final resolved = ApiConfig.resolveMediaUrl(imageUrl);
    return InkWell(
      onTap: resolved == null
          ? null
          : () {
              showDialog<void>(
                context: context,
                builder: (_) => Dialog(
                  child: InteractiveViewer(
                    child: CachedNetworkImage(
                      imageUrl: resolved,
                      fit: BoxFit.contain,
                      errorWidget: (_, __, ___) => const SizedBox(
                        height: 240,
                        child: Center(child: Icon(Icons.broken_image_outlined)),
                      ),
                    ),
                  ),
                ),
              );
            },
      child: Container(
        height: 96,
        decoration: BoxDecoration(
          color: Colors.grey.shade200,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey.shade300),
        ),
        alignment: Alignment.center,
        child: resolved == null
            ? Text(title)
            : Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.image_outlined),
                  const SizedBox(height: 6),
                  Text(title, textAlign: TextAlign.center),
                ],
              ),
      ),
    );
  }
}

class _AdminFeedbackScreen extends StatefulWidget {
  const _AdminFeedbackScreen({required this.feedbackService});

  final FeedbackService feedbackService;

  @override
  State<_AdminFeedbackScreen> createState() => _AdminFeedbackScreenState();
}

class _AdminFeedbackScreenState extends State<_AdminFeedbackScreen> {
  List<FeedbackEntry> _items = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    if (!mounted) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final items = await widget.feedbackService.fetchAll();
      if (mounted) setState(() => _items = items);
    } catch (e) {
      if (mounted) _error = e.toString();
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (_loading)
            const Center(
                child: Padding(
                    padding: EdgeInsets.all(24),
                    child: CircularProgressIndicator()))
          else if (_error != null)
            _ErrorState(message: _error!)
          else if (_items.isEmpty)
            const _EmptyState(message: 'No feedback yet.')
          else
            ..._items.map(
              (item) => Card(
                child: ListTile(
                  title: Text(item.user?.username ?? 'Anonymous'),
                  subtitle: Text(item.message),
                  trailing: item.processed
                      ? const Chip(label: Text('Processed'))
                      : FilledButton.tonal(
                          onPressed: () async {
                            await widget.feedbackService.markProcessed(item.id);
                            _load();
                          },
                          child: const Text('Mark done'),
                        ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _ProductThumbnail extends StatelessWidget {
  const _ProductThumbnail({required this.product});

  final Product product;

  @override
  Widget build(BuildContext context) {
    final imageUrl = ApiConfig.resolveMediaUrl(product.primaryImageUrl);

    return ClipRRect(
      borderRadius: BorderRadius.circular(8),
      child: Container(
        width: 52,
        height: 52,
        color: Colors.grey.shade200,
        child: imageUrl == null
            ? const Icon(Icons.image_outlined, color: Colors.grey)
            : CachedNetworkImage(
                imageUrl: imageUrl,
                fit: BoxFit.cover,
                errorWidget: (_, __, ___) =>
                    const Icon(Icons.broken_image_outlined, color: Colors.grey),
              ),
      ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  const _MetricCard(
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
    final tone = color ?? Theme.of(context).colorScheme.primary;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: tone.withValues(alpha: 0.10),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: tone),
          const SizedBox(height: 8),
          Text(value,
              style: Theme.of(context)
                  .textTheme
                  .headlineSmall
                  ?.copyWith(color: tone)),
          const SizedBox(height: 4),
          Text(label),
        ],
      ),
    );
  }
}

class _OrderDetailSheet extends StatefulWidget {
  const _OrderDetailSheet(
      {required this.order,
      required this.checkoutService,
      required this.onUpdated});

  final Order order;
  final CheckoutService checkoutService;
  final Future<void> Function() onUpdated;

  @override
  State<_OrderDetailSheet> createState() => _OrderDetailSheetState();
}

class _OrderDetailSheetState extends State<_OrderDetailSheet> {
  static const List<String> _allowedStatuses = [
    'PENDING',
    'CONFIRMED',
    'PAID',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
  ];

  late String _status;
  final _currency = NumberFormat.simpleCurrency();

  @override
  void initState() {
    super.initState();
    final incoming = (widget.order.status ?? 'PENDING').toUpperCase();
    _status = _allowedStatuses.contains(incoming) ? incoming : 'PENDING';
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.fromLTRB(
          16, 16, 16, 16 + MediaQuery.of(context).viewInsets.bottom),
      child: ListView(
        shrinkWrap: true,
        children: [
          Text('Order #${widget.order.id}',
              style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 8),
          Text('Customer: ${widget.order.user?.username ?? 'Unknown'}'),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            initialValue: _status,
            items: _allowedStatuses
                .map((status) =>
                    DropdownMenuItem(value: status, child: Text(status)))
                .toList(),
            onChanged: (value) => setState(() => _status = value ?? _status),
            decoration: const InputDecoration(labelText: 'Status'),
          ),
          const SizedBox(height: 12),
          ...widget.order.items.map(
            (item) => ListTile(
              contentPadding: EdgeInsets.zero,
              title: Text(item.product.name),
              subtitle: Text('Qty ${item.quantity}'),
              trailing: Text(_currency.format(item.total)),
            ),
          ),
          const SizedBox(height: 12),
          FilledButton(
            onPressed: () async {
              await widget.checkoutService
                  .updateStatus(widget.order.id, _status);
              await widget.onUpdated();
              if (context.mounted) Navigator.pop(context);
            },
            child: const Text('Update order'),
          ),
        ],
      ),
    );
  }
}

class _OverviewData {
  const _OverviewData({
    required this.products,
    required this.pendingProducts,
    required this.orders,
    required this.users,
    required this.feedback,
  });

  final List<Product> products;
  final List<Product> pendingProducts;
  final List<Order> orders;
  final List<UserModel> users;
  final List<FeedbackEntry> feedback;
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Center(child: Text(message)),
    );
  }
}

class _ErrorState extends StatelessWidget {
  const _ErrorState({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Text(message, style: const TextStyle(color: Colors.red)),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  const _StatusBadge({required this.status});

  final String status;

  @override
  Widget build(BuildContext context) {
    Color color;
    switch (status.toUpperCase()) {
      case 'APPROVED':
      case 'PAID':
      case 'DELIVERED':
        color = Colors.green;
        break;
      case 'REJECTED':
      case 'CANCELLED':
        color = Colors.red;
        break;
      case 'SHIPPED':
        color = Colors.blue;
        break;
      case 'PENDING':
      default:
        color = Colors.orange;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(
          color: color,
          fontWeight: FontWeight.w600,
          fontSize: 12,
        ),
      ),
    );
  }
}

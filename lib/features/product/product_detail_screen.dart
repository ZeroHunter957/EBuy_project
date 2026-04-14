import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../core/constants.dart';
import '../../core/models/product.dart';
import '../../core/services/product_service.dart';
import '../cart/cart_controller.dart';
import '../review/review_product_screen.dart';

class ProductDetailScreen extends StatefulWidget {
  const ProductDetailScreen({super.key, required this.product});

  final Product product;

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  final NumberFormat _currency = NumberFormat.simpleCurrency();
  int _qty = 1;
  int? _selectedImageId;

  @override
  void initState() {
    super.initState();
    final primaryIndex = widget.product.images.indexWhere((e) => e.isPrimary);
    _selectedImageId = primaryIndex >= 0
        ? widget.product.images[primaryIndex].id
        : (widget.product.images.isNotEmpty
            ? widget.product.images.first.id
            : null);
  }

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartController>();
    final product = widget.product;
    final canAdd = product.available && (product.stock ?? 0) > 0;
    final selectedImage = product.images.isEmpty
        ? null
        : product.images.firstWhere(
            (img) => img.id == _selectedImageId,
            orElse: () => product.images.first,
          );
    final imageUrl = selectedImage == null
        ? null
        : ApiConfig.resolveMediaUrl(selectedImage.url);

    return Scaffold(
      backgroundColor: const Color(0xFFF5F6F8),
      appBar: AppBar(title: Text(product.name)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (imageUrl != null)
                    GestureDetector(
                      onTap: () => showDialog<void>(
                        context: context,
                        builder: (_) => Dialog(
                          child: InteractiveViewer(
                            child: CachedNetworkImage(
                                imageUrl: imageUrl, fit: BoxFit.contain),
                          ),
                        ),
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(16),
                        child: CachedNetworkImage(
                          imageUrl: imageUrl,
                          height: 280,
                          width: double.infinity,
                          fit: BoxFit.contain,
                        ),
                      ),
                    )
                  else
                    Container(
                      height: 280,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(16),
                        color: Colors.grey.shade200,
                      ),
                      alignment: Alignment.center,
                      child: const Icon(Icons.image, size: 60),
                    ),
                  if (product.images.length > 1) ...[
                    const SizedBox(height: 12),
                    SizedBox(
                      height: 64,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: product.images.length,
                        separatorBuilder: (_, __) => const SizedBox(width: 8),
                        itemBuilder: (context, index) {
                          final image = product.images[index];
                          final thumbUrl = ApiConfig.resolveMediaUrl(image.url);
                          final selected = image.id == _selectedImageId;
                          return GestureDetector(
                            onTap: () =>
                                setState(() => _selectedImageId = image.id),
                            child: Container(
                              width: 64,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: selected
                                      ? Colors.orange
                                      : Colors.grey.shade300,
                                  width: selected ? 2 : 1,
                                ),
                              ),
                              child: thumbUrl == null
                                  ? const Icon(Icons.image_outlined)
                                  : ClipRRect(
                                      borderRadius: BorderRadius.circular(8),
                                      child: CachedNetworkImage(
                                          imageUrl: thumbUrl,
                                          fit: BoxFit.cover),
                                    ),
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                  const SizedBox(height: 16),
                  Text(product.name,
                      style: Theme.of(context).textTheme.headlineSmall),
                  const SizedBox(height: 8),
                  Text(
                    _currency.format(product.price),
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        color: const Color(0xFFB12704),
                        fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      Chip(
                          label: Text((product.stock ?? 0) > 0
                              ? 'In Stock'
                              : 'Out of Stock')),
                      Chip(label: Text('Stock: ${product.stock ?? 0}')),
                      ...product.categories
                          .map((c) => Chip(label: Text(c.name))),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Text(product.description ?? 'No description provided.'),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      const Text('Qty:'),
                      const SizedBox(width: 12),
                      SizedBox(
                        width: 90,
                        child: TextFormField(
                          initialValue: '1',
                          keyboardType: TextInputType.number,
                          onChanged: (value) => _qty = int.tryParse(value) ?? 1,
                          decoration: const InputDecoration(
                              border: OutlineInputBorder()),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: FilledButton.icon(
                          onPressed: canAdd
                              ? () async {
                                  final stock = product.stock ?? 0;
                                  if (_qty <= 0) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(
                                          content: Text(
                                              'Quantity must be at least 1')),
                                    );
                                    return;
                                  }
                                  if (stock > 0 && _qty > stock) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                          content: Text(
                                              'Only $stock item(s) left in stock')),
                                    );
                                    return;
                                  }
                                  try {
                                    for (var i = 0; i < _qty; i++) {
                                      await cart.add(product);
                                    }
                                    if (!context.mounted) return;
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                          content: Text(
                                              '${product.name} added to cart')),
                                    );
                                  } catch (e) {
                                    if (!context.mounted) return;
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                          content:
                                              Text('Add to cart failed: $e')),
                                    );
                                  }
                                }
                              : null,
                          icon: const Icon(Icons.add_shopping_cart),
                          label: Text(canAdd ? 'Add to cart' : 'Out of stock'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                  builder: (_) =>
                                      ReviewProductScreen(product: product)),
                            );
                          },
                          icon: const Icon(Icons.reviews_outlined),
                          label: const Text('Reviews'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          FutureBuilder<List<Product>>(
            future: _loadSimilarProducts(context, product),
            builder: (context, snapshot) {
              final similar = snapshot.data ?? const <Product>[];
              if (similar.isEmpty) return const SizedBox.shrink();
              return Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Similar Products',
                          style: Theme.of(context).textTheme.titleLarge),
                      const SizedBox(height: 12),
                      SizedBox(
                        height: 180,
                        child: ListView.separated(
                          scrollDirection: Axis.horizontal,
                          itemCount: similar.length,
                          separatorBuilder: (_, __) =>
                              const SizedBox(width: 12),
                          itemBuilder: (context, index) {
                            final item = similar[index];
                            final itemImage =
                                ApiConfig.resolveMediaUrl(item.primaryImageUrl);
                            return GestureDetector(
                              onTap: () => Navigator.of(context).push(
                                MaterialPageRoute(
                                    builder: (_) =>
                                        ProductDetailScreen(product: item)),
                              ),
                              child: SizedBox(
                                width: 160,
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Expanded(
                                      child: ClipRRect(
                                        borderRadius: BorderRadius.circular(12),
                                        child: itemImage == null
                                            ? Container(
                                                color: Colors.grey.shade200)
                                            : CachedNetworkImage(
                                                imageUrl: itemImage,
                                                width: double.infinity,
                                                fit: BoxFit.cover,
                                              ),
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    Text(item.name,
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis),
                                    Text(_currency.format(item.price)),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Future<List<Product>> _loadSimilarProducts(
      BuildContext context, Product product) async {
    if (product.categories.isEmpty) return const [];
    final service = context.read<ProductService>();
    final list = await service.byCategory(product.categories.first.id,
        page: 0, size: 10);
    return list.where((p) => p.id != product.id).toList();
  }
}

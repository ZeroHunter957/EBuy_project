import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/models/category.dart';
import '../../core/models/product.dart';
import '../../widgets/product_card.dart';
import '../catalog/catalog_controller.dart';
import '../catalog/catalog_screen.dart';
import '../product/product_detail_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    final catalog = context.read<CatalogController>();
    Future.microtask(() => catalog.loadLanding());
  }

  @override
  Widget build(BuildContext context) {
    final catalog = context.watch<CatalogController>();

    return Scaffold(
      backgroundColor: const Color(0xFFEAeded),
      body: RefreshIndicator(
        onRefresh: catalog.loadLanding,
        child: CustomScrollView(
          slivers: [
            SliverAppBar(
              floating: true,
              backgroundColor: const Color(0xFF232F3E),
              foregroundColor: Colors.white,
              title: const Text('EBuy'),
              actions: [
                IconButton(
                  icon: const Icon(Icons.search),
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const CatalogScreen()),
                    );
                  },
                ),
              ],
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _HeroBanner(onTap: catalog.loadLanding),
                    const SizedBox(height: 20),
                    _CategoryScroller(categories: catalog.categories),
                    const SizedBox(height: 24),
                    _SectionHeader(
                      title: '🔥 New Products',
                      onTap: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                              builder: (_) => const CatalogScreen()),
                        );
                      },
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      height: 285,
                      child: catalog.isLoading
                          ? const Center(child: CircularProgressIndicator())
                          : ListView.builder(
                              scrollDirection: Axis.horizontal,
                              itemCount: catalog.latestProducts.length,
                              itemBuilder: (context, index) {
                                final product = catalog.latestProducts[index];
                                return ProductCard(
                                  width: 200,
                                  product: product,
                                  onTap: () => Navigator.of(context).push(
                                    MaterialPageRoute(
                                      builder: (_) =>
                                          ProductDetailScreen(product: product),
                                    ),
                                  ),
                                );
                              },
                            ),
                    ),
                    const SizedBox(height: 24),
                    _SectionHeader(
                      title: 'Best Sellers',
                      onTap: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                              builder: (_) => const CatalogScreen()),
                        );
                      },
                    ),
                    const SizedBox(height: 8),
                    if (catalog.isLoading)
                      const Center(child: CircularProgressIndicator())
                    else
                      ...catalog.categories.map(
                        (category) => _CategoryProductSection(
                          category: category,
                          products: catalog.featuredProducts
                              .where((p) =>
                                  p.categories.any((c) => c.id == category.id))
                              .take(10)
                              .toList(),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CategoryProductSection extends StatelessWidget {
  const _CategoryProductSection(
      {required this.category, required this.products});

  final Category category;
  final List<Product> products;

  @override
  Widget build(BuildContext context) {
    if (products.isEmpty) return const SizedBox.shrink();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 24),
        _SectionHeader(
          title: category.name,
          onTap: () {
            Navigator.of(context).push(
              MaterialPageRoute(
                  builder: (_) =>
                      CatalogScreen(initialCategoryId: category.id)),
            );
          },
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 285,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: products.length,
            itemBuilder: (context, index) {
              final product = products[index];
              return ProductCard(
                width: 200,
                product: product,
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => ProductDetailScreen(product: product),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.title, this.onTap});

  final String title;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(title,
            style: Theme.of(context)
                .textTheme
                .titleLarge
                ?.copyWith(fontWeight: FontWeight.bold)),
        TextButton(onPressed: onTap, child: const Text('See all')),
      ],
    );
  }
}

class _HeroBanner extends StatelessWidget {
  const _HeroBanner({required this.onTap});

  final Future<void> Function() onTap;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        gradient: const LinearGradient(
          colors: [Color(0xFF232F3E), Color(0xFF37475A)],
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.12),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'EBuy',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Best deals everyday',
            style: TextStyle(color: Colors.white70),
          ),
          const SizedBox(height: 16),
          FilledButton(
            onPressed: onTap,
            style: FilledButton.styleFrom(
              backgroundColor: const Color(0xFFFEBd69),
              foregroundColor: Colors.black,
            ),
            child: const Text('Refresh deals'),
          ),
        ],
      ),
    );
  }
}

class _CategoryScroller extends StatelessWidget {
  const _CategoryScroller({required this.categories});

  final List<Category> categories;

  @override
  Widget build(BuildContext context) {
    if (categories.isEmpty) return const SizedBox.shrink();
    return SizedBox(
      height: 46,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemBuilder: (context, index) {
          final category = categories[index];
          return InkWell(
            onTap: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                    builder: (_) =>
                        CatalogScreen(initialCategoryId: category.id)),
              );
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: Colors.grey.shade300),
              ),
              child: Text(category.name),
            ),
          );
        },
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemCount: categories.length,
      ),
    );
  }
}

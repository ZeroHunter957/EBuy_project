import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/models/product.dart';
import '../../widgets/product_card.dart';
import '../product/product_detail_screen.dart';
import 'catalog_controller.dart';

class CatalogScreen extends StatefulWidget {
  const CatalogScreen({super.key, this.initialCategoryId});

  final int? initialCategoryId;

  @override
  State<CatalogScreen> createState() => _CatalogScreenState();
}

class _CatalogScreenState extends State<CatalogScreen> {
  final _searchController = TextEditingController();
  final _minPriceController = TextEditingController();
  final _maxPriceController = TextEditingController();

  List<Product> _allResults = [];
  List<Product> _results = [];
  bool _loading = false;
  String _sortBy = 'newest';
  String _selectedCategory = 'all';
  int _page = 0;
  final int _pageSize = 12;
  int _totalPages = 1;

  @override
  void initState() {
    super.initState();
    final initialCategoryId = widget.initialCategoryId;
    if (initialCategoryId != null) {
      _selectedCategory = '$initialCategoryId';
    }
    _performSearch();
  }

  Future<void> _performSearch() async {
    setState(() => _loading = true);
    final catalog = context.read<CatalogController>();
    try {
      final list = await catalog.search(
          query: _searchController.text.trim(), page: 0, size: 1000);
      if (!mounted) return;
      _allResults = list;
      _applyFilters();
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  void _applyFilters() {
    var list = List<Product>.from(_allResults);

    if (_selectedCategory != 'all') {
      final categoryId = int.tryParse(_selectedCategory);
      list = list
          .where((p) => p.categories.any((c) => c.id == categoryId))
          .toList();
    }

    final minPrice = double.tryParse(_minPriceController.text.trim());
    final maxPrice = double.tryParse(_maxPriceController.text.trim());

    if (minPrice != null) {
      list = list.where((p) => p.price >= minPrice).toList();
    }
    if (maxPrice != null) {
      list = list.where((p) => p.price <= maxPrice).toList();
    }

    switch (_sortBy) {
      case 'price_asc':
        list.sort((a, b) => a.price.compareTo(b.price));
        break;
      case 'price_desc':
        list.sort((a, b) => b.price.compareTo(a.price));
        break;
      case 'name':
        list.sort((a, b) => a.name.compareTo(b.name));
        break;
      default:
        list.sort((a, b) => b.id.compareTo(a.id));
    }

    _totalPages = (list.length / _pageSize).ceil();
    if (_totalPages == 0) _totalPages = 1;
    if (_page >= _totalPages) _page = 0;

    final start = _page * _pageSize;
    final end = (start + _pageSize).clamp(0, list.length);
    _results = list.sublist(start, end);
    setState(() {});
  }

  @override
  void dispose() {
    _searchController.dispose();
    _minPriceController.dispose();
    _maxPriceController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final catalog = context.watch<CatalogController>();

    return Scaffold(
      appBar: AppBar(title: const Text('Browse products')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _searchController,
                            decoration: const InputDecoration(
                              hintText: 'Search products...',
                              prefixIcon: Icon(Icons.search),
                            ),
                            onSubmitted: (_) {
                              _page = 0;
                              _performSearch();
                            },
                          ),
                        ),
                        const SizedBox(width: 12),
                        FilledButton(
                          onPressed: () {
                            _page = 0;
                            _performSearch();
                          },
                          child: const Text('Search'),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: DropdownButtonFormField<String>(
                            initialValue: _sortBy,
                            decoration:
                                const InputDecoration(labelText: 'Sort by'),
                            items: const [
                              DropdownMenuItem(
                                  value: 'newest', child: Text('Newest')),
                              DropdownMenuItem(
                                  value: 'price_asc',
                                  child: Text('Price: Low → High')),
                              DropdownMenuItem(
                                  value: 'price_desc',
                                  child: Text('Price: High → Low')),
                              DropdownMenuItem(
                                  value: 'name', child: Text('Name (A-Z)')),
                            ],
                            onChanged: (value) {
                              _sortBy = value ?? 'newest';
                              _page = 0;
                              _applyFilters();
                            },
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
          Expanded(
            child: LayoutBuilder(
              builder: (context, constraints) {
                final isCompact = constraints.maxWidth < 800;
                final filterPanel = Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Category',
                            style: TextStyle(fontWeight: FontWeight.bold)),
                        const SizedBox(height: 10),
                        DropdownButtonFormField<String>(
                          initialValue: _selectedCategory,
                          items: [
                            const DropdownMenuItem(
                                value: 'all', child: Text('All Categories')),
                            ...catalog.categories.map(
                              (c) => DropdownMenuItem(
                                  value: '${c.id}', child: Text(c.name)),
                            ),
                          ],
                          onChanged: (value) {
                            _selectedCategory = value ?? 'all';
                            _page = 0;
                            _applyFilters();
                          },
                        ),
                        const SizedBox(height: 20),
                        const Text('Price Range',
                            style: TextStyle(fontWeight: FontWeight.bold)),
                        const SizedBox(height: 10),
                        TextField(
                          controller: _minPriceController,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(labelText: 'Min'),
                        ),
                        const SizedBox(height: 10),
                        TextField(
                          controller: _maxPriceController,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(labelText: 'Max'),
                        ),
                        const SizedBox(height: 12),
                        FilledButton(
                          onPressed: () {
                            _page = 0;
                            _applyFilters();
                          },
                          child: const Text('Apply'),
                        ),
                      ],
                    ),
                  ),
                );

                final resultPanel = _loading
                    ? const Center(child: CircularProgressIndicator())
                    : Column(
                        children: [
                          Expanded(
                            child: _results.isEmpty
                                ? const Center(
                                    child: Text('No products found.'))
                                : GridView.builder(
                                    padding: const EdgeInsets.all(16),
                                    itemCount: _results.length,
                                    gridDelegate:
                                        SliverGridDelegateWithFixedCrossAxisCount(
                                      crossAxisCount: isCompact ? 1 : 2,
                                      childAspectRatio: isCompact ? 0.72 : 0.60,
                                      crossAxisSpacing: 12,
                                      mainAxisSpacing: 12,
                                    ),
                                    itemBuilder: (context, index) {
                                      final product = _results[index];
                                      return ProductCard(
                                        product: product,
                                        onTap: () => Navigator.of(context).push(
                                          MaterialPageRoute(
                                            builder: (_) => ProductDetailScreen(
                                                product: product),
                                          ),
                                        ),
                                      );
                                    },
                                  ),
                          ),
                          Padding(
                            padding: const EdgeInsets.only(bottom: 16),
                            child: Wrap(
                              spacing: 8,
                              children: [
                                OutlinedButton(
                                  onPressed: _page == 0
                                      ? null
                                      : () {
                                          _page--;
                                          _applyFilters();
                                        },
                                  child: const Text('Prev'),
                                ),
                                ...List.generate(
                                  _totalPages,
                                  (index) => FilledButton.tonal(
                                    onPressed: () {
                                      _page = index;
                                      _applyFilters();
                                    },
                                    child: Text('${index + 1}'),
                                  ),
                                ),
                                OutlinedButton(
                                  onPressed: _page >= _totalPages - 1
                                      ? null
                                      : () {
                                          _page++;
                                          _applyFilters();
                                        },
                                  child: const Text('Next'),
                                ),
                              ],
                            ),
                          ),
                        ],
                      );

                if (isCompact) {
                  return Column(
                    children: [
                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: filterPanel,
                      ),
                      Expanded(child: resultPanel),
                    ],
                  );
                }

                return Row(
                  children: [
                    SizedBox(
                        width: 260,
                        child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: filterPanel)),
                    Expanded(child: resultPanel),
                  ],
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

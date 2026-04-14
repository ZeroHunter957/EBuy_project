import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/models/product.dart';
import '../../core/services/ai_service.dart';
import '../../widgets/product_card.dart';
import '../auth/auth_controller.dart';
import '../catalog/catalog_controller.dart';
import '../product/product_detail_screen.dart';

class RecommendationWidget extends StatefulWidget {
  const RecommendationWidget({super.key});

  @override
  State<RecommendationWidget> createState() => _RecommendationWidgetState();
}

class _RecommendationWidgetState extends State<RecommendationWidget> {
  final _aiService = AIService();
  String? _aiMessage;
  List<Product> _recommendedProducts = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadRecommendations();
  }

  Future<void> _loadRecommendations() async {
    final auth = context.read<AuthController>();
    final user = auth.currentUser;

    if (user == null) {
      final result = await _aiService.getRecommendations();
      if (mounted) {
        setState(() {
          _aiMessage = result.message;
          _recommendedProducts = result.products;
          _isLoading = false;
        });
      }
      return;
    }

    try {
      final result = await _aiService.getRecommendations(userId: user.id);
      if (mounted) {
        setState(() {
          _aiMessage = result.message;
          _recommendedProducts = result.products;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Sorry, I cannot load recommendations right now';
          _isLoading = false;
        });
      }
    }
  }

  void _onProductTap(Product product) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => ProductDetailScreen(product: product),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final catalog = context.watch<CatalogController>();

    final displayProducts = _recommendedProducts.isNotEmpty
        ? _recommendedProducts
        : catalog.featuredProducts.take(6).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Icon(Icons.auto_awesome,
                    color: Theme.of(context).colorScheme.primary, size: 20),
                const SizedBox(width: 8),
                Text(
                  'A recommendation for you',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
              ],
            ),
            if (!_isLoading)
              IconButton(
                icon: const Icon(Icons.refresh),
                onPressed: () {
                  setState(() => _isLoading = true);
                  _loadRecommendations();
                },
                tooltip: 'Refresh',
              ),
          ],
        ),
        const SizedBox(height: 8),
        if (_isLoading)
          const Padding(
            padding: EdgeInsets.all(16),
            child: Center(child: CircularProgressIndicator()),
          )
        else if (_error != null)
          Padding(
            padding: const EdgeInsets.all(16),
            child: Text(_error!, style: const TextStyle(color: Colors.red)),
          )
        else if (_aiMessage != null && _aiMessage!.isNotEmpty) ...[
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Theme.of(context)
                  .colorScheme
                  .primaryContainer
                  .withValues(alpha: 0.3),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    _aiMessage!,
                    style: Theme.of(context).textTheme.bodyMedium,
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
        ],
        if (displayProducts.isEmpty)
          const Padding(
            padding: EdgeInsets.all(16),
            child: Text('No products to recommend'),
          )
        else
          SizedBox(
            height: 260,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: displayProducts.length,
              itemBuilder: (context, index) {
                final product = displayProducts[index];
                return Padding(
                  padding: EdgeInsets.only(
                    right: index < displayProducts.length - 1 ? 12 : 0,
                  ),
                  child: SizedBox(
                    width: 160,
                    child: ProductCard(
                      product: product,
                      onTap: () => _onProductTap(product),
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

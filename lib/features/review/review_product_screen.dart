import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/models/product.dart';
import '../../core/models/review.dart';
import '../../core/services/review_service.dart';
import '../auth/auth_controller.dart';

class ReviewProductScreen extends StatefulWidget {
  const ReviewProductScreen({super.key, required this.product});

  final Product product;

  @override
  State<ReviewProductScreen> createState() => _ReviewProductScreenState();
}

class _ReviewProductScreenState extends State<ReviewProductScreen> {
  final _commentController = TextEditingController();
  int _rating = 5;
  bool _submitting = false;
  late Future<List<Review>> _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  Future<List<Review>> _load() {
    final auth = context.read<AuthController>();
    final reviewService = context.read<ReviewService>()
      ..updateToken(auth.token);
    return reviewService.byProduct(widget.product.id);
  }

  Future<void> _refresh() async {
    final next = _load();
    if (mounted) {
      setState(() {
        _future = next;
      });
    }
    await next;
  }

  Future<void> _submit() async {
    final auth = context.read<AuthController>();
    if (!auth.isAuthenticated || auth.currentUser == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please login to review')),
      );
      return;
    }
    if (auth.currentUser!.role.name == 'SELLER') {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Seller accounts cannot write reviews')),
      );
      return;
    }

    final trimmed = _commentController.text.trim();
    if (trimmed.isNotEmpty && trimmed.length < 3) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Review must be at least 3 characters')),
      );
      return;
    }

    if (mounted) {
      setState(() {
        _submitting = true;
      });
    }

    try {
      final reviewService = context.read<ReviewService>()
        ..updateToken(auth.token);
      await reviewService.create({
        'rating': _rating,
        'comment': trimmed.isEmpty ? null : trimmed,
        'product': {'id': widget.product.id},
      });

      _commentController.clear();
      if (mounted) {
        setState(() {
          _rating = 5;
        });
      }

      await _refresh();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Review added')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Add review failed: $e')),
      );
    } finally {
      if (mounted) {
        setState(() {
          _submitting = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Reviews • ${widget.product.name}')),
      body: RefreshIndicator(
        onRefresh: _refresh,
        child: FutureBuilder<List<Review>>(
          future: _future,
          builder: (context, snapshot) {
            final reviews = snapshot.data ?? const <Review>[];
            return ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Write a review',
                            style: Theme.of(context).textTheme.titleMedium),
                        const SizedBox(height: 12),
                        Wrap(
                          spacing: 4,
                          children: List.generate(
                            5,
                            (index) => IconButton(
                              onPressed: () {
                                setState(() {
                                  _rating = index + 1;
                                });
                              },
                              icon: Icon(
                                index < _rating
                                    ? Icons.star_rounded
                                    : Icons.star_border_rounded,
                                color: Colors.amber,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 8),
                        TextField(
                          controller: _commentController,
                          minLines: 3,
                          maxLines: 5,
                          decoration: const InputDecoration(
                            labelText: 'Comment (optional)',
                            border: OutlineInputBorder(),
                          ),
                        ),
                        const SizedBox(height: 12),
                        Align(
                          alignment: Alignment.centerRight,
                          child: ElevatedButton(
                            onPressed: _submitting ? null : _submit,
                            child: _submitting
                                ? const SizedBox(
                                    width: 18,
                                    height: 18,
                                    child: CircularProgressIndicator(
                                        strokeWidth: 2),
                                  )
                                : const Text('Submit review'),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Text('All reviews',
                    style: Theme.of(context).textTheme.titleLarge),
                const SizedBox(height: 12),
                if (snapshot.hasError)
                  Text('Load reviews failed: ${snapshot.error}')
                else if (!snapshot.hasData)
                  const Center(
                    child: Padding(
                      padding: EdgeInsets.all(24),
                      child: CircularProgressIndicator(),
                    ),
                  )
                else if (reviews.isEmpty)
                  const Card(
                    child: Padding(
                      padding: EdgeInsets.all(16),
                      child: Text('No reviews yet.'),
                    ),
                  )
                else
                  ...reviews.map(
                    (r) => Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: ListTile(
                        title: Text(r.user?.username ?? 'Unknown user'),
                        subtitle: Text(r.comment.isEmpty ? '-' : r.comment),
                        trailing: Chip(label: Text('${r.rating}/5')),
                      ),
                    ),
                  ),
              ],
            );
          },
        ),
      ),
    );
  }
}

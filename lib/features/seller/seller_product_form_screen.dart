import 'dart:typed_data';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';

import '../../core/constants.dart';
import '../../core/models/product.dart';
import '../../core/services/category_service.dart';
import '../../core/services/product_image_service.dart';
import '../../core/services/product_service.dart';
import '../auth/auth_controller.dart';
import 'seller_product_form_controller.dart';

class SellerProductFormScreen extends StatelessWidget {
  const SellerProductFormScreen({super.key, this.product});

  final Product? product;

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthController>();
    final productService = context.read<ProductService>();
    final categoryService = context.read<CategoryService>();
    final imageService = context.read<ProductImageService>();

    return ChangeNotifierProvider(
      create: (_) => SellerProductFormController(
        productService: productService,
        categoryService: categoryService,
        imageService: imageService,
        sellerId: auth.currentUser?.id,
        token: auth.token,
        initialProduct: product,
      )..loadCategories(),
      child: const _SellerProductFormView(),
    );
  }
}

class _SellerProductFormView extends StatefulWidget {
  const _SellerProductFormView();

  @override
  State<_SellerProductFormView> createState() => _SellerProductFormViewState();
}

class _SellerProductFormViewState extends State<_SellerProductFormView> {
  final _formKey = GlobalKey<FormState>();

  @override
  Widget build(BuildContext context) {
    return Consumer<SellerProductFormController>(
      builder: (context, controller, _) {
        return Scaffold(
          appBar: AppBar(
              title:
                  Text(controller.isEditing ? 'Edit product' : 'Add product')),
          body: AbsorbPointer(
            absorbing: controller.isSubmitting,
            child: Stack(
              children: [
                SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        TextFormField(
                          initialValue: controller.name,
                          decoration: const InputDecoration(labelText: 'Name'),
                          onChanged: (value) => controller.name = value,
                          validator: (value) => value == null || value.isEmpty
                              ? 'Required'
                              : null,
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          initialValue: controller.price,
                          decoration: const InputDecoration(labelText: 'Price'),
                          keyboardType: TextInputType.number,
                          onChanged: (value) => controller.price = value,
                          validator: (value) => value == null || value.isEmpty
                              ? 'Required'
                              : null,
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          initialValue: controller.stock,
                          decoration: const InputDecoration(labelText: 'Stock'),
                          keyboardType: TextInputType.number,
                          onChanged: (value) => controller.stock = value,
                          validator: (value) => value == null || value.isEmpty
                              ? 'Required'
                              : null,
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          initialValue: controller.description,
                          decoration:
                              const InputDecoration(labelText: 'Description'),
                          maxLines: 4,
                          onChanged: (value) => controller.description = value,
                        ),
                        const SizedBox(height: 16),
                        Text('Categories',
                            style: Theme.of(context).textTheme.titleMedium),
                        const SizedBox(height: 8),
                        controller.isLoadingCategories
                            ? const Center(child: CircularProgressIndicator())
                            : Wrap(
                                spacing: 8,
                                runSpacing: 8,
                                children: controller.categories
                                    .map(
                                      (category) => FilterChip(
                                        label: Text(category.name),
                                        selected: controller.selectedCategoryIds
                                            .contains(category.id),
                                        onSelected: (_) => controller
                                            .toggleCategory(category.id),
                                      ),
                                    )
                                    .toList(),
                              ),
                        const SizedBox(height: 16),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Images',
                                style: Theme.of(context).textTheme.titleMedium),
                            TextButton.icon(
                              onPressed: controller.pickImages,
                              icon: const Icon(Icons.photo_library_outlined),
                              label: const Text('Add images'),
                            ),
                          ],
                        ),
                        if (controller.initialProduct?.images.isNotEmpty ==
                            true) ...[
                          const SizedBox(height: 8),
                          Text('Current images',
                              style: Theme.of(context).textTheme.bodyMedium),
                          const SizedBox(height: 8),
                          _ExistingImageGrid(
                              product: controller.initialProduct!),
                          const SizedBox(height: 12),
                        ],
                        _ImageGrid(controller: controller),
                        if (controller.error != null) ...[
                          const SizedBox(height: 16),
                          Text(controller.error!,
                              style: const TextStyle(color: Colors.red)),
                        ],
                        const SizedBox(height: 80),
                      ],
                    ),
                  ),
                ),
                if (controller.isSubmitting)
                  const LinearProgressIndicator(minHeight: 4),
              ],
            ),
          ),
          bottomNavigationBar: SafeArea(
            minimum: const EdgeInsets.all(16),
            child: ElevatedButton.icon(
              onPressed: () async {
                if (!_formKey.currentState!.validate()) return;
                final product = await controller.submit();
                if (product != null && context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                        content: Text(
                            'Product "${product.name}" submitted for approval.')),
                  );
                  Navigator.of(context).pop(product);
                }
              },
              icon: const Icon(Icons.save_outlined),
              label: controller.isSubmitting
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white),
                    )
                  : Text(controller.isEditing
                      ? 'Save changes'
                      : 'Submit for approval'),
            ),
          ),
        );
      },
    );
  }
}

class _ExistingImageGrid extends StatelessWidget {
  const _ExistingImageGrid({required this.product});

  final Product product;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 12,
      runSpacing: 12,
      children: product.images.map((image) {
        final imageUrl = ApiConfig.resolveMediaUrl(image.url);
        return Stack(
          alignment: Alignment.topRight,
          children: [
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: image.isPrimary ? Colors.green : Colors.grey.shade300,
                  width: image.isPrimary ? 3 : 1,
                ),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: imageUrl == null
                    ? Container(
                        color: Colors.grey.shade200,
                        alignment: Alignment.center,
                        child: const Icon(Icons.image_outlined,
                            color: Colors.grey),
                      )
                    : CachedNetworkImage(
                        imageUrl: imageUrl,
                        fit: BoxFit.cover,
                        errorWidget: (_, __, ___) => Container(
                          color: Colors.grey.shade200,
                          alignment: Alignment.center,
                          child: const Icon(Icons.broken_image_outlined,
                              color: Colors.grey),
                        ),
                      ),
              ),
            ),
            if (image.isPrimary)
              Positioned(
                top: 4,
                right: 4,
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.green,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Text('Primary',
                      style: TextStyle(color: Colors.white, fontSize: 10)),
                ),
              ),
          ],
        );
      }).toList(),
    );
  }
}

class _ImageGrid extends StatelessWidget {
  const _ImageGrid({required this.controller});

  final SellerProductFormController controller;

  @override
  Widget build(BuildContext context) {
    if (controller.pendingImages.isEmpty) {
      return Container(
        width: double.infinity,
        height: 120,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          border:
              Border.all(color: Colors.grey.shade300, style: BorderStyle.solid),
        ),
        alignment: Alignment.center,
        child: const Text('No images selected'),
      );
    }

    return Wrap(
      spacing: 12,
      runSpacing: 12,
      children: List.generate(controller.pendingImages.length, (index) {
        final pending = controller.pendingImages[index];
        final isPrimary = controller.primaryIndex == index;
        return GestureDetector(
          onTap: () => controller.updatePrimaryIndex(index),
          child: Stack(
            alignment: Alignment.topRight,
            children: [
              Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                      color: isPrimary ? Colors.green : Colors.grey.shade300,
                      width: isPrimary ? 3 : 1),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(16),
                  child: _PendingImagePreview(file: pending),
                ),
              ),
              Positioned(
                top: 4,
                right: 4,
                child: Column(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.close, color: Colors.white),
                      onPressed: () => controller.removeImage(index),
                    ),
                    if (isPrimary)
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.green,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Text('Primary',
                            style:
                                TextStyle(color: Colors.white, fontSize: 10)),
                      ),
                  ],
                ),
              ),
            ],
          ),
        );
      }),
    );
  }
}

class _PendingImagePreview extends StatelessWidget {
  const _PendingImagePreview({required this.file});

  final XFile file;

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Uint8List>(
      future: file.readAsBytes(),
      builder: (context, snapshot) {
        if (snapshot.hasData) {
          return Image.memory(
            snapshot.data!,
            fit: BoxFit.cover,
            width: double.infinity,
            height: double.infinity,
          );
        }

        if (snapshot.hasError) {
          return Container(
            color: Colors.grey.shade200,
            alignment: Alignment.center,
            child: const Icon(Icons.broken_image_outlined, color: Colors.grey),
          );
        }

        return const Center(
          child: SizedBox(
            width: 18,
            height: 18,
            child: CircularProgressIndicator(strokeWidth: 2),
          ),
        );
      },
    );
  }
}

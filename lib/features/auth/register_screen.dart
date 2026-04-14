import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';

import 'auth_controller.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _businessDescriptionController = TextEditingController();
  final _productDescriptionController = TextEditingController();
  final _picker = ImagePicker();

  bool _isSeller = false;
  XFile? _citizenIdImage;
  XFile? _businessCertImage;

  @override
  void dispose() {
    _usernameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _businessDescriptionController.dispose();
    _productDescriptionController.dispose();
    super.dispose();
  }

  Future<void> _pickImage(bool isCitizenId) async {
    final file =
        await _picker.pickImage(imageQuality: 85, source: ImageSource.gallery);
    if (file == null) return;
    setState(() {
      if (isCitizenId) {
        _citizenIdImage = file;
      } else {
        _businessCertImage = file;
      }
    });
  }

  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;

    final auth = context.read<AuthController>();
    late final bool success;

    if (_isSeller) {
      if (_citizenIdImage == null || _businessCertImage == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text('Please upload seller verification documents.')),
        );
        return;
      }

      success = await auth.registerSeller(
        username: _usernameController.text.trim(),
        email: _emailController.text.trim(),
        password: _passwordController.text,
        businessDescription: _businessDescriptionController.text.trim(),
        productDescription: _productDescriptionController.text.trim(),
        citizenIdImage: _citizenIdImage!,
        businessCertImage: _businessCertImage!,
      );
    } else {
      success = await auth.register(
        username: _usernameController.text.trim(),
        email: _emailController.text.trim(),
        password: _passwordController.text,
        roleId: 0,
      );
    }

    if (!success && mounted) {
      final message = auth.error ?? 'Registration failed';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(message)),
      );
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            _isSeller
                ? 'Seller registration submitted. Waiting for approval.'
                : 'Registered successfully.',
          ),
        ),
      );
      await auth.logout();
      if (mounted) Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = context.watch<AuthController>().isLoading;

    return Scaffold(
      appBar: AppBar(title: const Text('Create account')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SegmentedButton<bool>(
                  segments: const [
                    ButtonSegment<bool>(value: false, label: Text('User')),
                    ButtonSegment<bool>(value: true, label: Text('Seller')),
                  ],
                  selected: {_isSeller},
                  onSelectionChanged: (selection) {
                    setState(() => _isSeller = selection.first);
                  },
                ),
                const SizedBox(height: 20),
                TextFormField(
                  controller: _usernameController,
                  decoration: const InputDecoration(labelText: 'Username'),
                  validator: (value) => (value == null || value.isEmpty)
                      ? 'Please enter a username'
                      : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _emailController,
                  decoration: const InputDecoration(labelText: 'Email'),
                  keyboardType: TextInputType.emailAddress,
                  validator: (value) => (value == null || value.isEmpty)
                      ? 'Please enter an email'
                      : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _passwordController,
                  decoration: const InputDecoration(labelText: 'Password'),
                  obscureText: true,
                  validator: (value) => (value == null || value.length < 6)
                      ? 'Minimum 6 characters'
                      : null,
                ),
                if (_isSeller) ...[
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _businessDescriptionController,
                    decoration: const InputDecoration(
                        labelText: 'Business description'),
                    maxLines: 3,
                    validator: (value) =>
                        (value == null || value.trim().isEmpty)
                            ? 'Please describe your business'
                            : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _productDescriptionController,
                    decoration: const InputDecoration(
                        labelText: 'What products will you sell?'),
                    maxLines: 3,
                    validator: (value) =>
                        (value == null || value.trim().isEmpty)
                            ? 'Please describe your products'
                            : null,
                  ),
                  const SizedBox(height: 20),
                  _DocumentPickerTile(
                    title: 'Citizen ID image',
                    file: _citizenIdImage,
                    onTap: () => _pickImage(true),
                  ),
                  const SizedBox(height: 12),
                  _DocumentPickerTile(
                    title: 'Business certificate image',
                    file: _businessCertImage,
                    onTap: () => _pickImage(false),
                  ),
                ],
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: isLoading ? null : _handleRegister,
                    child: isLoading
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(
                                strokeWidth: 2, color: Colors.white),
                          )
                        : Text(_isSeller ? 'Register as seller' : 'Register'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _DocumentPickerTile extends StatelessWidget {
  const _DocumentPickerTile({
    required this.title,
    required this.file,
    required this.onTap,
  });

  final String title;
  final XFile? file;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey.shade300),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Container(
                width: 56,
                height: 56,
                color: Colors.grey.shade200,
                child: file == null
                    ? const Icon(Icons.upload_file_outlined)
                    : _PickedImagePreview(file: file!),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: Theme.of(context).textTheme.titleSmall),
                  const SizedBox(height: 4),
                  Text(file?.name ?? 'Tap to choose image'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PickedImagePreview extends StatelessWidget {
  const _PickedImagePreview({required this.file});

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
          return const Icon(Icons.broken_image_outlined);
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

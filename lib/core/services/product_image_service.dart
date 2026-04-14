import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:image_picker/image_picker.dart';

import '../models/product_image.dart';
import '../network/api_client.dart';
import '../network/endpoints.dart';

class ProductImageService {
  ProductImageService(this._client);

  final ApiClient _client;
  String? _token;

  void updateToken(String? token) => _token = token;

  Future<List<ProductImage>> byProduct(int productId) async {
    final response = await _client.get(
      ApiEndpoints.productImages(productId),
      token: _token,
    );
    final list = response as List? ?? [];
    return list
        .map((e) => ProductImage.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<ProductImage> upload({
    required XFile file,
    required int productId,
    bool primary = false,
  }) async {
    final bytes = await file.readAsBytes();
    final multipart = http.MultipartFile.fromBytes(
      'file',
      bytes,
      filename: file.name,
      contentType: _mediaTypeFor(file.name),
    );

    final response = await _client.postMultipart(
      ApiEndpoints.productImage,
      token: _token,
      fields: {
        'productId': '$productId',
        'primary': '$primary',
      },
      files: [multipart],
    ) as Map<String, dynamic>;

    return ProductImage.fromJson(response);
  }

  Future<void> delete(int id) async {
    await _client.delete(ApiEndpoints.productImageById(id), token: _token);
  }

  MediaType _mediaTypeFor(String filename) {
    final lower = filename.toLowerCase();
    if (lower.endsWith('.png')) return MediaType('image', 'png');
    if (lower.endsWith('.gif')) return MediaType('image', 'gif');
    if (lower.endsWith('.webp')) return MediaType('image', 'webp');
    if (lower.endsWith('.bmp')) return MediaType('image', 'bmp');
    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) {
      return MediaType('image', 'jpeg');
    }
    return MediaType('image', 'jpeg');
  }
}

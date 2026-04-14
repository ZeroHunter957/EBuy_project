import '../models/product.dart';
import '../network/api_client.dart';
import '../network/endpoints.dart';

class ProductService {
  ProductService(this._client);

  final ApiClient _client;
  String? _token;

  void updateToken(String? token) => _token = token;

  Future<List<Product>> fetchAll() async {
    final response = await _client.get(ApiEndpoints.products, token: _token);
    if (response is List) {
      return response
          .map((e) => Product.fromJson(e as Map<String, dynamic>))
          .toList();
    }
    return [];
  }

  Future<Product> fetchById(int id) async {
    final response = await _client.get(ApiEndpoints.productById(id),
        token: _token) as Map<String, dynamic>;
    return Product.fromJson(response);
  }

  Future<List<Product>> search({
    String? name,
    int page = 0,
    int size = 20,
  }) async {
    final response = await _client.get(
      ApiEndpoints.productSearch,
      token: _token,
      query: {
        'name': name ?? '',
        'page': page,
        'size': size,
      },
    );

    final content = (response is Map<String, dynamic>)
        ? response['content'] as List?
        : response as List?;
    return (content ?? [])
        .map((e) => Product.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<List<Product>> byCategory(int categoryId,
      {int page = 0, int size = 20}) async {
    final response = await _client.get(
      '${ApiEndpoints.productByCategory}/$categoryId',
      token: _token,
      query: {'page': page, 'size': size},
    );
    final content = (response is Map<String, dynamic>)
        ? response['content'] as List?
        : response as List?;
    return (content ?? [])
        .map((e) => Product.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<List<Product>> bySeller(int sellerId,
      {int page = 0, int size = 20}) async {
    final response = await _client.get(
      ApiEndpoints.productBySeller(sellerId),
      token: _token,
      query: {'page': page, 'size': size},
    );
    final content = (response is Map<String, dynamic>)
        ? response['content'] as List?
        : response as List?;
    return (content ?? [])
        .map((e) => Product.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<List<Product>> sellerPending(int sellerId,
      {int page = 0, int size = 20}) async {
    final response = await _client.get(
      ApiEndpoints.sellerPendingProducts(sellerId),
      token: _token,
      query: {'page': page, 'size': size},
    );
    final content = (response is Map<String, dynamic>)
        ? response['content'] as List?
        : response as List?;
    return (content ?? [])
        .map((e) => Product.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<List<Product>> adminPending({int page = 0, int size = 20}) async {
    final response = await _client.get(
      ApiEndpoints.adminPendingProducts,
      token: _token,
      query: {'page': page, 'size': size},
    );
    final content = (response is Map<String, dynamic>)
        ? response['content'] as List?
        : response as List?;
    return (content ?? [])
        .map((e) => Product.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<void> approve(int id) async {
    await _client.put(
      ApiEndpoints.approveProduct(id),
      token: _token,
    );
  }

  Future<void> reject(int id) async {
    await _client.put(
      ApiEndpoints.rejectProduct(id),
      token: _token,
    );
  }

  Future<Product> create(Map<String, dynamic> payload) async {
    final response = await _client.post(
      ApiEndpoints.products,
      token: _token,
      body: payload,
    ) as Map<String, dynamic>;
    return Product.fromJson(response);
  }

  Future<Product> update(int id, Map<String, dynamic> payload) async {
    final response = await _client.put(
      ApiEndpoints.productById(id),
      token: _token,
      body: payload,
    ) as Map<String, dynamic>;
    return Product.fromJson(response);
  }

  Future<void> delete(int id) async {
    await _client.delete(ApiEndpoints.productById(id), token: _token);
  }
}

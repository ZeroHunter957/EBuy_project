import '../models/category.dart';
import '../network/api_client.dart';
import '../network/endpoints.dart';

class CategoryService {
  CategoryService(this._client);

  final ApiClient _client;
  String? _token;

  void updateToken(String? token) => _token = token;

  Future<List<Category>> fetchAll() async {
    final response = await _client.get(ApiEndpoints.categories, token: _token);
    final list = response is List
        ? response
        : (response is Map<String, dynamic> ? response['data'] as List? : null);
    return (list ?? [])
        .map((e) => Category.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<Category> create(Map<String, dynamic> payload) async {
    final response = await _client.post(
      ApiEndpoints.categories,
      token: _token,
      body: payload,
    ) as Map<String, dynamic>;
    return Category.fromJson(response);
  }

  Future<Category> update(int id, Map<String, dynamic> payload) async {
    final response = await _client.put(
      '${ApiEndpoints.categories}/$id',
      token: _token,
      body: payload,
    ) as Map<String, dynamic>;
    return Category.fromJson(response);
  }

  Future<void> delete(int id) async {
    await _client.delete('${ApiEndpoints.categories}/$id', token: _token);
  }
}

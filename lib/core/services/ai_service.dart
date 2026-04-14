import '../models/product.dart';
import '../network/api_client.dart';
import '../network/endpoints.dart';

class RecommendationData {
  final List<Product> products;
  final String message;

  RecommendationData({required this.products, required this.message});
}

class AIService {
  AIService();

  final ApiClient _client = ApiClient();
  final List<Map<String, String>> _history = [];

  void updateToken(String? token) {}

  Future<String> chat(String userMessage) async {
    _history.add({'role': 'user', 'content': userMessage});

    try {
      final data = await _client.post(
        ApiEndpoints.aiChat,
        body: {
          'message': userMessage,
          'history': _history.sublist(0, _history.length - 1),
        },
      );

      final message = data['message'] as String? ?? 'Sorry, I cannot answer that';
      _history.add({'role': 'assistant', 'content': message});
      return message;
    } catch (e) {
      _history.removeLast();
      rethrow;
    }
  }

  Future<RecommendationData> getRecommendations({int? userId}) async {
    try {
      final data = await _client.get(
        ApiEndpoints.aiRecommendations,
        query: userId != null ? {'userId': userId} : null,
      );

      final products = (data['products'] as List?)
              ?.map((e) => Product.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [];
      final message = data['message'] as String? ?? 'Sorry, I have no recommendations right now';

      return RecommendationData(products: products, message: message);
    } catch (e) {
      return RecommendationData(
          products: [], message: 'Sorry, I cannot load recommendations right now.');
    }
  }

  void clearHistory() {
    _history.clear();
  }
}

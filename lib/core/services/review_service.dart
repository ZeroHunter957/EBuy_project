import '../models/review.dart';
import '../network/api_client.dart';
import '../network/endpoints.dart';

class ReviewService {
  ReviewService(this._client);

  final ApiClient _client;
  String? _token;

  void updateToken(String? token) => _token = token;

  Future<List<Review>> byProduct(int productId) async {
    final response = await _client.get(
      ApiEndpoints.reviewByProduct(productId),
      token: _token,
    );
    final list = response as List? ?? [];
    return list.map((e) => Review.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<List<Review>> bySeller() async {
    final response =
        await _client.get(ApiEndpoints.sellerReviews, token: _token);
    final list = response as List? ?? [];
    return list.map((e) => Review.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<Review> create(Map<String, dynamic> payload) async {
    final response = await _client.post(
      ApiEndpoints.review,
      token: _token,
      body: payload,
    ) as Map<String, dynamic>;
    return Review.fromJson(response);
  }
}

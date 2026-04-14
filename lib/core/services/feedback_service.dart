import '../models/feedback_entry.dart';
import '../network/api_client.dart';
import '../network/endpoints.dart';

class FeedbackService {
  FeedbackService(this._client);

  final ApiClient _client;
  String? _token;

  void updateToken(String? token) => _token = token;

  Future<List<FeedbackEntry>> fetchAll() async {
    final response = await _client.get(ApiEndpoints.feedback, token: _token);
    final list = response as List? ?? [];
    return list
        .map((e) => FeedbackEntry.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<List<FeedbackEntry>> fetchByUser(int userId) async {
    final response = await _client.get(
      ApiEndpoints.feedbackByUser(userId),
      token: _token,
    );
    final list = response as List? ?? [];
    return list
        .map((e) => FeedbackEntry.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<int> unreadCount() async {
    final response =
        await _client.get(ApiEndpoints.feedbackUnreadCount, token: _token);
    if (response is Map<String, dynamic>) {
      return response['count'] as int? ?? response['data'] as int? ?? 0;
    }
    if (response is int) return response;
    return 0;
  }

  Future<void> markProcessed(int id) async {
    await _client.put(ApiEndpoints.feedbackMarkProcessed(id), token: _token);
  }

  Future<FeedbackEntry> submit(Map<String, dynamic> payload) async {
    final response = await _client.post(
      ApiEndpoints.feedback,
      token: _token,
      body: payload,
    ) as Map<String, dynamic>;
    return FeedbackEntry.fromJson(response);
  }
}

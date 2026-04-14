import '../models/seller_verification.dart';
import '../network/api_client.dart';
import '../network/endpoints.dart';

class SellerVerificationService {
  SellerVerificationService(this._client);

  final ApiClient _client;
  String? _token;

  void updateToken(String? token) => _token = token;

  Future<List<SellerVerification>> fetchAll() async {
    final response =
        await _client.get(ApiEndpoints.adminVerifications, token: _token);
    final list = response is Map<String, dynamic>
        ? (response['content'] as List? ?? const [])
        : (response as List? ?? const []);
    return list
        .map((e) => SellerVerification.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<void> approve(int userId) async {
    await _client.post(ApiEndpoints.approveSeller(userId), token: _token);
  }

  Future<void> reject(int userId, String reason) async {
    final encodedReason = Uri.encodeQueryComponent(reason);
    await _client.post(ApiEndpoints.rejectSeller(userId, encodedReason),
        token: _token);
  }
}

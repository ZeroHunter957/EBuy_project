import '../models/user.dart';
import '../network/api_client.dart';
import '../network/endpoints.dart';

class UserService {
  UserService(this._client);

  final ApiClient _client;
  String? _token;

  void updateToken(String? token) => _token = token;

  Future<List<UserModel>> fetchAll() async {
    final response = await _client.get(ApiEndpoints.users, token: _token);
    final list = response as List? ?? [];
    return list
        .map((e) => UserModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<UserModel> fetchById(int id) async {
    final response = await _client.get(ApiEndpoints.userById(id), token: _token)
        as Map<String, dynamic>;
    return UserModel.fromJson(response);
  }

  Future<void> delete(int id) async {
    await _client.delete(ApiEndpoints.userById(id), token: _token);
  }
}

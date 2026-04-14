import '../models/order.dart';
import '../network/api_client.dart';
import '../network/endpoints.dart';

class CheckoutService {
  CheckoutService(this._client);

  final ApiClient _client;
  String? _token;

  void updateToken(String? token) => _token = token;

  Future<List<Order>> fetchAll() async {
    final response = await _client.get(ApiEndpoints.checkout, token: _token);
    final list = response as List? ?? [];
    return list.map((e) => Order.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<List<Order>> fetchByUser(int userId) async {
    final response = await _client.get(
      ApiEndpoints.checkoutByUser(userId),
      token: _token,
    );
    final list = response as List? ?? [];
    return list.map((e) => Order.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<Order> create(Map<String, dynamic> payload) async {
    final response = await _client.post(
      ApiEndpoints.checkout,
      token: _token,
      body: payload,
    ) as Map<String, dynamic>;
    return Order.fromJson(response);
  }

  Future<Order> createFromCart() async {
    final response = await _client.post(
      ApiEndpoints.checkoutFromCart,
      token: _token,
    ) as Map<String, dynamic>;
    return Order.fromJson(response);
  }

  Future<Order> fetchById(int id) async {
    final response = await _client.get(ApiEndpoints.checkoutById(id),
        token: _token) as Map<String, dynamic>;
    return Order.fromJson(response);
  }

  Future<List<Order>> fetchSellerOrders() async {
    final response =
        await _client.get(ApiEndpoints.sellerCheckouts, token: _token);
    final list = response as List? ?? [];
    return list.map((e) => Order.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<Order> fetchSellerOrderById(int id) async {
    final response = await _client.get(ApiEndpoints.sellerCheckoutById(id),
        token: _token) as Map<String, dynamic>;
    return Order.fromJson(response);
  }

  Future<void> updateStatus(int id, String status) async {
    await _client.put(
      ApiEndpoints.checkoutStatus(id),
      token: _token,
      body: {'status': status},
    );
  }
}

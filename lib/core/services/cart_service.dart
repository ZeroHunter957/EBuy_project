import '../models/cart.dart';
import '../models/cart_item.dart';
import '../network/api_client.dart';
import '../network/endpoints.dart';

class CartService {
  CartService(this._client);

  final ApiClient _client;
  String? _token;

  void updateToken(String? token) => _token = token;

  Future<Cart> fetchMyCart() async {
    final response = await _client.get(ApiEndpoints.cartMy, token: _token)
        as Map<String, dynamic>;
    return Cart.fromJson(response);
  }

  Future<CartItem> addOrUpdateItem(CartItem item) async {
    if (item.cartId != null) {
      final response = await _client.post(
        ApiEndpoints.cartItem,
        token: _token,
        body: item.toJson(),
      ) as Map<String, dynamic>;
      return CartItem.fromJson(response);
    }

    final response = await _client.post(
      ApiEndpoints.cartItemAdd,
      token: _token,
      body: {
        'productId': item.product.id,
        'delta': item.quantity,
      },
    ) as Map<String, dynamic>;
    return CartItem.fromJson(response);
  }

  Future<void> clearCart(int cartId) async {
    await _client.delete(ApiEndpoints.cartClear(cartId), token: _token);
  }
}

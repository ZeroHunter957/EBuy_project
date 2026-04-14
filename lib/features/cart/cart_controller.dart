import 'package:flutter/material.dart';

import '../../core/models/cart.dart';
import '../../core/models/cart_item.dart';
import '../../core/models/product.dart';
import '../../core/services/cart_service.dart';

class CartController extends ChangeNotifier {
  CartController(this._cartService);

  final CartService _cartService;
  final List<CartItem> _localItems = [];
  Cart? _remoteCart;
  bool _isSyncing = false;
  String? _token;

  List<CartItem> get items {
    if (_token == null) return List.unmodifiable(_localItems);
    return List.unmodifiable(_remoteCart?.items ?? const []);
  }

  double get total => items.fold(0, (prev, item) => prev + item.total);

  bool get isSyncing => _isSyncing;

  void updateToken(String? token) {
    _token = token;
    _cartService.updateToken(token);
    if (token == null) {
      _remoteCart = null;
      notifyListeners();
    } else {
      syncFromServer();
    }
  }

  Future<void> syncFromServer() async {
    if (_token == null) return;
    _isSyncing = true;
    notifyListeners();
    try {
      _remoteCart = await _cartService.fetchMyCart();
    } catch (_) {
      // keep last known cart
    } finally {
      _isSyncing = false;
      notifyListeners();
    }
  }

  Future<void> add(Product product) async {
    if (_token == null) {
      _addLocal(product);
      return;
    }
    final cart = await _ensureRemoteCart();
    final existing = _findRemoteItem(product.id);
    final quantity = (existing?.quantity ?? 0) + 1;
    await _cartService.addOrUpdateItem(
      CartItem(
        cartId: cart.id,
        product: product,
        quantity: quantity,
      ),
    );
    await syncFromServer();
  }

  Future<void> decrease(Product product) async {
    if (_token == null) {
      _decreaseLocal(product);
      return;
    }
    final cart = await _ensureRemoteCart();
    final existing = _findRemoteItem(product.id);
    if (existing == null) return;
    final nextQuantity = existing.quantity - 1;
    if (nextQuantity <= 0) {
      await remove(product);
    } else {
      await _cartService.addOrUpdateItem(
        CartItem(
          cartId: cart.id,
          product: product,
          quantity: nextQuantity,
        ),
      );
      await syncFromServer();
    }
  }

  Future<void> remove(Product product) async {
    if (_token == null) {
      _localItems.removeWhere((item) => item.product.id == product.id);
      notifyListeners();
      return;
    }
    final cart = await _ensureRemoteCart();
    // Assume backend interprets quantity 0 as delete; fallback to server-side "remove" endpoint when available.
    await _cartService.addOrUpdateItem(
      CartItem(
        cartId: cart.id,
        product: product,
        quantity: 0,
      ),
    );
    await syncFromServer();
  }

  Future<void> clear() async {
    if (_token == null) {
      _localItems.clear();
      notifyListeners();
      return;
    }
    if (_remoteCart != null) {
      await _cartService.clearCart(_remoteCart!.id);
      await syncFromServer();
    }
  }

  Future<void> setQuantity(Product product, int quantity) async {
    if (quantity < 0) return;
    if (_token == null) {
      final index =
          _localItems.indexWhere((item) => item.product.id == product.id);
      if (index == -1) return;
      if (quantity == 0) {
        _localItems.removeAt(index);
      } else {
        _localItems[index].quantity = quantity;
      }
      notifyListeners();
      return;
    }

    final cart = await _ensureRemoteCart();
    await _cartService.addOrUpdateItem(
      CartItem(
        cartId: cart.id,
        product: product,
        quantity: quantity,
      ),
    );
    await syncFromServer();
  }

  Future<Cart> _ensureRemoteCart() async {
    if (_remoteCart != null) return _remoteCart!;
    final cart = await _cartService.fetchMyCart();
    _remoteCart = cart;
    notifyListeners();
    return cart;
  }

  CartItem? _findRemoteItem(int productId) {
    final items = _remoteCart?.items;
    if (items == null) return null;
    for (final item in items) {
      if (item.product.id == productId) return item;
    }
    return null;
  }

  void _addLocal(Product product) {
    final index =
        _localItems.indexWhere((item) => item.product.id == product.id);
    if (index >= 0) {
      _localItems[index].quantity++;
    } else {
      _localItems.add(CartItem(product: product));
    }
    notifyListeners();
  }

  void _decreaseLocal(Product product) {
    final index =
        _localItems.indexWhere((item) => item.product.id == product.id);
    if (index == -1) return;
    final item = _localItems[index];
    if (item.quantity > 1) {
      item.quantity--;
    } else {
      _localItems.removeAt(index);
    }
    notifyListeners();
  }
}

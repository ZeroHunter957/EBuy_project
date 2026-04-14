class ApiEndpoints {
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String me = '/auth/me';
  static const String sellerVerify = '/seller/verify';
  static const String googleLogin = '/auth/google';

  static const String products = '/api/product';
  static const String productSearch = '/api/product/search';
  static const String categories = '/api/category';
  static const String productByCategory = '/api/product/category';
  static String productById(int id) => '/api/product/$id';
  static String productBySeller(int sellerId) =>
      '/api/product/seller/$sellerId';
  static String sellerPendingProducts(int sellerId) =>
      '/api/product/seller/$sellerId/pending';
  static const String adminPendingProducts = '/api/product/admin/pending';
  static String approveProduct(int id) => '/api/product/$id/approve';
  static String rejectProduct(int id) => '/api/product/$id/reject';

  // Cart & checkout
  static const String cartMy = '/api/cart/my';
  static const String cartItem = '/api/cart/item';
  static const String cartItemAdd = '/api/cart/item/add';
  static String cartClear(int cartId) => '/api/cart/$cartId/clear';
  static const String checkout = '/api/checkout';
  static const String checkoutFromCart = '/api/checkout/from-cart';
  static String checkoutByUser(int userId) => '/api/checkout/user/$userId';
  static String checkoutById(int id) => '/api/checkout/$id';
  static String checkoutStatus(int id) => '/api/checkout/$id/status';
  static const String sellerCheckouts = '/api/checkout/seller/me';
  static String sellerCheckoutById(int id) => '/api/checkout/seller/$id';

  // Feedback + reviews
  static const String feedback = '/api/feedback';
  static String feedbackByUser(int userId) => '/api/feedback/user/$userId';
  static const String feedbackUnreadCount = '/api/feedback/unread/count';
  static String feedbackMarkProcessed(int id) => '/api/feedback/$id/processed';
  static String reviewByProduct(int productId) =>
      '/api/review/product/$productId';
  static const String sellerReviews = '/api/review/seller/me';
  static const String review = '/api/review';

  // Product images
  static String productImages(int productId) =>
      '/api/product-image/product/$productId';
  static String productPrimaryImage(int productId) =>
      '/api/product-image/product/$productId/primary';
  static const String productImage = '/api/product-image';
  static String productImageById(int id) => '/api/product-image/$id';

  // Users (admin)
  static const String users = '/api/user';
  static String userById(int id) => '/api/user/$id';

  // admin verificaiton
  static const String adminVerifications = '/admin/verifications';
  static String approveSeller(int userId) => '/admin/approve-seller/$userId';
  static String rejectSeller(int userId, String reason) => '/admin/reject-seller/$userId?reason=$reason';

  // AI
  static const String aiChat = '/api/ai/chat';
  static const String aiRecommendations = '/api/ai/recommendations';
}

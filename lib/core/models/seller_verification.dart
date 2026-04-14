import 'user.dart';

class SellerVerification {
  SellerVerification({
    required this.id,
    this.user,
    this.status,
    this.businessDescription,
    this.productDescription,
    this.citizenIdImageUrl,
    this.businessCertImageUrl,
    this.rejectReason,
  });

  final int id;
  final UserModel? user;
  final String? status;
  final String? businessDescription;
  final String? productDescription;
  final String? citizenIdImageUrl;
  final String? businessCertImageUrl;
  final String? rejectReason;

  factory SellerVerification.fromJson(Map<String, dynamic> json) {
    return SellerVerification(
      id: (json['id'] as num?)?.toInt() ?? 0,
      user: json['user'] != null
          ? UserModel.fromJson(json['user'] as Map<String, dynamic>)
          : null,
      status: json['status']?.toString(),
      businessDescription: json['businessDescription']?.toString(),
      productDescription: json['productDescription']?.toString(),
      citizenIdImageUrl: json['citizenIdImageUrl']?.toString(),
      businessCertImageUrl: json['businessCertImageUrl']?.toString(),
      rejectReason: json['rejectReason']?.toString(),
    );
  }
}

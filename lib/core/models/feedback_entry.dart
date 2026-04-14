import 'user.dart';

class FeedbackEntry {
  FeedbackEntry({
    required this.id,
    required this.message,
    this.status,
    this.createdAt,
    this.user,
    this.processed = false,
  });

  final int id;
  final String message;
  final String? status;
  final DateTime? createdAt;
  final UserModel? user;
  final bool processed;

  factory FeedbackEntry.fromJson(Map<String, dynamic> json) {
    return FeedbackEntry(
      id: json['id'] as int,
      message: json['message']?.toString() ?? json['content']?.toString() ?? '',
      status: json['status']?.toString(),
      processed:
          json['processed'] as bool? ?? json['isProcessed'] as bool? ?? false,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString())
          : null,
      user: json['user'] != null
          ? UserModel.fromJson(json['user'] as Map<String, dynamic>)
          : null,
    );
  }
}

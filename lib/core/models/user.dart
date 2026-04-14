class Role {
  Role({required this.id, required this.name});

  final int id;
  final String name;

  factory Role.fromJson(Map<String, dynamic> json) {
    return Role(
      id: (json['id'] as num?)?.toInt() ?? 0,
      name: json['name']?.toString() ?? 'USER',
    );
  }
}

class UserModel {
  UserModel({
    required this.id,
    required this.username,
    required this.email,
    required this.role,
    this.sellerApproved = false,
  });

  final int id;
  final String username;
  final String email;
  final Role role;
  final bool sellerApproved;

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: (json['id'] as num?)?.toInt() ?? 0,
      username: json['username']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      role: Role.fromJson(
          (json['role'] as Map<String, dynamic>?) ?? const <String, dynamic>{}),
      sellerApproved: json['sellerApproved'] as bool? ?? false,
    );
  }
}

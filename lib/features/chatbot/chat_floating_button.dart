import 'package:flutter/material.dart';
import 'chatbot_screen.dart';

class ChatFloatingButton extends StatelessWidget {
  const ChatFloatingButton({super.key});

  void _openChat(BuildContext context) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => const ChatbotScreen(),
        fullscreenDialog: true,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return FloatingActionButton(
      onPressed: () => _openChat(context),
      backgroundColor: const Color(0xFF232F3E),
      child: const Icon(Icons.chat_bubble, color: Colors.white),
    );
  }
}

import 'package:flutter_test/flutter_test.dart';
import 'package:onlineshop_flutterclient/app.dart';

void main() {
  testWidgets('App builds without crashing', (tester) async {
    await tester.pumpWidget(const OnlineShopApp());
  });
}

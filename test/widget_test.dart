import 'package:ayohadir/app.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('AyoHadir foundation renders', (tester) async {
    await tester.pumpWidget(const AyoHadirApp());

    expect(find.text('AyoHadir'), findsOneWidget);
    expect(find.text('Fondasi aplikasi berhasil disiapkan.'), findsOneWidget);
  });
}

import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';

import 'config.dart';
import 'screens/home_screen.dart';
import 'services/auth.dart';
import 'theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(options: AppConfig.firebaseOptions);
  AuthService.init();
  runApp(const SpareXApp());
}

class SpareXApp extends StatelessWidget {
  const SpareXApp({super.key});

  @override
  Widget build(BuildContext context) => MaterialApp(
        title: 'spareX',
        debugShowCheckedModeBanner: false,
        theme: buildTheme(),
        home: const HomeShell(),
      );
}

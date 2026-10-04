import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';

/// Build-time configuration, passed with --dart-define (see mobile/README.md).
/// Values match the web app's NEXT_PUBLIC_* settings so both talk to the same
/// Firebase project and backend.
class AppConfig {
  /// The deployed web app; the mobile app reuses its API routes for login and
  /// slot booking.
  static const apiBase = String.fromEnvironment(
    'API_BASE',
    defaultValue: 'https://spare-real.vercel.app',
  );

  static const _apiKey = String.fromEnvironment('FIREBASE_API_KEY');
  static const _projectId =
      String.fromEnvironment('FIREBASE_PROJECT_ID', defaultValue: 'sparex-79653');
  static const _senderId = String.fromEnvironment('FIREBASE_MESSAGING_SENDER_ID');
  static const _bucket = String.fromEnvironment('FIREBASE_STORAGE_BUCKET');
  static const _androidAppId = String.fromEnvironment('FIREBASE_ANDROID_APP_ID');
  static const _iosAppId = String.fromEnvironment('FIREBASE_IOS_APP_ID');

  static const msg91WidgetId = String.fromEnvironment('MSG91_WIDGET_ID');
  static const msg91TokenAuth = String.fromEnvironment('MSG91_TOKEN_AUTH');

  /// Web OAuth client ID from Firebase (Authentication → Google), needed on
  /// Android to get an ID token Firebase accepts.
  static const googleServerClientId =
      String.fromEnvironment('GOOGLE_SERVER_CLIENT_ID');

  static FirebaseOptions get firebaseOptions => FirebaseOptions(
        apiKey: _apiKey,
        appId: defaultTargetPlatform == TargetPlatform.iOS
            ? _iosAppId
            : _androidAppId,
        messagingSenderId: _senderId,
        projectId: _projectId,
        storageBucket: _bucket,
        iosBundleId: 'com.calecutech.sparex',
      );
}

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:sendotp_flutter_sdk/sendotp_flutter_sdk.dart';

import '../config.dart';
import 'api.dart';
import 'format.dart';

/// Same sign-in paths as the web: MSG91 SMS OTP (verified server-side by
/// /api/auth/verify-otp, which mints a phone-verified Firebase session),
/// username + password, or Google.
class AuthService {
  static final _auth = FirebaseAuth.instance;
  static String? _reqId;
  static bool _googleReady = false;

  static void init() {
    OTPWidget.initializeWidget(AppConfig.msg91WidgetId, AppConfig.msg91TokenAuth);
  }

  static Future<void> sendOtp(String phone) async {
    final digits = normalizePhone(phone);
    if (digits.length != 10) throw ApiException('Enter a 10-digit mobile number.');

    final res = await OTPWidget.sendOTP({'identifier': '91$digits'});
    if (res == null || res['type'] != 'success') {
      throw ApiException(res?['message']?.toString() ?? "Couldn't send the code. Try again.");
    }
    _reqId = (res['reqId'] ?? res['message']).toString();
  }

  static Future<void> verifyOtp(String phone, String otp) async {
    if (_reqId == null) throw ApiException('Send the code first.');

    final res = await OTPWidget.verifyOTP({'reqId': _reqId, 'otp': otp.trim()});
    if (res == null || res['type'] != 'success') {
      throw ApiException(res?['message']?.toString() ?? "That code isn't right.");
    }

    final data = await Api.post('/api/auth/verify-otp', {
      'phone': normalizePhone(phone),
      'accessToken': res['message'],
    });
    await _auth.signInWithCustomToken(data['customToken'] as String);
  }

  static Future<void> loginWithPassword(String username, String password) async {
    final data = await Api.post('/api/auth/password-login', {
      'username': username,
      'password': password,
    });
    await _auth.signInWithCustomToken(data['customToken'] as String);
  }

  static Future<void> _initGoogle() async {
    if (_googleReady) return;
    await GoogleSignIn.instance.initialize(
      serverClientId: AppConfig.googleServerClientId.isEmpty
          ? null
          : AppConfig.googleServerClientId,
    );
    _googleReady = true;
  }

  static Future<void> signInWithGoogle() async {
    await _initGoogle();
    final account = await GoogleSignIn.instance.authenticate();
    final idToken = account.authentication.idToken;
    await _auth.signInWithCredential(GoogleAuthProvider.credential(idToken: idToken));
  }

  static Future<void> signOut() async {
    // A Google session may come from an earlier app run, before
    // GoogleSignIn was initialized in this one.
    final usedGoogle = _auth.currentUser?.providerData
            .any((p) => p.providerId == GoogleAuthProvider.PROVIDER_ID) ??
        false;
    await _auth.signOut();
    if (_googleReady || usedGoogle) {
      try {
        await _initGoogle();
        await GoogleSignIn.instance.signOut();
      } catch (_) {
        // Firebase is already signed out; a stale Google session only means
        // the account picker may preselect it next time.
      }
    }
  }

  /// Permanently deletes the signed-in account and all its data via
  /// /api/account/delete (see that route for exactly what is removed), then
  /// signs out locally.
  static Future<void> deleteAccount() async {
    await Api.post('/api/account/delete', {}, auth: true);
    await signOut();
  }

  static Future<Map<String, dynamic>?> myProfile() async {
    final user = _auth.currentUser;
    if (user == null) return null;
    final snap = await FirebaseFirestore.instance.collection('users').doc(user.uid).get();
    return snap.data();
  }

  /// Mirrors saveUserProfile in src/services/userService.ts.
  static Future<void> saveProfile({
    required String name,
    required String phone,
    required String district,
    required String state,
    required List<String> roles,
  }) async {
    final user = _auth.currentUser!;
    await FirebaseFirestore.instance.collection('users').doc(user.uid).set({
      'uid': user.uid,
      'name': name,
      'phone': phone,
      'normalizedPhone': normalizePhone(phone),
      'district': district,
      'state': state,
      'place': '',
      'location': null,
      'roles': roles,
      'isPremium': false,
      'createdAt': DateTime.now().toUtc().toIso8601String(),
    });
  }
}

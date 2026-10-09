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

  static Future<void> signInWithGoogle() async {
    final google = GoogleSignIn.instance;
    if (!_googleReady) {
      await google.initialize(
        serverClientId: AppConfig.googleServerClientId.isEmpty
            ? null
            : AppConfig.googleServerClientId,
      );
      _googleReady = true;
    }
    final GoogleSignInAccount account;
    try {
      account = await google.authenticate();
    } on GoogleSignInException catch (e) {
      if (e.code == GoogleSignInExceptionCode.canceled) {
        throw ApiException('Google sign-in was cancelled.');
      }
      // Usually a missing SHA-1 / Android app in Firebase; keep the detail so
      // it can be diagnosed from the message the user sees.
      throw ApiException("Couldn't sign in with Google (${e.code.name}: ${e.description ?? ''}).");
    }
    final idToken = account.authentication.idToken;
    if (idToken == null) {
      throw ApiException("Couldn't sign in with Google. Please try again.");
    }
    await _auth.signInWithCredential(GoogleAuthProvider.credential(idToken: idToken));
  }

  static Future<void> signOut() async {
    await _auth.signOut();
    if (_googleReady) await GoogleSignIn.instance.signOut();
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

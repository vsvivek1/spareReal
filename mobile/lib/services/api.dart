import 'dart:convert';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:http/http.dart' as http;

import '../config.dart';

/// Thin client for the web app's API routes, which hold the server-side
/// logic (OTP verification, username login, capacity-checked bookings).
class Api {
  static Uri _uri(String path, [Map<String, String>? query]) =>
      Uri.parse('${AppConfig.apiBase}$path').replace(queryParameters: query);

  static Future<Map<String, dynamic>> _decode(http.Response res) async {
    Map<String, dynamic> body;
    try {
      body = jsonDecode(res.body) as Map<String, dynamic>;
    } catch (_) {
      body = {};
    }
    if (res.statusCode >= 400) {
      throw ApiException(body['error'] as String? ?? 'Something went wrong. Please try again.');
    }
    return body;
  }

  static Future<Map<String, dynamic>> post(String path, Map<String, dynamic> data,
      {bool auth = false}) async {
    final headers = {'Content-Type': 'application/json'};
    if (auth) {
      final token = await FirebaseAuth.instance.currentUser?.getIdToken();
      if (token == null) throw ApiException('Please log in first.');
      headers['Authorization'] = 'Bearer $token';
    }
    return _decode(await http.post(_uri(path), headers: headers, body: jsonEncode(data)));
  }

  static Future<Map<String, dynamic>> get(String path, Map<String, String> query) async =>
      _decode(await http.get(_uri(path, query)));
}

class ApiException implements Exception {
  ApiException(this.message);
  final String message;
  @override
  String toString() => message;
}

import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

final _rupees = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);

String formatPrice(dynamic value) {
  final n = value is num ? value : num.tryParse('$value');
  return n == null ? '' : _rupees.format(n);
}

String formatDateLabel(String date) =>
    DateFormat('EEE d MMM').format(DateTime.parse(date));

String formatTimeLabel(String time) {
  final parts = time.split(':').map(int.parse).toList();
  return DateFormat('h:mm a').format(DateTime(2000, 1, 1, parts[0], parts[1]));
}

/// Same rules as normalizePhone in src/services/userService.ts.
String normalizePhone(String phone) {
  var v = phone.replaceAll(RegExp(r'\D'), '');
  if (v.startsWith('91') && v.length == 12) v = v.substring(2);
  if (v.startsWith('0') && v.length == 11) v = v.substring(1);
  return v;
}

Future<void> callNumber(String phone) =>
    launchUrl(Uri(scheme: 'tel', path: phone));

Future<void> openWhatsApp(String phone, String message) {
  final digits = '91${normalizePhone(phone)}';
  return launchUrl(
    Uri.parse('https://wa.me/$digits?text=${Uri.encodeComponent(message)}'),
    mode: LaunchMode.externalApplication,
  );
}

/// India-local calendar days, matching bookableDates() on the web.
List<String> bookableDates([int days = 14]) {
  final now = DateTime.now().toUtc().add(const Duration(hours: 5, minutes: 30));
  final start = DateTime.utc(now.year, now.month, now.day);
  return List.generate(
    days,
    (i) => DateFormat('yyyy-MM-dd').format(start.add(Duration(days: i))),
  );
}

String todayIST() => bookableDates(1).first;

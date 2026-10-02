import 'package:flutter_test/flutter_test.dart';
import 'package:sparex/constants.dart';
import 'package:sparex/services/format.dart';

void main() {
  test('normalizePhone matches the web rules', () {
    expect(normalizePhone('+91 94960 10722'), '9496010722');
    expect(normalizePhone('09496010722'), '9496010722');
    expect(normalizePhone('9496010722'), '9496010722');
  });

  test('time labels', () {
    expect(formatTimeLabel('09:00'), '9:00 AM');
    expect(formatTimeLabel('13:30'), '1:30 PM');
  });

  test('booking window is 14 consecutive days starting today (IST)', () {
    final dates = bookableDates();
    expect(dates.length, 14);
    expect(dates.first, todayIST());
    expect(DateTime.parse(dates[1]).difference(DateTime.parse(dates[0])).inDays, 1);
  });

  test('petrol pumps are walk-in only', () {
    expect(isBookableSlug('petrol'), isFalse);
    expect(isBookableSlug('workshop'), isTrue);
  });
}

import 'dart:io';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_storage/firebase_storage.dart';

import 'api.dart';

typedef Doc = Map<String, dynamic>;

final _db = FirebaseFirestore.instance;

List<Doc> _docs(QuerySnapshot<Doc> snap) =>
    snap.docs.map((d) => {'id': d.id, ...d.data()}).toList();

int _newestFirst(Doc a, Doc b) =>
    ('${b['createdAt'] ?? ''}').compareTo('${a['createdAt'] ?? ''}');

String get _uid => FirebaseAuth.instance.currentUser!.uid;
String? get _phone => FirebaseAuth.instance.currentUser?.phoneNumber;

// ---- Spare listings -------------------------------------------------------

Future<List<Doc>> getListings() async =>
    _docs(await _db.collection('spareListings').get())..sort(_newestFirst);

Future<Doc?> getListing(String id) async {
  final snap = await _db.collection('spareListings').doc(id).get();
  return snap.exists ? {'id': snap.id, ...snap.data()!} : null;
}

Future<List<Doc>> getMyListings() async => _docs(await _db
    .collection('spareListings')
    .where('sellerId', isEqualTo: _uid)
    .get())
  ..sort(_newestFirst);

Future<void> deleteListing(String id) => _db.collection('spareListings').doc(id).delete();

Future<void> createListing({
  required Doc fields,
  required List<File> photos,
  required String? district,
}) async {
  final urls = <String>[];
  for (var i = 0; i < photos.length; i++) {
    final ref = FirebaseStorage.instance
        .ref('spare-images/${_uid}_${DateTime.now().millisecondsSinceEpoch}_$i.jpg');
    await ref.putFile(photos[i], SettableMetadata(contentType: 'image/jpeg'));
    urls.add(await ref.getDownloadURL());
  }

  await _db.collection('spareListings').add({
    ...fields,
    'status': 'Available',
    'imageUrl': urls.isEmpty ? null : urls.first,
    'photos': urls,
    'district': district,
    'sellerId': _uid,
    'sellerPhone': _phone,
    'createdAt': DateTime.now().toUtc().toIso8601String(),
  });
}

// ---- Spare requests -------------------------------------------------------

Future<List<Doc>> getRequests() async =>
    _docs(await _db.collection('spareRequests').get())..sort(_newestFirst);

Future<List<Doc>> getMyRequests() async => _docs(await _db
    .collection('spareRequests')
    .where('requesterId', isEqualTo: _uid)
    .get())
  ..sort(_newestFirst);

Future<void> deleteRequest(String id) => _db.collection('spareRequests').doc(id).delete();

Future<void> createRequest(Doc fields, String? district) =>
    _db.collection('spareRequests').add({
      ...fields,
      'district': district,
      'requesterId': _uid,
      'requesterPhone': _phone,
      'createdAt': DateTime.now().toUtc().toIso8601String(),
    });

// ---- Services and bookings -----------------------------------------------

Future<List<Doc>> getServicesByType(String slug) async =>
    _docs(await _db.collection('workshops').get())
        .where((s) => (s['typeSlug'] ?? 'workshop') == slug)
        .toList();

Future<Doc?> getService(String id) async {
  final snap = await _db.collection('workshops').doc(id).get();
  return snap.exists ? {'id': snap.id, ...snap.data()!} : null;
}

Future<void> createService(Doc fields) => _db.collection('workshops').add({
      ...fields,
      'ownerId': _uid,
      'createdAt': DateTime.now().toUtc().toIso8601String(),
    });

class Slot {
  Slot(this.time, this.capacity, this.booked, this.past);
  final String time;
  final int capacity;
  final int booked;
  final bool past;
  int get left => capacity - booked;
}

Future<List<Slot>> getSlotAvailability(String serviceId, String date) async {
  final data = await Api.get('/api/bookings', {'serviceId': serviceId, 'date': date});
  return (data['slots'] as List)
      .map((s) => Slot(s['time'], s['capacity'], s['booked'], s['past'] == true))
      .toList();
}

Future<void> createBooking({
  required String serviceId,
  required String date,
  required String time,
  required String vehicle,
  required String note,
}) =>
    Api.post('/api/bookings', {
      'serviceId': serviceId,
      'date': date,
      'time': time,
      'vehicle': vehicle,
      'note': note,
    }, auth: true);

/// Bookings I made, and bookings customers made at services I own. Loaded
/// through /api/bookings/mine so they don't depend on Firestore rules.
Future<(List<Doc>, List<Doc>)> getAllMyBookings() async {
  final data = await Api.get('/api/bookings/mine', {}, auth: true);
  List<Doc> list(String key) =>
      (data[key] as List).map((b) => Map<String, dynamic>.from(b as Map)).toList();
  return (list('mine'), list('incoming'));
}

/// Either side can cancel an open booking.
Future<void> cancelBooking(String id) =>
    Api.post('/api/bookings/update', {'id': id, 'action': 'cancel'}, auth: true);

/// The service owner marks the job as done.
Future<void> completeBooking(String id) =>
    Api.post('/api/bookings/update', {'id': id, 'action': 'complete'}, auth: true);

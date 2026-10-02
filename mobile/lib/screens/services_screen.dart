import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';

import '../constants.dart';
import '../services/data.dart';
import '../services/format.dart';
import '../widgets/common.dart';
import 'add_service_screen.dart';
import 'book_slot_screen.dart';

/// Services hub: workshops, washing/painting centers, petrol pumps, tyres.
class ServicesScreen extends StatelessWidget {
  const ServicesScreen({super.key});

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('Services')),
        body: GridView.count(
          padding: const EdgeInsets.all(16),
          crossAxisCount: 2,
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          childAspectRatio: 1.1,
          children: [
            for (final t in serviceTypes)
              Card(
                clipBehavior: Clip.antiAlias,
                child: InkWell(
                  onTap: () => Navigator.of(context).push(MaterialPageRoute(
                    builder: (_) => ServiceListScreen(slug: t.slug),
                  )),
                  child: Padding(
                    padding: const EdgeInsets.all(14),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text(t.icon, style: const TextStyle(fontSize: 32)),
                      const Spacer(),
                      Text(t.label, style: const TextStyle(fontWeight: FontWeight.w700)),
                      Text(t.blurb, style: TextStyle(color: Theme.of(context).hintColor, fontSize: 12)),
                    ]),
                  ),
                ),
              ),
          ],
        ),
      );
}

class ServiceListScreen extends StatefulWidget {
  const ServiceListScreen({super.key, required this.slug});
  final String slug;

  @override
  State<ServiceListScreen> createState() => _ServiceListScreenState();
}

class _ServiceListScreenState extends State<ServiceListScreen> {
  Position? _here;
  bool _locating = false;
  Key _listKey = UniqueKey();

  Future<void> _locate() async {
    setState(() => _locating = true);
    try {
      var perm = await Geolocator.checkPermission();
      if (perm == LocationPermission.denied) perm = await Geolocator.requestPermission();
      if (perm == LocationPermission.denied || perm == LocationPermission.deniedForever) {
        throw 'Allow location access to sort by distance.';
      }
      final pos = await Geolocator.getCurrentPosition();
      setState(() => _here = pos);
    } catch (e) {
      if (mounted) showMessage(context, e);
    } finally {
      if (mounted) setState(() => _locating = false);
    }
  }

  double? _km(Doc s) {
    if (_here == null || s['lat'] is! num || s['lng'] is! num) return null;
    return Geolocator.distanceBetween(
            _here!.latitude, _here!.longitude, (s['lat'] as num).toDouble(), (s['lng'] as num).toDouble()) /
        1000;
  }

  @override
  Widget build(BuildContext context) {
    final type = serviceTypeFor(widget.slug);
    final uid = FirebaseAuth.instance.currentUser?.uid;

    return Scaffold(
      appBar: AppBar(title: Text('${type.icon} ${type.label}')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          if (!await ensureLoggedIn(context) || !context.mounted) return;
          final added = await Navigator.of(context).push<bool>(MaterialPageRoute(
            builder: (_) => AddServiceScreen(initialSlug: widget.slug),
          ));
          if (added == true) setState(() => _listKey = UniqueKey());
        },
        icon: const Icon(Icons.add_business),
        label: const Text('List my service'),
      ),
      body: Column(children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
          child: OutlinedButton.icon(
            onPressed: _locating ? null : _locate,
            icon: const Icon(Icons.my_location),
            label: Text(_here == null ? 'Find ${type.label.toLowerCase()} near me' : 'Sorted by distance'),
          ),
        ),
        Expanded(
          child: AsyncView<List<Doc>>(
            key: _listKey,
            load: () => getServicesByType(widget.slug),
            builder: (context, services, _) {
              final items = [...services];
              if (_here != null) {
                items.sort((a, b) => (_km(a) ?? 1e9).compareTo(_km(b) ?? 1e9));
              }
              if (items.isEmpty) {
                return ListView(children: [
                  EmptyState(icon: type.icon, title: 'Nothing listed yet',
                      text: 'Be the first to list your ${type.singular.toLowerCase()}.'),
                ]);
              }
              return ListView.separated(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 96),
                itemCount: items.length,
                separatorBuilder: (_, _) => const SizedBox(height: 10),
                itemBuilder: (context, i) {
                  final s = items[i];
                  final km = _km(s);
                  final phone = '${s['phone'] ?? ''}';
                  final bookable = isBookableSlug(widget.slug) && s['ownerId'] != uid;
                  return Card(
                    child: Padding(
                      padding: const EdgeInsets.all(14),
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text('${s['name']}', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                        const SizedBox(height: 4),
                        Text(
                          '${s['address'] != null ? '${s['address']} · ' : ''}📍 ${s['district'] ?? 'Unknown'}'
                          '${km != null ? ' · ${km.toStringAsFixed(1)} km' : ''}',
                          style: TextStyle(color: Theme.of(context).hintColor),
                        ),
                        if (s['vehicleCapacity'] != null)
                          Text('Can take ${s['vehicleCapacity']} vehicle(s) at once',
                              style: TextStyle(color: Theme.of(context).hintColor)),
                        const SizedBox(height: 10),
                        if (bookable) ...[
                          FilledButton.icon(
                            onPressed: () => Navigator.of(context).push(MaterialPageRoute(
                              builder: (_) => BookSlotScreen(service: s),
                            )),
                            icon: const Icon(Icons.event_available),
                            label: const Text('Book a slot'),
                          ),
                          const SizedBox(height: 8),
                        ],
                        if (phone.isNotEmpty)
                          Row(children: [
                            Expanded(
                              child: OutlinedButton.icon(
                                onPressed: () => callNumber(phone),
                                icon: const Icon(Icons.call),
                                label: const Text('Call'),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: OutlinedButton.icon(
                                onPressed: () => openWhatsApp(phone, 'Hi, I found ${s['name']} on spareX and need your service.'),
                                icon: const Icon(Icons.chat),
                                label: const Text('WhatsApp'),
                              ),
                            ),
                          ]),
                      ]),
                    ),
                  );
                },
              );
            },
          ),
        ),
      ]),
    );
  }
}

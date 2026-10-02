import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';

import '../constants.dart';
import '../services/auth.dart';
import '../services/data.dart';
import '../widgets/common.dart';

/// List a service. Same `workshops` fields as /add-service, including the
/// booking hours.
class AddServiceScreen extends StatefulWidget {
  const AddServiceScreen({super.key, this.initialSlug = 'workshop'});
  final String initialSlug;

  @override
  State<AddServiceScreen> createState() => _AddServiceScreenState();
}

class _AddServiceScreenState extends State<AddServiceScreen> {
  late String _slug = widget.initialSlug;
  final _customType = TextEditingController();
  final _name = TextEditingController();
  final _phone = TextEditingController();
  final _address = TextEditingController();
  final _capacity = TextEditingController();
  final _district = TextEditingController();
  TimeOfDay _open = const TimeOfDay(hour: 9, minute: 0);
  TimeOfDay _close = const TimeOfDay(hour: 18, minute: 0);
  int _slotMinutes = 60;
  Position? _location;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    AuthService.myProfile().then((p) {
      if (p == null || !mounted) return;
      _phone.text = '${p['phone'] ?? ''}';
      _district.text = '${p['district'] ?? ''}';
    });
  }

  String _hhmm(TimeOfDay t) =>
      '${t.hour.toString().padLeft(2, '0')}:${t.minute.toString().padLeft(2, '0')}';

  Future<void> _locate() async {
    try {
      var perm = await Geolocator.checkPermission();
      if (perm == LocationPermission.denied) perm = await Geolocator.requestPermission();
      if (perm == LocationPermission.denied || perm == LocationPermission.deniedForever) {
        throw 'Allow location access so people can find you nearby.';
      }
      final pos = await Geolocator.getCurrentPosition();
      setState(() => _location = pos);
    } catch (e) {
      if (mounted) showMessage(context, e);
    }
  }

  Future<void> _save() async {
    final isWorkshop = _slug == 'workshop';
    final isOther = _slug == 'other';
    final bookable = isBookableSlug(_slug);
    final capacity = int.tryParse(_capacity.text.trim());

    if (isOther && _customType.text.trim().isEmpty) return showMessage(context, 'Enter what kind of service this is.');
    if (_name.text.trim().isEmpty) return showMessage(context, 'Enter the service name.');
    if (_phone.text.trim().isEmpty) return showMessage(context, 'Enter a contact phone number.');
    if (_location == null) return showMessage(context, 'Tap "Use my current location" first.');
    if (isWorkshop && (capacity == null || capacity <= 0)) {
      return showMessage(context, 'Enter how many vehicles you can take in.');
    }
    if (bookable && _hhmm(_open).compareTo(_hhmm(_close)) >= 0) {
      return showMessage(context, 'Closing time must be after opening time.');
    }

    setState(() => _saving = true);
    try {
      await createService({
        'name': _name.text.trim(),
        'type': isOther ? _customType.text.trim() : serviceTypeFor(_slug).singular,
        'typeSlug': _slug,
        'phone': _phone.text.trim(),
        'address': _address.text.trim().isEmpty ? null : _address.text.trim(),
        'vehicleCapacity': isWorkshop ? capacity : null,
        'district': _district.text.trim().isEmpty ? null : _district.text.trim(),
        'lat': _location!.latitude,
        'lng': _location!.longitude,
        if (bookable) ...{
          'openTime': _hhmm(_open),
          'closeTime': _hhmm(_close),
          'slotMinutes': _slotMinutes,
        },
      });
      if (mounted) Navigator.of(context).pop(true);
    } catch (e) {
      if (mounted) showMessage(context, "Couldn't save this service. $e");
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    const gap = SizedBox(height: 12);
    final bookable = isBookableSlug(_slug);
    return Scaffold(
      appBar: AppBar(title: const Text('List my service')),
      body: ListView(padding: const EdgeInsets.all(20), children: [
        DropdownButtonFormField(
          initialValue: _slug,
          decoration: const InputDecoration(labelText: 'Service type'),
          items: [for (final t in serviceTypes) DropdownMenuItem(value: t.slug, child: Text('${t.icon} ${t.singular}'))],
          onChanged: (v) => setState(() => _slug = v!),
        ),
        if (_slug == 'other') ...[
          gap,
          TextField(controller: _customType, decoration: const InputDecoration(labelText: 'What kind of service?')),
        ],
        gap,
        TextField(controller: _name, decoration: const InputDecoration(labelText: 'Name')),
        gap,
        TextField(controller: _phone, keyboardType: TextInputType.phone, decoration: const InputDecoration(labelText: 'Contact phone')),
        gap,
        TextField(controller: _address, decoration: const InputDecoration(labelText: 'Address (optional)')),
        gap,
        TextField(controller: _district, decoration: const InputDecoration(labelText: 'District')),
        if (_slug == 'workshop') ...[
          gap,
          TextField(
            controller: _capacity,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(labelText: 'Vehicles you can take in at once'),
          ),
        ],
        if (bookable) ...[
          const SizedBox(height: 20),
          const Text('Opening hours for bookings', style: TextStyle(fontWeight: FontWeight.w700)),
          const SizedBox(height: 8),
          Row(children: [
            Expanded(
              child: OutlinedButton(
                onPressed: () async {
                  final t = await showTimePicker(context: context, initialTime: _open);
                  if (t != null) setState(() => _open = t);
                },
                child: Text('Opens ${_open.format(context)}'),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: OutlinedButton(
                onPressed: () async {
                  final t = await showTimePicker(context: context, initialTime: _close);
                  if (t != null) setState(() => _close = t);
                },
                child: Text('Closes ${_close.format(context)}'),
              ),
            ),
          ]),
          gap,
          SegmentedButton<int>(
            segments: const [
              ButtonSegment(value: 30, label: Text('30 min')),
              ButtonSegment(value: 60, label: Text('1 hr')),
              ButtonSegment(value: 120, label: Text('2 hr')),
            ],
            selected: {_slotMinutes},
            onSelectionChanged: (s) => setState(() => _slotMinutes = s.first),
          ),
        ],
        const SizedBox(height: 20),
        OutlinedButton.icon(
          onPressed: _locate,
          icon: const Icon(Icons.my_location),
          label: Text(_location == null ? 'Use my current location' : 'Location set'),
        ),
        const SizedBox(height: 20),
        FilledButton(onPressed: _saving ? null : _save, child: const Text('List my service')),
      ]),
    );
  }
}

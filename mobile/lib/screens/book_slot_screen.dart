import 'package:flutter/material.dart';

import '../services/data.dart';
import '../services/format.dart';
import '../widgets/common.dart';

/// Pick a day and a free slot. Booking goes through /api/bookings, which
/// checks capacity in a transaction.
class BookSlotScreen extends StatefulWidget {
  const BookSlotScreen({super.key, required this.service});
  final Doc service;

  @override
  State<BookSlotScreen> createState() => _BookSlotScreenState();
}

class _BookSlotScreenState extends State<BookSlotScreen> {
  final _dates = bookableDates();
  late String _date = _dates.first;
  String? _time;
  List<Slot>? _slots;
  String? _error;
  bool _booking = false;
  final _vehicle = TextEditingController();
  final _note = TextEditingController();

  String get _id => widget.service['id'] as String;

  @override
  void initState() {
    super.initState();
    _loadSlots();
  }

  Future<void> _loadSlots() async {
    setState(() {
      _slots = null;
      _time = null;
      _error = null;
    });
    try {
      final slots = await getSlotAvailability(_id, _date);
      if (mounted) setState(() => _slots = slots);
    } catch (e) {
      if (mounted) setState(() => _error = '$e');
    }
  }

  Future<void> _book() async {
    if (_time == null) return showMessage(context, 'Pick a time slot.');
    if (_vehicle.text.trim().isEmpty) return showMessage(context, "Tell them which vehicle you're bringing.");
    if (!await ensureLoggedIn(context) || !mounted) return;

    setState(() => _booking = true);
    try {
      await createBooking(
        serviceId: _id,
        date: _date,
        time: _time!,
        vehicle: _vehicle.text.trim(),
        note: _note.text.trim(),
      );
      if (!mounted) return;
      showMessage(context, 'Booked for ${formatDateLabel(_date)}, ${formatTimeLabel(_time!)}.');
      Navigator.of(context).pop(true);
    } catch (e) {
      if (mounted) showMessage(context, e);
      _loadSlots();
    } finally {
      if (mounted) setState(() => _booking = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Book · ${widget.service['name']}')),
      body: ListView(padding: const EdgeInsets.all(20), children: [
        const Text('Day', style: TextStyle(fontWeight: FontWeight.w700)),
        const SizedBox(height: 8),
        SizedBox(
          height: 44,
          child: ListView(scrollDirection: Axis.horizontal, children: [
            for (final d in _dates)
              Padding(
                padding: const EdgeInsets.only(right: 8),
                child: ChoiceChip(
                  label: Text(formatDateLabel(d)),
                  selected: d == _date,
                  onSelected: (_) {
                    setState(() => _date = d);
                    _loadSlots();
                  },
                ),
              ),
          ]),
        ),
        const SizedBox(height: 20),
        const Text('Time', style: TextStyle(fontWeight: FontWeight.w700)),
        const SizedBox(height: 8),
        if (_error != null)
          Text(_error!, style: const TextStyle(color: Colors.redAccent))
        else if (_slots == null)
          const Center(child: Padding(padding: EdgeInsets.all(16), child: CircularProgressIndicator()))
        else if (_slots!.isEmpty)
          const Text('No slots on this day.')
        else
          Wrap(spacing: 8, runSpacing: 8, children: [
            for (final s in _slots!)
              ChoiceChip(
                label: Text(s.past
                    ? formatTimeLabel(s.time)
                    : '${formatTimeLabel(s.time)} · ${s.left <= 0 ? 'Full' : '${s.left} free'}'),
                selected: _time == s.time,
                onSelected: s.past || s.left <= 0 ? null : (_) => setState(() => _time = s.time),
              ),
          ]),
        const SizedBox(height: 20),
        TextField(
          controller: _vehicle,
          decoration: const InputDecoration(labelText: 'Your vehicle', hintText: 'e.g. Swift 2016, KL-07-AB-1234'),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _note,
          maxLines: 3,
          decoration: const InputDecoration(labelText: 'What needs doing? (optional)'),
        ),
        const SizedBox(height: 20),
        FilledButton(
          onPressed: _booking ? null : _book,
          child: Text(_time == null
              ? 'Book this slot'
              : 'Book ${formatDateLabel(_date)}, ${formatTimeLabel(_time!)}'),
        ),
      ]),
    );
  }
}

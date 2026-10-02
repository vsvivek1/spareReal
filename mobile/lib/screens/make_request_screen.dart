import 'package:flutter/material.dart';

import '../constants.dart';
import '../services/auth.dart';
import '../services/data.dart';
import '../widgets/common.dart';

/// Ask sellers for a part. Same spareRequests fields as /make-request.
class MakeRequestScreen extends StatefulWidget {
  const MakeRequestScreen({super.key});

  @override
  State<MakeRequestScreen> createState() => _MakeRequestScreenState();
}

class _MakeRequestScreenState extends State<MakeRequestScreen> {
  final _sparePart = TextEditingController();
  final _model = TextEditingController();
  final _year = TextEditingController();
  final _budget = TextEditingController();
  final _description = TextEditingController();
  String? _brand;
  String _condition = 'Used';
  bool _saving = false;

  Future<void> _save() async {
    if (_sparePart.text.trim().isEmpty) return showMessage(context, 'Enter the part you need.');
    if (_brand == null) return showMessage(context, 'Pick the vehicle make.');

    setState(() => _saving = true);
    try {
      final profile = await AuthService.myProfile();
      await createRequest({
        'brand': _brand,
        'model': _model.text.trim(),
        'year': _year.text.trim(),
        'sparePart': _sparePart.text.trim(),
        'description': _description.text.trim(),
        'budget': _budget.text.trim(),
        'condition': _condition,
      }, profile?['district'] as String?);
      if (!mounted) return;
      showMessage(context, 'Request posted. Sellers can contact you on WhatsApp.');
      Navigator.of(context).pop(true);
    } catch (e) {
      if (mounted) showMessage(context, "Couldn't post your request. $e");
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    const gap = SizedBox(height: 12);
    return Scaffold(
      appBar: AppBar(title: const Text('Request a part')),
      body: ListView(padding: const EdgeInsets.all(20), children: [
        TextField(controller: _sparePart, decoration: const InputDecoration(labelText: 'Part you need')),
        gap,
        DropdownButtonFormField<String>(
          initialValue: _brand,
          decoration: const InputDecoration(labelText: 'Vehicle make'),
          items: [for (final m in vehicleMakes) DropdownMenuItem(value: m, child: Text(m))],
          onChanged: (v) => setState(() => _brand = v),
        ),
        gap,
        Row(children: [
          Expanded(child: TextField(controller: _model, decoration: const InputDecoration(labelText: 'Model'))),
          const SizedBox(width: 12),
          SizedBox(
            width: 110,
            child: TextField(
              controller: _year,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Year'),
            ),
          ),
        ]),
        gap,
        TextField(
          controller: _budget,
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(labelText: 'Budget (₹, optional)'),
        ),
        gap,
        DropdownButtonFormField(
          initialValue: _condition,
          decoration: const InputDecoration(labelText: 'Condition'),
          items: [for (final c in conditions) DropdownMenuItem(value: c, child: Text(c))],
          onChanged: (v) => setState(() => _condition = v!),
        ),
        gap,
        TextField(controller: _description, maxLines: 4, decoration: const InputDecoration(labelText: 'Details')),
        const SizedBox(height: 20),
        FilledButton(onPressed: _saving ? null : _save, child: const Text('Post request')),
      ]),
    );
  }
}

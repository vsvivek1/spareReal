import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

import '../services/auth.dart';
import '../widgets/common.dart';

const _roles = ['Buyer', 'Seller', 'Wholesale Dealer', 'Workshop'];

/// First-time profile, same fields as /user/register on the web.
class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _name = TextEditingController();
  late final _phone = TextEditingController(
    text: (FirebaseAuth.instance.currentUser?.phoneNumber ?? '').replaceFirst('+91', ''),
  );
  final _district = TextEditingController();
  final _state = TextEditingController(text: 'Kerala');
  final _picked = <String>{'Buyer'};
  bool _saving = false;

  Future<void> _save() async {
    if (_name.text.trim().isEmpty || _phone.text.trim().isEmpty || _district.text.trim().isEmpty) {
      showMessage(context, 'Fill in your name, phone and district.');
      return;
    }
    setState(() => _saving = true);
    try {
      await AuthService.saveProfile(
        name: _name.text.trim(),
        phone: _phone.text.trim(),
        district: _district.text.trim(),
        state: _state.text.trim(),
        roles: _picked.toList(),
      );
      if (mounted) Navigator.of(context).pop(true);
    } catch (e) {
      if (mounted) showMessage(context, "Couldn't save your profile. $e");
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('Create your profile')),
        body: ListView(padding: const EdgeInsets.all(20), children: [
          TextField(controller: _name, decoration: const InputDecoration(labelText: 'Your name')),
          const SizedBox(height: 12),
          TextField(
            controller: _phone,
            keyboardType: TextInputType.phone,
            decoration: const InputDecoration(labelText: 'Mobile number', prefixText: '+91 '),
          ),
          const SizedBox(height: 12),
          TextField(controller: _district, decoration: const InputDecoration(labelText: 'District')),
          const SizedBox(height: 12),
          TextField(controller: _state, decoration: const InputDecoration(labelText: 'State')),
          const SizedBox(height: 16),
          const Text('I am a…'),
          const SizedBox(height: 8),
          Wrap(spacing: 8, runSpacing: 8, children: [
            for (final r in _roles)
              FilterChip(
                label: Text(r),
                selected: _picked.contains(r),
                onSelected: (on) => setState(() => on ? _picked.add(r) : _picked.remove(r)),
              ),
          ]),
          const SizedBox(height: 24),
          FilledButton(onPressed: _saving ? null : _save, child: const Text('Save and continue')),
        ]),
      );
}

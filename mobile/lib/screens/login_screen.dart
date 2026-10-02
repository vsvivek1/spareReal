import 'package:flutter/material.dart';

import '../services/auth.dart';
import '../widgets/common.dart';
import 'register_screen.dart';

/// Pops with `true` once the user is signed in and has a profile.
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _phone = TextEditingController();
  final _otp = TextEditingController();
  final _username = TextEditingController();
  final _password = TextEditingController();

  bool _otpSent = false;
  bool _busy = false;
  bool _usePassword = false;

  Future<void> _run(Future<void> Function() action) async {
    setState(() => _busy = true);
    try {
      await action();
    } catch (e) {
      if (mounted) showMessage(context, e);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _afterSignIn() async {
    final profile = await AuthService.myProfile();
    if (!mounted) return;
    if (profile == null) {
      final done = await Navigator.of(context).push<bool>(
        MaterialPageRoute(builder: (_) => const RegisterScreen()),
      );
      if (done != true) return;
    }
    if (mounted) Navigator.of(context).pop(true);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Log in')),
      body: ListView(padding: const EdgeInsets.all(20), children: [
        Text('Welcome to spareX', style: Theme.of(context).textTheme.headlineSmall),
        const SizedBox(height: 4),
        Text('Buy and sell spare parts, and book workshop slots.',
            style: TextStyle(color: Theme.of(context).hintColor)),
        const SizedBox(height: 24),
        if (!_usePassword) ...[
          TextField(
            controller: _phone,
            keyboardType: TextInputType.phone,
            decoration: const InputDecoration(labelText: 'Mobile number', prefixText: '+91 '),
            enabled: !_otpSent,
          ),
          const SizedBox(height: 12),
          if (_otpSent) ...[
            TextField(
              controller: _otp,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Code from SMS'),
            ),
            const SizedBox(height: 12),
            FilledButton(
              onPressed: _busy
                  ? null
                  : () => _run(() async {
                        await AuthService.verifyOtp(_phone.text, _otp.text);
                        await _afterSignIn();
                      }),
              child: const Text('Verify and continue'),
            ),
            TextButton(
              onPressed: _busy ? null : () => setState(() => _otpSent = false),
              child: const Text('Change number'),
            ),
          ] else
            FilledButton(
              onPressed: _busy
                  ? null
                  : () => _run(() async {
                        await AuthService.sendOtp(_phone.text);
                        setState(() => _otpSent = true);
                      }),
              child: const Text('Send code'),
            ),
        ] else ...[
          TextField(controller: _username, decoration: const InputDecoration(labelText: 'Username')),
          const SizedBox(height: 12),
          TextField(
            controller: _password,
            obscureText: true,
            decoration: const InputDecoration(labelText: 'Password'),
          ),
          const SizedBox(height: 12),
          FilledButton(
            onPressed: _busy
                ? null
                : () => _run(() async {
                      await AuthService.loginWithPassword(_username.text, _password.text);
                      await _afterSignIn();
                    }),
            child: const Text('Log in'),
          ),
        ],
        TextButton(
          onPressed: _busy ? null : () => setState(() => _usePassword = !_usePassword),
          child: Text(_usePassword ? 'Use SMS code instead' : 'Use username and password'),
        ),
        const Divider(height: 32),
        OutlinedButton.icon(
          onPressed: _busy
              ? null
              : () => _run(() async {
                    await AuthService.signInWithGoogle();
                    await _afterSignIn();
                  }),
          icon: const Text('G', style: TextStyle(fontWeight: FontWeight.w900)),
          label: const Text('Continue with Google'),
        ),
        if (_busy) const Padding(padding: EdgeInsets.all(16), child: Center(child: CircularProgressIndicator())),
      ]),
    );
  }
}

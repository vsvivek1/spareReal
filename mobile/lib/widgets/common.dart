import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

import '../screens/login_screen.dart';
import '../services/format.dart';
import '../theme.dart';

void showMessage(BuildContext context, Object message) {
  ScaffoldMessenger.of(context)
      .showSnackBar(SnackBar(content: Text(message.toString())));
}

/// Sends the user to log in when needed. Returns true once signed in.
Future<bool> ensureLoggedIn(BuildContext context) async {
  if (FirebaseAuth.instance.currentUser != null) return true;
  final ok = await Navigator.of(context).push<bool>(
    MaterialPageRoute(builder: (_) => const LoginScreen()),
  );
  return ok == true && FirebaseAuth.instance.currentUser != null;
}

class EmptyState extends StatelessWidget {
  const EmptyState({super.key, required this.icon, required this.title, this.text, this.action});
  final String icon;
  final String title;
  final String? text;
  final Widget? action;

  @override
  Widget build(BuildContext context) => Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Text(icon, style: const TextStyle(fontSize: 44)),
            const SizedBox(height: 12),
            Text(title, style: Theme.of(context).textTheme.titleMedium),
            if (text != null) ...[
              const SizedBox(height: 6),
              Text(text!, textAlign: TextAlign.center,
                  style: TextStyle(color: Theme.of(context).hintColor)),
            ],
            if (action != null) ...[const SizedBox(height: 16), action!],
          ]),
        ),
      );
}

/// Loads [load] and renders the result, with loading, error and
/// pull-to-refresh handled in one place.
class AsyncView<T> extends StatefulWidget {
  const AsyncView({super.key, required this.load, required this.builder});
  final Future<T> Function() load;
  final Widget Function(BuildContext context, T data, Future<void> Function() reload) builder;

  @override
  State<AsyncView<T>> createState() => _AsyncViewState<T>();
}

class _AsyncViewState<T> extends State<AsyncView<T>> {
  late Future<T> _future = widget.load();

  Future<void> _reload() async {
    final next = widget.load();
    setState(() => _future = next);
    await next.catchError((_) => null as T);
  }

  @override
  Widget build(BuildContext context) => FutureBuilder<T>(
        future: _future,
        builder: (context, snap) {
          if (snap.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snap.hasError) {
            return EmptyState(
              icon: '⚠️',
              title: "Couldn't load this",
              text: '${snap.error}',
              action: OutlinedButton(onPressed: _reload, child: const Text('Try again')),
            );
          }
          return RefreshIndicator(
            onRefresh: _reload,
            child: widget.builder(context, snap.data as T, _reload),
          );
        },
      );
}

class ListingCard extends StatelessWidget {
  const ListingCard({super.key, required this.listing, this.onTap, this.trailing});
  final Map<String, dynamic> listing;
  final VoidCallback? onTap;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    final image = listing['imageUrl'] as String?;
    final vehicle = [listing['make'], listing['model'], listing['year']]
        .where((v) => v != null && '$v'.isNotEmpty)
        .join(' ');
    final weight = listing['unitType'] == 'Weight';

    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          SizedBox(
            width: 104,
            height: 104,
            child: image == null
                ? Container(color: Colors.white10, child: const Center(child: Text('🔩', style: TextStyle(fontSize: 32))))
                : Image.network(image, fit: BoxFit.cover,
                    errorBuilder: (_, _, _) => Container(color: Colors.white10)),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('${listing['title'] ?? ''}',
                    maxLines: 2, overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontWeight: FontWeight.w700)),
                const SizedBox(height: 4),
                Text(
                  [listing['category'], if (vehicle.isNotEmpty) vehicle, '📍 ${listing['district'] ?? 'Unknown'}']
                      .whereType<String>()
                      .join(' · '),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(color: Theme.of(context).hintColor, fontSize: 12.5),
                ),
                const SizedBox(height: 6),
                Row(children: [
                  Text('${formatPrice(listing['price'])}${weight ? '/kg' : ''}',
                      style: const TextStyle(color: brandAlt, fontWeight: FontWeight.w800, fontSize: 16)),
                  const Spacer(),
                  if (listing['status'] != null && listing['status'] != 'Available')
                    Text('${listing['status']}', style: const TextStyle(fontSize: 12, color: Colors.orangeAccent)),
                  ?trailing,
                ]),
              ]),
            ),
          ),
        ]),
      ),
    );
  }
}

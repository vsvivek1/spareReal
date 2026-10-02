import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

import '../services/auth.dart';
import '../services/data.dart';
import '../services/format.dart';
import '../widgets/common.dart';
import 'listing_detail_screen.dart';
import 'login_screen.dart';
import 'parts_screen.dart';

/// My Account: listings, requests and bookings, like /my-account.
class AccountScreen extends StatelessWidget {
  const AccountScreen({super.key});

  @override
  Widget build(BuildContext context) => StreamBuilder<User?>(
        stream: FirebaseAuth.instance.authStateChanges(),
        builder: (context, snap) {
          if (snap.data == null) {
            return Scaffold(
              appBar: AppBar(title: const Text('My Account')),
              body: EmptyState(
                icon: '👤',
                title: 'Log in to manage your account',
                text: 'Your listings, requests and bookings live here.',
                action: FilledButton(
                  onPressed: () => Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const LoginScreen()),
                  ),
                  child: const Text('Log in'),
                ),
              ),
            );
          }

          return DefaultTabController(
            length: 3,
            child: Scaffold(
              appBar: AppBar(
                title: const Text('My Account'),
                actions: [
                  IconButton(
                    tooltip: 'Log out',
                    onPressed: AuthService.signOut,
                    icon: const Icon(Icons.logout),
                  ),
                ],
                bottom: const TabBar(tabs: [
                  Tab(text: 'Listings'),
                  Tab(text: 'Requests'),
                  Tab(text: 'Bookings'),
                ]),
              ),
              body: const TabBarView(children: [_MyListings(), _MyRequests(), _MyBookings()]),
            ),
          );
        },
      );
}

Future<bool> _confirm(BuildContext context, String question) async =>
    await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        content: Text(question),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('No')),
          TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Yes')),
        ],
      ),
    ) ==
    true;

class _MyListings extends StatelessWidget {
  const _MyListings();

  @override
  Widget build(BuildContext context) => AsyncView<List<Doc>>(
        load: getMyListings,
        builder: (context, items, reload) => items.isEmpty
            ? ListView(children: const [EmptyState(icon: '🔩', title: 'No listings yet')])
            : ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: items.length,
                separatorBuilder: (_, _) => const SizedBox(height: 10),
                itemBuilder: (context, i) => ListingCard(
                  listing: items[i],
                  onTap: () => Navigator.of(context).push(MaterialPageRoute(
                    builder: (_) => ListingDetailScreen(id: items[i]['id']),
                  )),
                  trailing: IconButton(
                    icon: const Icon(Icons.delete_outline),
                    onPressed: () async {
                      if (!await _confirm(context, 'Remove this listing?')) return;
                      await deleteListing(items[i]['id']);
                      await reload();
                    },
                  ),
                ),
              ),
      );
}

class _MyRequests extends StatelessWidget {
  const _MyRequests();

  @override
  Widget build(BuildContext context) => AsyncView<List<Doc>>(
        load: getMyRequests,
        builder: (context, items, reload) => items.isEmpty
            ? ListView(children: const [EmptyState(icon: '📝', title: 'No requests yet')])
            : ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: items.length,
                separatorBuilder: (_, _) => const SizedBox(height: 10),
                itemBuilder: (context, i) => RequestCard(
                  request: items[i],
                  onDelete: () async {
                    if (!await _confirm(context, 'Remove this request?')) return;
                    await deleteRequest(items[i]['id']);
                    await reload();
                  },
                ),
              ),
      );
}

class _MyBookings extends StatelessWidget {
  const _MyBookings();

  @override
  Widget build(BuildContext context) => AsyncView<(List<Doc>, List<Doc>)>(
        load: () async => (await getMyBookings(), await getBookingsForMyServices()),
        builder: (context, data, reload) {
          final (mine, incoming) = data;
          final today = todayIST();

          Widget card(Doc b, bool asOwner) {
            final upcoming = b['status'] == 'booked' && '${b['date']}'.compareTo(today) >= 0;
            final phone = '${asOwner ? b['customerPhone'] : b['servicePhone'] ?? ''}';
            return Card(
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('${asOwner ? b['customerName'] : b['serviceName']}',
                      style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                  const SizedBox(height: 4),
                  Text('📅 ${formatDateLabel(b['date'])} · ${formatTimeLabel(b['time'])}'
                      '${asOwner ? ' · ${b['serviceName']}' : ''}'),
                  Text('🚗 ${b['vehicle']}'),
                  if ('${b['note'] ?? ''}'.isNotEmpty) Text('${b['note']}'),
                  const SizedBox(height: 6),
                  Text(
                    b['status'] == 'cancelled' ? 'Cancelled' : upcoming ? 'Booked' : 'Done',
                    style: TextStyle(
                      color: b['status'] == 'cancelled' ? Colors.redAccent : Colors.greenAccent,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  if (upcoming)
                    Row(children: [
                      if (phone.isNotEmpty)
                        TextButton.icon(
                          onPressed: () => openWhatsApp(phone,
                              'Hi, about the spareX booking on ${formatDateLabel(b['date'])} at ${formatTimeLabel(b['time'])}.'),
                          icon: const Icon(Icons.chat, size: 18),
                          label: const Text('WhatsApp'),
                        ),
                      TextButton.icon(
                        onPressed: () async {
                          if (!await _confirm(context, 'Cancel this booking?')) return;
                          await cancelBooking(b['id']);
                          await reload();
                        },
                        icon: const Icon(Icons.cancel_outlined, size: 18),
                        label: const Text('Cancel'),
                      ),
                    ]),
                ]),
              ),
            );
          }

          return ListView(padding: const EdgeInsets.all(16), children: [
            Text('My bookings', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            if (mine.isEmpty)
              const EmptyState(icon: '📅', title: 'No bookings yet', text: 'Book a slot from the Services tab.')
            else
              for (final b in mine) Padding(padding: const EdgeInsets.only(bottom: 10), child: card(b, false)),
            if (incoming.isNotEmpty) ...[
              const SizedBox(height: 16),
              Text('Bookings at my services', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 8),
              for (final b in incoming) Padding(padding: const EdgeInsets.only(bottom: 10), child: card(b, true)),
            ],
          ]);
        },
      );
}

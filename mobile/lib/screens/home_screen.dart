import 'package:flutter/material.dart';

import '../services/data.dart';
import '../theme.dart';
import '../widgets/common.dart';
import 'account_screen.dart';
import 'add_listing_screen.dart';
import 'listing_detail_screen.dart';
import 'make_request_screen.dart';
import 'parts_screen.dart';
import 'services_screen.dart';

/// Bottom-tab shell: Home, Spare Parts, Services, Account.
class HomeShell extends StatefulWidget {
  const HomeShell({super.key});

  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  int _tab = 0;

  @override
  Widget build(BuildContext context) => Scaffold(
        body: IndexedStack(index: _tab, children: [
          _HomeTab(onOpenTab: (i) => setState(() => _tab = i)),
          const PartsScreen(),
          const ServicesScreen(),
          const AccountScreen(),
        ]),
        bottomNavigationBar: NavigationBar(
          selectedIndex: _tab,
          onDestinationSelected: (i) => setState(() => _tab = i),
          destinations: const [
            NavigationDestination(icon: Icon(Icons.home_outlined), label: 'Home'),
            NavigationDestination(icon: Icon(Icons.build_outlined), label: 'Spare Parts'),
            NavigationDestination(icon: Icon(Icons.car_repair), label: 'Services'),
            NavigationDestination(icon: Icon(Icons.person_outline), label: 'Account'),
          ],
        ),
      );
}

class _HomeTab extends StatelessWidget {
  const _HomeTab({required this.onOpenTab});
  final ValueChanged<int> onOpenTab;

  Future<void> _open(BuildContext context, Widget screen) async {
    if (!await ensureLoggedIn(context) || !context.mounted) return;
    Navigator.of(context).push(MaterialPageRoute(builder: (_) => screen));
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(
          title: const Text('spareX', style: TextStyle(fontWeight: FontWeight.w900)),
        ),
        body: AsyncView<List<Doc>>(
          load: getListings,
          builder: (context, listings, _) => ListView(padding: const EdgeInsets.all(16), children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(18),
                gradient: const LinearGradient(colors: [brand, brandAlt]),
              ),
              child: const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('Second-hand spare parts,\nnear you.',
                    style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: Colors.white)),
                SizedBox(height: 6),
                Text('Buy, sell, request parts and book workshop slots.',
                    style: TextStyle(color: Colors.white70)),
              ]),
            ),
            const SizedBox(height: 16),
            Row(children: [
              Expanded(child: _Action(icon: '🏷️', label: 'Sell a part', onTap: () => _open(context, const AddListingScreen()))),
              const SizedBox(width: 10),
              Expanded(child: _Action(icon: '📝', label: 'Request a part', onTap: () => _open(context, const MakeRequestScreen()))),
              const SizedBox(width: 10),
              Expanded(child: _Action(icon: '📅', label: 'Book a service', onTap: () => onOpenTab(2))),
            ]),
            const SizedBox(height: 24),
            Row(children: [
              Text('Latest parts', style: Theme.of(context).textTheme.titleMedium),
              const Spacer(),
              TextButton(onPressed: () => onOpenTab(1), child: const Text('See all')),
            ]),
            if (listings.isEmpty)
              const EmptyState(icon: '🔩', title: 'No parts listed yet')
            else
              for (final l in listings.take(10))
                Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: ListingCard(
                    listing: l,
                    onTap: () => Navigator.of(context).push(MaterialPageRoute(
                      builder: (_) => ListingDetailScreen(id: l['id']),
                    )),
                  ),
                ),
          ]),
        ),
      );
}

class _Action extends StatelessWidget {
  const _Action({required this.icon, required this.label, required this.onTap});
  final String icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => Card(
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
            child: Column(children: [
              Text(icon, style: const TextStyle(fontSize: 26)),
              const SizedBox(height: 6),
              Text(label, textAlign: TextAlign.center, style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600)),
            ]),
          ),
        ),
      );
}

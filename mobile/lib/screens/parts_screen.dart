import 'package:flutter/material.dart';

import '../constants.dart';
import '../services/data.dart';
import '../services/format.dart';
import '../widgets/common.dart';
import 'add_listing_screen.dart';
import 'listing_detail_screen.dart';
import 'make_request_screen.dart';

/// Spare Parts: Buy (browse listings) and Requests (what buyers are looking
/// for), like the web's Spare Parts menu.
class PartsScreen extends StatelessWidget {
  const PartsScreen({super.key});

  @override
  Widget build(BuildContext context) => DefaultTabController(
        length: 2,
        child: Scaffold(
          appBar: AppBar(
            title: const Text('Spare Parts'),
            bottom: const TabBar(tabs: [Tab(text: 'Buy'), Tab(text: 'Wanted')]),
          ),
          body: const TabBarView(children: [_BrowseListings(), _BrowseRequests()]),
          floatingActionButton: Builder(
            builder: (context) => FloatingActionButton.extended(
              onPressed: () async {
                if (!await ensureLoggedIn(context) || !context.mounted) return;
                final buying = DefaultTabController.of(context).index == 0;
                Navigator.of(context).push(MaterialPageRoute(
                  builder: (_) => buying ? const AddListingScreen() : const MakeRequestScreen(),
                ));
              },
              icon: const Icon(Icons.add),
              label: const Text('Sell or request'),
            ),
          ),
        ),
      );
}

class _BrowseListings extends StatefulWidget {
  const _BrowseListings();

  @override
  State<_BrowseListings> createState() => _BrowseListingsState();
}

class _BrowseListingsState extends State<_BrowseListings> {
  String _query = '';
  String? _category;

  bool _matches(Doc l) {
    final q = _query.toLowerCase();
    final text = [l['title'], l['make'], l['model'], l['partNumber'], l['district']]
        .whereType<Object>()
        .join(' ')
        .toLowerCase();
    return (q.isEmpty || text.contains(q)) && (_category == null || l['category'] == _category);
  }

  @override
  Widget build(BuildContext context) => Column(children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
          child: TextField(
            decoration: const InputDecoration(
              prefixIcon: Icon(Icons.search),
              hintText: 'Search part, vehicle, part number…',
            ),
            onChanged: (v) => setState(() => _query = v),
          ),
        ),
        SizedBox(
          height: 48,
          child: ListView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            children: [
              for (final c in [null, ...spareCategories])
                Padding(
                  padding: const EdgeInsets.all(4),
                  child: ChoiceChip(
                    label: Text(c ?? 'All'),
                    selected: _category == c,
                    onSelected: (_) => setState(() => _category = c),
                  ),
                ),
            ],
          ),
        ),
        Expanded(
          child: AsyncView<List<Doc>>(
            load: getListings,
            builder: (context, all, _) {
              final items = all.where(_matches).toList();
              if (items.isEmpty) {
                return ListView(children: const [EmptyState(icon: '🔩', title: 'No parts found')]);
              }
              return ListView.separated(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 96),
                itemCount: items.length,
                separatorBuilder: (_, _) => const SizedBox(height: 10),
                itemBuilder: (context, i) => ListingCard(
                  listing: items[i],
                  onTap: () => Navigator.of(context).push(MaterialPageRoute(
                    builder: (_) => ListingDetailScreen(id: items[i]['id']),
                  )),
                ),
              );
            },
          ),
        ),
      ]);
}

class _BrowseRequests extends StatelessWidget {
  const _BrowseRequests();

  @override
  Widget build(BuildContext context) => AsyncView<List<Doc>>(
        load: getRequests,
        builder: (context, items, _) {
          if (items.isEmpty) {
            return ListView(children: const [EmptyState(icon: '📝', title: 'No requests yet')]);
          }
          return ListView.separated(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 96),
            itemCount: items.length,
            separatorBuilder: (_, _) => const SizedBox(height: 10),
            itemBuilder: (context, i) => RequestCard(request: items[i]),
          );
        },
      );
}

class RequestCard extends StatelessWidget {
  const RequestCard({super.key, required this.request, this.onDelete});
  final Doc request;
  final VoidCallback? onDelete;

  @override
  Widget build(BuildContext context) {
    final r = request;
    final phone = '${r['requesterPhone'] ?? ''}';
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('${r['sparePart'] ?? ''}', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
          const SizedBox(height: 4),
          Text(
            [r['brand'], r['model'], r['year'], r['condition'], '📍 ${r['district'] ?? 'Unknown'}']
                .where((v) => v != null && '$v'.isNotEmpty)
                .join(' · '),
            style: TextStyle(color: Theme.of(context).hintColor),
          ),
          if ('${r['budget'] ?? ''}'.isNotEmpty) Text('Budget: ${formatPrice(r['budget'])}'),
          if ('${r['description'] ?? ''}'.isNotEmpty)
            Padding(padding: const EdgeInsets.only(top: 6), child: Text('${r['description']}')),
          const SizedBox(height: 8),
          Row(children: [
            if (onDelete == null && phone.isNotEmpty)
              TextButton.icon(
                onPressed: () => openWhatsApp(phone, 'Hi, I saw your spareX request for ${r['sparePart']}. I have it.'),
                icon: const Icon(Icons.chat, size: 18),
                label: const Text('I have this'),
              ),
            if (onDelete != null)
              TextButton.icon(
                onPressed: onDelete,
                icon: const Icon(Icons.delete_outline, size: 18),
                label: const Text('Remove'),
              ),
          ]),
        ]),
      ),
    );
  }
}

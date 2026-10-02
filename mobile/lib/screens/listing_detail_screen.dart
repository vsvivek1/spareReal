import 'package:flutter/material.dart';

import '../services/data.dart';
import '../services/format.dart';
import '../theme.dart';
import '../widgets/common.dart';

class ListingDetailScreen extends StatelessWidget {
  const ListingDetailScreen({super.key, required this.id});
  final String id;

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('Spare part')),
        body: AsyncView<Doc?>(
          load: () => getListing(id),
          builder: (context, l, _) {
            if (l == null) {
              return ListView(children: const [EmptyState(icon: '🔎', title: 'Listing not found')]);
            }
            final photos = ((l['photos'] as List?) ?? [if (l['imageUrl'] != null) l['imageUrl']])
                .cast<String>();
            final phone = '${l['sellerPhone'] ?? ''}';
            final rows = <String, dynamic>{
              'Category': l['category'],
              'Make': l['make'],
              'Model': l['model'],
              'Year': l['year'],
              'Part number': l['partNumber'],
              'Condition': l['condition'],
              'Quantity': l['quantity'] == null
                  ? null
                  : '${l['quantity']}${l['unitType'] == 'Weight' ? ' kg' : ''}',
              'District': l['district'],
              'Status': l['status'],
            };

            return ListView(padding: const EdgeInsets.only(bottom: 32), children: [
              if (photos.isNotEmpty)
                SizedBox(
                  height: 260,
                  child: PageView(children: [
                    for (final p in photos) Image.network(p, fit: BoxFit.cover),
                  ]),
                ),
              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('${l['title']}', style: Theme.of(context).textTheme.headlineSmall),
                  const SizedBox(height: 6),
                  Text(
                    '${formatPrice(l['price'])}${l['unitType'] == 'Weight' ? ' per kg' : ''}',
                    style: const TextStyle(color: brandAlt, fontSize: 24, fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 16),
                  for (final e in rows.entries)
                    if (e.value != null && '${e.value}'.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 4),
                        child: Row(children: [
                          SizedBox(width: 120, child: Text(e.key, style: TextStyle(color: Theme.of(context).hintColor))),
                          Expanded(child: Text('${e.value}')),
                        ]),
                      ),
                  if ('${l['description'] ?? ''}'.isNotEmpty) ...[
                    const SizedBox(height: 16),
                    Text('${l['description']}'),
                  ],
                  const SizedBox(height: 24),
                  if (phone.isNotEmpty) ...[
                    FilledButton.icon(
                      onPressed: () => callNumber(phone),
                      icon: const Icon(Icons.call),
                      label: const Text('Call seller'),
                    ),
                    const SizedBox(height: 10),
                    OutlinedButton.icon(
                      onPressed: () => openWhatsApp(phone, 'Hi, is "${l['title']}" on spareX still available?'),
                      icon: const Icon(Icons.chat),
                      label: const Text('WhatsApp seller'),
                    ),
                  ],
                ]),
              ),
            ]);
          },
        ),
      );
}

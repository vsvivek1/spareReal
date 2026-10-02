import 'dart:io';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../constants.dart';
import '../services/auth.dart';
import '../services/data.dart';
import '../widgets/common.dart';

const _maxPhotos = 6;

/// Sell a spare part. Writes the same spareListings fields as /add-spare.
class AddListingScreen extends StatefulWidget {
  const AddListingScreen({super.key});

  @override
  State<AddListingScreen> createState() => _AddListingScreenState();
}

class _AddListingScreenState extends State<AddListingScreen> {
  final _title = TextEditingController();
  final _model = TextEditingController();
  final _year = TextEditingController();
  final _partNumber = TextEditingController();
  final _price = TextEditingController();
  final _quantity = TextEditingController(text: '1');
  final _description = TextEditingController();

  String _category = spareCategories.first;
  String? _make;
  String _condition = 'Used';
  String _unitType = 'Piece';
  final _photos = <File>[];
  bool _saving = false;

  Future<void> _addPhoto(ImageSource source) async {
    final picked = await ImagePicker().pickImage(source: source, maxWidth: 1200, imageQuality: 80);
    if (picked != null) setState(() => _photos.add(File(picked.path)));
  }

  Future<void> _save() async {
    final price = num.tryParse(_price.text.trim());
    final qty = num.tryParse(_quantity.text.trim());
    final year = _year.text.trim();

    if (_title.text.trim().isEmpty) return showMessage(context, 'Enter what part this is.');
    if (price == null || price <= 0) return showMessage(context, 'Enter a valid price.');
    if (qty == null || qty <= 0) return showMessage(context, 'Enter a valid quantity.');
    if (_photos.isEmpty) return showMessage(context, 'Add at least one photo.');
    if (year.isNotEmpty) {
      final y = int.tryParse(year);
      if (y == null || y < 1980 || y > DateTime.now().year + 1) {
        return showMessage(context, 'Enter a valid year.');
      }
    }

    setState(() => _saving = true);
    try {
      final profile = await AuthService.myProfile();
      await createListing(
        fields: {
          'title': _title.text.trim(),
          'category': _category,
          'make': _make,
          'model': _model.text.trim().isEmpty ? null : _model.text.trim(),
          'year': year.isEmpty ? null : year,
          'partNumber': _partNumber.text.trim().isEmpty ? null : _partNumber.text.trim().toUpperCase(),
          'vehicleId': null,
          'price': price,
          'unitType': _unitType,
          'quantity': _unitType == 'Weight' ? qty.toDouble() : qty.toInt(),
          'acquisitionCost': null,
          'description': _description.text.trim(),
          'condition': _condition,
        },
        photos: _photos,
        district: profile?['district'] as String?,
      );
      if (!mounted) return;
      showMessage(context, 'Your part is listed.');
      Navigator.of(context).pop(true);
    } catch (e) {
      if (mounted) showMessage(context, "Couldn't list this part. $e");
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    const gap = SizedBox(height: 12);
    return Scaffold(
      appBar: AppBar(title: const Text('Sell a spare part')),
      body: ListView(padding: const EdgeInsets.all(20), children: [
        Wrap(spacing: 8, runSpacing: 8, children: [
          for (var i = 0; i < _photos.length; i++)
            Stack(children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: Image.file(_photos[i], width: 88, height: 88, fit: BoxFit.cover),
              ),
              Positioned(
                right: 0,
                child: IconButton.filledTonal(
                  iconSize: 16,
                  onPressed: () => setState(() => _photos.removeAt(i)),
                  icon: const Icon(Icons.close),
                ),
              ),
            ]),
          if (_photos.length < _maxPhotos) ...[
            _PhotoButton(icon: Icons.photo_camera, label: 'Camera', onTap: () => _addPhoto(ImageSource.camera)),
            _PhotoButton(icon: Icons.photo_library, label: 'Gallery', onTap: () => _addPhoto(ImageSource.gallery)),
          ],
        ]),
        const SizedBox(height: 16),
        TextField(controller: _title, decoration: const InputDecoration(labelText: 'Part name')),
        gap,
        DropdownButtonFormField(
          initialValue: _category,
          decoration: const InputDecoration(labelText: 'Category'),
          items: [for (final c in spareCategories) DropdownMenuItem(value: c, child: Text(c))],
          onChanged: (v) => setState(() => _category = v!),
        ),
        gap,
        DropdownButtonFormField<String?>(
          initialValue: _make,
          decoration: const InputDecoration(labelText: 'Vehicle make (optional)'),
          items: [
            const DropdownMenuItem(value: null, child: Text('Any / not sure')),
            for (final m in vehicleMakes) DropdownMenuItem(value: m, child: Text(m)),
          ],
          onChanged: (v) => setState(() => _make = v),
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
        TextField(controller: _partNumber, decoration: const InputDecoration(labelText: 'Part number (optional)')),
        gap,
        SegmentedButton<String>(
          segments: const [
            ButtonSegment(value: 'Piece', label: Text('By piece')),
            ButtonSegment(value: 'Weight', label: Text('By weight (kg)')),
          ],
          selected: {_unitType},
          onSelectionChanged: (s) => setState(() => _unitType = s.first),
        ),
        gap,
        Row(children: [
          Expanded(
            child: TextField(
              controller: _price,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(labelText: _unitType == 'Weight' ? 'Price (₹ per kg)' : 'Price (₹)'),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: TextField(
              controller: _quantity,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              decoration: InputDecoration(labelText: _unitType == 'Weight' ? 'Weight (kg)' : 'Quantity'),
            ),
          ),
        ]),
        gap,
        DropdownButtonFormField(
          initialValue: _condition,
          decoration: const InputDecoration(labelText: 'Condition'),
          items: [for (final c in conditions) DropdownMenuItem(value: c, child: Text(c))],
          onChanged: (v) => setState(() => _condition = v!),
        ),
        gap,
        TextField(
          controller: _description,
          maxLines: 4,
          decoration: const InputDecoration(labelText: 'Description'),
        ),
        const SizedBox(height: 20),
        FilledButton(
          onPressed: _saving ? null : _save,
          child: _saving
              ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))
              : const Text('List this part'),
        ),
      ]),
    );
  }
}

class _PhotoButton extends StatelessWidget {
  const _PhotoButton({required this.icon, required this.label, required this.onTap});
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: Container(
          width: 88,
          height: 88,
          decoration: BoxDecoration(
            border: Border.all(color: Colors.white24),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
            Icon(icon),
            Text(label, style: const TextStyle(fontSize: 12)),
          ]),
        ),
      );
}

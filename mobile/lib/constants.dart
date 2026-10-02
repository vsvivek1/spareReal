// Mirrors src/lib/vehicleMakes.ts, src/lib/serviceTypes.ts and the option
// lists in the web forms, so data written from the app matches the web.

const vehicleMakes = [
  'Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra', 'Toyota', 'Honda', 'Kia',
  'Renault', 'Nissan', 'Ford', 'Volkswagen', 'Skoda', 'MG Motor', 'Jeep',
  'BMW', 'Mercedes-Benz', 'Audi', 'Volvo', 'Datsun', 'Fiat', 'Chevrolet',
  'Isuzu', 'Ashok Leyland', 'Eicher', 'Bajaj', 'TVS', 'Royal Enfield',
  'Hero MotoCorp', 'Yamaha', 'Other',
];

const spareCategories = [
  'Engine', 'Brake', 'Electrical', 'Tyre', 'Suspension', 'Body Parts',
  'Lighting', 'Battery', 'Oil & Fluids', 'Accessories', 'Scrap – Aluminum',
  'Scrap – Copper', 'Scrap – Steel', 'Scrap – Mixed Metal', 'Scrap – Other',
];

const conditions = ['New', 'Used', 'Refurbished', 'Damaged'];

class ServiceType {
  const ServiceType(this.slug, this.label, this.singular, this.icon, this.blurb);
  final String slug;
  final String label;
  final String singular;
  final String icon;
  final String blurb;
}

const serviceTypes = [
  ServiceType('workshop', 'Workshops', 'Workshop', '🔧', 'Repair & dismantling garages'),
  ServiceType('washing', 'Washing Centers', 'Washing Center', '🚿', 'Car & bike wash'),
  ServiceType('painting', 'Painting Centers', 'Painting Center', '🎨', 'Denting & painting'),
  ServiceType('petrol', 'Petrol Pumps', 'Petrol Pump', '⛽', 'Fuel stations'),
  ServiceType('tyre', 'Tyre Service', 'Tyre Service', '🛞', 'Tyres, puncture & alignment'),
  ServiceType('other', 'Other Services', 'Other', '🧰', 'Everything else'),
];

ServiceType serviceTypeFor(String slug) =>
    serviceTypes.firstWhere((t) => t.slug == slug, orElse: () => serviceTypes.first);

/// Petrol pumps are walk-in only; every other service takes bookings.
bool isBookableSlug(String slug) => slug != 'petrol';

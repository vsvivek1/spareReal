// Standard parts a dealer typically pulls from a donor vehicle, so a
// whole car can be listed by ticking boxes instead of filling the full
// form once per part. Categories match the ones on /add-spare.

export type DonorKind = "car" | "bike";

export type DonorPart = { name: string; category: string };

const CAR_PARTS: DonorPart[] = [
  { name: "Engine assembly", category: "Engine" },
  { name: "Gearbox / transmission", category: "Engine" },
  { name: "Cylinder head", category: "Engine" },
  { name: "Clutch kit", category: "Engine" },
  { name: "Turbocharger", category: "Engine" },
  { name: "Radiator", category: "Engine" },
  { name: "Radiator fan", category: "Engine" },
  { name: "AC compressor", category: "Engine" },
  { name: "AC condenser", category: "Engine" },
  { name: "Fuel pump", category: "Engine" },
  { name: "Fuel injectors", category: "Engine" },
  { name: "Exhaust silencer", category: "Engine" },
  { name: "Starter motor", category: "Electrical" },
  { name: "Alternator", category: "Electrical" },
  { name: "ECU (engine control unit)", category: "Electrical" },
  { name: "Wiring harness", category: "Electrical" },
  { name: "Instrument cluster", category: "Electrical" },
  { name: "Music system / head unit", category: "Electrical" },
  { name: "Power window motor", category: "Electrical" },
  { name: "Wiper motor", category: "Electrical" },
  { name: "AC blower motor", category: "Electrical" },
  { name: "Steering column switch", category: "Electrical" },
  { name: "Horn", category: "Electrical" },
  { name: "Bonnet", category: "Body Parts" },
  { name: "Front bumper", category: "Body Parts" },
  { name: "Rear bumper", category: "Body Parts" },
  { name: "Grille", category: "Body Parts" },
  { name: "Front door, left", category: "Body Parts" },
  { name: "Front door, right", category: "Body Parts" },
  { name: "Rear door, left", category: "Body Parts" },
  { name: "Rear door, right", category: "Body Parts" },
  { name: "Boot / tailgate", category: "Body Parts" },
  { name: "Front fender, left", category: "Body Parts" },
  { name: "Front fender, right", category: "Body Parts" },
  { name: "Side mirror, left", category: "Body Parts" },
  { name: "Side mirror, right", category: "Body Parts" },
  { name: "Windshield glass", category: "Body Parts" },
  { name: "Rear windshield glass", category: "Body Parts" },
  { name: "Seats (set)", category: "Body Parts" },
  { name: "Dashboard", category: "Body Parts" },
  { name: "Steering wheel", category: "Body Parts" },
  { name: "Headlight, left", category: "Lighting" },
  { name: "Headlight, right", category: "Lighting" },
  { name: "Tail light, left", category: "Lighting" },
  { name: "Tail light, right", category: "Lighting" },
  { name: "Fog lamps (pair)", category: "Lighting" },
  { name: "Front shock absorbers (pair)", category: "Suspension" },
  { name: "Rear shock absorbers (pair)", category: "Suspension" },
  { name: "Steering rack", category: "Suspension" },
  { name: "Lower control arms (pair)", category: "Suspension" },
  { name: "Drive shafts / axles", category: "Suspension" },
  { name: "Brake calipers", category: "Brake" },
  { name: "Brake discs", category: "Brake" },
  { name: "ABS unit", category: "Brake" },
  { name: "Brake master cylinder", category: "Brake" },
  { name: "Wheels / rims (set)", category: "Tyre" },
  { name: "Tyres (set)", category: "Tyre" },
  { name: "Spare wheel", category: "Tyre" },
  { name: "Battery", category: "Battery" },
];

const BIKE_PARTS: DonorPart[] = [
  { name: "Engine assembly", category: "Engine" },
  { name: "Carburettor / throttle body", category: "Engine" },
  { name: "Clutch plates", category: "Engine" },
  { name: "Silencer / exhaust", category: "Engine" },
  { name: "Chain and sprocket kit", category: "Engine" },
  { name: "Starter motor", category: "Electrical" },
  { name: "CDI / ECU", category: "Electrical" },
  { name: "Wiring harness", category: "Electrical" },
  { name: "Speedometer / instrument cluster", category: "Electrical" },
  { name: "Handlebar switches", category: "Electrical" },
  { name: "Horn", category: "Electrical" },
  { name: "Fuel tank", category: "Body Parts" },
  { name: "Seat", category: "Body Parts" },
  { name: "Front mudguard", category: "Body Parts" },
  { name: "Rear mudguard", category: "Body Parts" },
  { name: "Side panels", category: "Body Parts" },
  { name: "Visor / headlight cowl", category: "Body Parts" },
  { name: "Mirrors (pair)", category: "Body Parts" },
  { name: "Handlebar", category: "Body Parts" },
  { name: "Crash guard", category: "Body Parts" },
  { name: "Headlight", category: "Lighting" },
  { name: "Tail light", category: "Lighting" },
  { name: "Indicators (set)", category: "Lighting" },
  { name: "Front forks (pair)", category: "Suspension" },
  { name: "Rear shock absorbers", category: "Suspension" },
  { name: "Swing arm", category: "Suspension" },
  { name: "Front brake (disc / drum)", category: "Brake" },
  { name: "Rear brake (disc / drum)", category: "Brake" },
  { name: "Front wheel", category: "Tyre" },
  { name: "Rear wheel", category: "Tyre" },
  { name: "Battery", category: "Battery" },
];

// Makes that only build two-wheelers. Honda and others make both, so
// the seller can switch the list on the page.
const BIKE_ONLY_MAKES = [
  "Bajaj",
  "TVS",
  "Royal Enfield",
  "Hero MotoCorp",
  "Yamaha",
];

export const guessDonorKind = (make?: string): DonorKind =>
  make && BIKE_ONLY_MAKES.includes(make) ? "bike" : "car";

export const donorPartsFor = (kind: DonorKind) =>
  kind === "bike" ? BIKE_PARTS : CAR_PARTS;

export const PART_CATEGORIES = [
  "Engine",
  "Electrical",
  "Body Parts",
  "Lighting",
  "Suspension",
  "Brake",
  "Tyre",
  "Battery",
  "Oil & Fluids",
  "Accessories",
];

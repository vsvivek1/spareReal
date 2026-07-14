export const VEHICLE_MAKES = [
  "Maruti Suzuki",
  "Hyundai",
  "Tata",
  "Mahindra",
  "Toyota",
  "Honda",
  "Kia",
  "Renault",
  "Nissan",
  "Ford",
  "Volkswagen",
  "Skoda",
  "MG Motor",
  "Jeep",
  "BMW",
  "Mercedes-Benz",
  "Audi",
  "Volvo",
  "Datsun",
  "Fiat",
  "Chevrolet",
  "Isuzu",
  "Ashok Leyland",
  "Eicher",
  "Bajaj",
  "TVS",
  "Royal Enfield",
  "Hero MotoCorp",
  "Yamaha",
  "Other",
];

// Older listings only have a free-text `vehicle` string (e.g. "Toyota Innova")
// instead of split make/model/year — fall back to it so those still render.
export const formatVehicleLabel = (item: {
  make?: string;
  model?: string;
  year?: string | number;
  vehicle?: string;
}) => {
  const makeModel = [item.make, item.model].filter(Boolean).join(" ");

  if (!makeModel) return item.vehicle || "";

  return item.year ? `${makeModel} (${item.year})` : makeModel;
};

// Slot booking for services (workshops, washing/painting centers, tyre
// service, custom "other" services). Shared by the booking API route and
// the client so both generate exactly the same slot list.

export const DEFAULT_OPEN_TIME = "09:00";
export const DEFAULT_CLOSE_TIME = "18:00";
export const DEFAULT_SLOT_MINUTES = 60;
export const SLOT_MINUTE_OPTIONS = [30, 60, 120];

// How far ahead people can book.
export const BOOKING_WINDOW_DAYS = 14;

// Petrol pumps are walk-in only; every other service type takes bookings.
export const isBookableSlug = (slug: string) => slug !== "petrol";

type Bookable = {
  openTime?: string | null;
  closeTime?: string | null;
  slotMinutes?: number | null;
  vehicleCapacity?: number | null;
};

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const toHHMM = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(
    minutes % 60
  ).padStart(2, "0")}`;

export const isValidTime = (value: unknown): value is string =>
  typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

export const isValidDate = (value: unknown): value is string =>
  typeof value === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(`${value}T00:00:00Z`));

// Bookings per slot. A workshop's vehicleCapacity doubles as its bay count;
// other services serve one customer per slot unless they said otherwise.
export const slotCapacity = (service: Bookable) =>
  service.vehicleCapacity && service.vehicleCapacity > 0
    ? service.vehicleCapacity
    : 1;

export const generateSlots = (service: Bookable): string[] => {
  const open = toMinutes(
    isValidTime(service.openTime) ? service.openTime : DEFAULT_OPEN_TIME
  );
  const close = toMinutes(
    isValidTime(service.closeTime) ? service.closeTime : DEFAULT_CLOSE_TIME
  );
  const step =
    service.slotMinutes && service.slotMinutes >= 15
      ? service.slotMinutes
      : DEFAULT_SLOT_MINUTES;

  const slots: string[] = [];
  for (let t = open; t + step <= close; t += step) slots.push(toHHMM(t));
  return slots;
};

// Dates are handled as India-local calendar days (IST, UTC+5:30), which is
// where every user is, regardless of where the server runs.
const IST_OFFSET_MS = 330 * 60 * 1000;

export const todayIST = () =>
  new Date(Date.now() + IST_OFFSET_MS).toISOString().slice(0, 10);

export const nowMinutesIST = () => {
  const d = new Date(Date.now() + IST_OFFSET_MS);
  return d.getUTCHours() * 60 + d.getUTCMinutes();
};

export const bookableDates = (days = BOOKING_WINDOW_DAYS) => {
  const start = Date.parse(`${todayIST()}T00:00:00Z`);
  return Array.from({ length: days }, (_, i) =>
    new Date(start + i * 86400000).toISOString().slice(0, 10)
  );
};

// A slot is in the past if it's today and its start time has gone by.
export const isPastSlot = (date: string, time: string) =>
  date < todayIST() ||
  (date === todayIST() && toMinutes(time) <= nowMinutesIST());

export const formatDateLabel = (date: string) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });

export const formatTimeLabel = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${suffix}`;
};

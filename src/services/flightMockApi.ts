// Mock flight API simulating backend latency.

export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  origin: string;
  originCode: string;
  destination: string;
  destinationCode: string;
  departTime: string; // ISO
  arriveTime: string; // ISO
  durationMinutes: number;
  stops: number;
  price: number;
  averagePrice: number;
  isDeal: boolean;
  dealLabel?: string;
  cabin: "Economy" | "Premium" | "Business";
}

export interface PriceAlert {
  flightId: string;
  message: string;
  delta: number;
}

export interface SecondaryUpsell {
  id: string;
  city: string;
  cityCode: string;
  country: string;
  imageUrl: string;
  price: number;
  averagePrice: number;
  durationMinutes: number;
  tagline: string;
}

import paris from "@/assets/city-paris.jpg";
import tokyo from "@/assets/city-tokyo.jpg";
import nyc from "@/assets/city-nyc.jpg";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const AIRLINES = ["Aero", "Vega", "Nova Air", "Polaris", "Helio"];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function makeFlight(
  i: number,
  origin: string,
  destination: string,
  date: string,
  forceDeal = false
): Flight {
  const base = 280 + Math.floor(Math.random() * 600);
  const avg = base + 80 + Math.floor(Math.random() * 200);
  const isDeal = forceDeal || Math.random() < 0.3;
  const price = isDeal ? Math.floor(avg * (0.55 + Math.random() * 0.2)) : base;
  const departHour = 6 + Math.floor(Math.random() * 16);
  const dep = new Date(`${date}T${String(departHour).padStart(2, "0")}:00:00`);
  const dur = 120 + Math.floor(Math.random() * 600);
  const arr = new Date(dep.getTime() + dur * 60000);
  const pct = Math.round((1 - price / avg) * 100);
  return {
    id: `FL-${date}-${i}-${Math.random().toString(36).slice(2, 7)}`,
    airline: rand(AIRLINES),
    flightNumber: `${rand(["AE", "VG", "NV", "PL", "HE"])}${100 + i}`,
    origin,
    originCode: origin.slice(0, 3).toUpperCase(),
    destination,
    destinationCode: destination.slice(0, 3).toUpperCase(),
    departTime: dep.toISOString(),
    arriveTime: arr.toISOString(),
    durationMinutes: dur,
    stops: Math.random() < 0.6 ? 0 : 1,
    price,
    averagePrice: avg,
    isDeal,
    dealLabel: isDeal ? `${pct}% Below Average` : undefined,
    cabin: "Economy",
  };
}

export async function fetchFlights(params: {
  origin: string;
  destination: string;
  date: string;
  passengers: number;
}): Promise<Flight[]> {
  await delay(900);
  const list: Flight[] = [];
  for (let i = 0; i < 7; i++) {
    list.push(makeFlight(i, params.origin, params.destination, params.date, i === 1));
  }
  return list.sort((a, b) => a.price - b.price);
}

const PAIRINGS: Record<string, SecondaryUpsell[]> = {
  paris: [
    {
      id: "sec-rome",
      city: "Rome",
      cityCode: "FCO",
      country: "Italy",
      imageUrl: paris,
      price: 64,
      averagePrice: 140,
      durationMinutes: 130,
      tagline: "Two capitals. One trip.",
    },
    {
      id: "sec-barcelona",
      city: "Barcelona",
      cityCode: "BCN",
      country: "Spain",
      imageUrl: paris,
      price: 79,
      averagePrice: 160,
      durationMinutes: 110,
      tagline: "Mediterranean detour.",
    },
  ],
  tokyo: [
    {
      id: "sec-kyoto",
      city: "Kyoto",
      cityCode: "UKY",
      country: "Japan",
      imageUrl: tokyo,
      price: 48,
      averagePrice: 120,
      durationMinutes: 80,
      tagline: "Ancient capital, 80 minutes away.",
    },
    {
      id: "sec-osaka",
      city: "Osaka",
      cityCode: "KIX",
      country: "Japan",
      imageUrl: tokyo,
      price: 55,
      averagePrice: 130,
      durationMinutes: 90,
      tagline: "Street food paradise.",
    },
  ],
  "new york": [
    {
      id: "sec-boston",
      city: "Boston",
      cityCode: "BOS",
      country: "USA",
      imageUrl: nyc,
      price: 89,
      averagePrice: 180,
      durationMinutes: 90,
      tagline: "Add a New England weekend.",
    },
    {
      id: "sec-mtl",
      city: "Montreal",
      cityCode: "YUL",
      country: "Canada",
      imageUrl: nyc,
      price: 119,
      averagePrice: 240,
      durationMinutes: 100,
      tagline: "A taste of Europe in North America.",
    },
  ],
};

const RANDOM_CITIES: SecondaryUpsell[] = [
  { id: "sec-lis", city: "Lisbon", cityCode: "LIS", country: "Portugal", imageUrl: paris, price: 72, averagePrice: 150, durationMinutes: 150, tagline: "Pastel sunsets on the Atlantic." },
  { id: "sec-ist", city: "Istanbul", cityCode: "IST", country: "Türkiye", imageUrl: tokyo, price: 99, averagePrice: 210, durationMinutes: 180, tagline: "Where continents meet." },
  { id: "sec-mex", city: "Mexico City", cityCode: "MEX", country: "Mexico", imageUrl: nyc, price: 128, averagePrice: 260, durationMinutes: 240, tagline: "Markets, murals, mezcal." },
  { id: "sec-sin", city: "Singapore", cityCode: "SIN", country: "Singapore", imageUrl: tokyo, price: 145, averagePrice: 320, durationMinutes: 360, tagline: "A city built like the future." },
];

export async function fetchSecondaryConnections(destination: string): Promise<SecondaryUpsell[]> {
  await delay(700);
  const key = destination.trim().toLowerCase();
  if (PAIRINGS[key]) return PAIRINGS[key];
  // shuffle, pick two
  const shuffled = [...RANDOM_CITIES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 2);
}

export async function fetchPriceAlerts(flightId: string): Promise<PriceAlert | null> {
  await delay(400);
  return {
    flightId,
    message: "Tracked for 30 days",
    delta: -42,
  };
}

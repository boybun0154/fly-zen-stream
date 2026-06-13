import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import {
  fetchFlights,
  fetchSecondaryConnections,
  type Flight,
  type SecondaryUpsell,
} from "@/services/flightMockApi";
import { itinerary } from "@/lib/itinerary";

const searchSchema = z.object({
  origin: z.string().default("New York"),
  destination: z.string().default("Paris"),
  date: z.string().default(new Date().toISOString().slice(0, 10)),
  passengers: z.coerce.number().int().min(1).max(9).default(1),
});

export const Route = createFileRoute("/results")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Flight Results — Aero" },
      { name: "description", content: "Browse curated flight options with premium deals highlighted." },
    ],
  }),
  component: Results,
});

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function formatDuration(m: number) {
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

function Results() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [flights, setFlights] = useState<Flight[] | null>(null);
  const [selected, setSelected] = useState<Flight | null>(null);
  const [upsells, setUpsells] = useState<SecondaryUpsell[] | null>(null);
  const [pickedUpsell, setPickedUpsell] = useState<SecondaryUpsell | null>(null);

  useEffect(() => {
    setFlights(null);
    fetchFlights(search).then(setFlights);
  }, [search.origin, search.destination, search.date, search.passengers]);

  const handleSelect = async (f: Flight) => {
    setSelected(f);
    setUpsells(null);
    setPickedUpsell(null);
    const list = await fetchSecondaryConnections(search.destination);
    setUpsells(list);
  };

  const handleContinue = () => {
    if (!selected) return;
    itinerary.setPrimary(selected, search.passengers);
    itinerary.setSecondary(pickedUpsell);
    navigate({ to: "/checkout" });
  };

  return (
    <main className="min-h-screen bg-background pt-24 pb-24">
      <section className="mx-auto max-w-6xl px-6 md:px-12">
        <div className="animate-fade-up flex flex-col gap-2">
          <Link to="/" className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground">← New search</Link>
          <h1 className="text-4xl font-light tracking-tight text-foreground md:text-5xl">
            {search.origin} <span className="text-muted-foreground">→</span> {search.destination}
          </h1>
          <p className="text-sm text-muted-foreground">
            {new Date(search.date).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })} · {search.passengers} guest{search.passengers > 1 ? "s" : ""}
          </p>
        </div>

        <div className="mt-12 flex flex-col gap-3">
          {flights === null && <SkeletonList />}
          {flights?.map((f, i) => (
            <FlightRow
              key={f.id}
              flight={f}
              index={i}
              isSelected={selected?.id === f.id}
              onSelect={() => handleSelect(f)}
            />
          ))}
        </div>
      </section>

      {selected && (
        <SecondaryPanel
          primary={selected}
          upsells={upsells}
          picked={pickedUpsell}
          onPick={setPickedUpsell}
          onClose={() => setSelected(null)}
          onContinue={handleContinue}
        />
      )}
    </main>
  );
}

function FlightRow({ flight, index, isSelected, onSelect }: { flight: Flight; index: number; isSelected: boolean; onSelect: () => void }) {
  return (
    <div
      className={`group animate-fade-up grid grid-cols-12 items-center gap-4 rounded-xl border bg-card p-6 transition-all duration-500 ${
        flight.isDeal ? "deal-glow border-transparent" : "border-border hover:border-foreground/30"
      } ${isSelected ? "ring-2 ring-foreground" : ""}`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="col-span-12 flex items-center gap-3 md:col-span-2">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{flight.airline}</div>
        <div className="text-[10px] text-muted-foreground">{flight.flightNumber}</div>
      </div>

      <div className="col-span-12 flex items-center gap-6 md:col-span-6">
        <div>
          <div className="text-2xl font-light text-foreground">{formatTime(flight.departTime)}</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{flight.originCode}</div>
        </div>
        <div className="flex flex-1 flex-col items-center">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{formatDuration(flight.durationMinutes)}</div>
          <div className="relative my-2 h-px w-full bg-border">
            <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-foreground" />
          </div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{flight.stops === 0 ? "Nonstop" : `${flight.stops} stop`}</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-light text-foreground">{formatTime(flight.arriveTime)}</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{flight.destinationCode}</div>
        </div>
      </div>

      <div className="col-span-12 flex items-center justify-between gap-4 md:col-span-4 md:justify-end">
        <div className="flex flex-col items-end">
          {flight.isDeal && (
            <span className="mb-1 rounded-full bg-deal/15 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-deal">
              {flight.dealLabel}
            </span>
          )}
          <div className="flex items-baseline gap-2">
            {flight.isDeal && (
              <span className="text-xs text-muted-foreground line-through">${flight.averagePrice}</span>
            )}
            <span className="text-3xl font-light text-foreground">${flight.price}</span>
          </div>
        </div>
        <button
          onClick={onSelect}
          className="rounded-full bg-foreground px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-background transition hover:opacity-90"
        >
          Select
        </button>
      </div>
    </div>
  );
}

function SkeletonList() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-28 animate-pulse rounded-xl border border-border bg-card" />
      ))}
    </>
  );
}

function SecondaryPanel({
  primary,
  upsells,
  picked,
  onPick,
  onClose,
  onContinue,
}: {
  primary: Flight;
  upsells: SecondaryUpsell[] | null;
  picked: SecondaryUpsell | null;
  onPick: (u: SecondaryUpsell | null) => void;
  onClose: () => void;
  onContinue: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-background/40 backdrop-blur-sm" onClick={onClose} />
      <aside className="animate-slide-in-right fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-card">
        <div className="flex items-center justify-between p-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Configure itinerary</p>
            <h2 className="mt-1 text-xl font-medium text-foreground">Add a second city?</h2>
          </div>
          <button onClick={onClose} className="text-2xl text-muted-foreground hover:text-foreground">×</button>
        </div>

        <div className="border-y border-border bg-background/40 px-6 py-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Primary flight</p>
          <p className="mt-1 text-sm text-foreground">
            {primary.originCode} → {primary.destinationCode} · {formatTime(primary.departTime)} · <span className="font-medium">${primary.price}</span>
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <p className="text-xs text-muted-foreground">
            Travelers who fly to <span className="text-foreground">{primary.destination}</span> often add a nearby city for less.
          </p>

          <div className="mt-6 flex flex-col gap-4">
            {upsells === null && (
              <>
                <div className="h-44 animate-pulse rounded-xl bg-muted" />
                <div className="h-44 animate-pulse rounded-xl bg-muted" />
              </>
            )}
            {upsells?.map((u) => {
              const isPicked = picked?.id === u.id;
              return (
                <button
                  key={u.id}
                  onClick={() => onPick(isPicked ? null : u)}
                  className={`group relative overflow-hidden rounded-xl border text-left transition ${
                    isPicked ? "border-foreground ring-2 ring-foreground" : "border-border hover:border-foreground/40"
                  }`}
                >
                  <div className="relative h-32 w-full overflow-hidden">
                    <img src={u.imageUrl} alt={u.city} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                  </div>
                  <div className="flex items-end justify-between p-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{u.country}</p>
                      <p className="text-lg font-medium text-foreground">{u.city}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{u.tagline}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">From</p>
                      <p className="text-xl font-light text-foreground">+${u.price}</p>
                    </div>
                  </div>
                  {isPicked && (
                    <div className="absolute right-3 top-3 rounded-full bg-foreground px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-background">
                      Added
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-border p-6">
          <div className="mb-4 flex items-baseline justify-between">
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Subtotal</span>
            <span className="text-2xl font-light text-foreground">${primary.price + (picked?.price ?? 0)}</span>
          </div>
          <button onClick={onContinue} className="w-full rounded-full bg-foreground py-4 text-xs font-semibold uppercase tracking-[0.25em] text-background transition hover:opacity-90">
            Continue to checkout
          </button>
        </div>
      </aside>
    </>
  );
}

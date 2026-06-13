import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import heroImg from "@/assets/hero-plane.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aero — Fly Beyond" },
      { name: "description", content: "A cinematic flight booking experience. Search, discover deals, and curate multi-city journeys." },
      { property: "og:title", content: "Aero — Fly Beyond" },
      { property: "og:description", content: "A cinematic flight booking experience." },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const [origin, setOrigin] = useState("New York");
  const [destination, setDestination] = useState("Paris");
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [passengers, setPassengers] = useState(1);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({
      to: "/results",
      search: { origin, destination, date, passengers },
    });
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      {/* Cinematic background */}
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="Airliner wing above sunset clouds"
          width={1920}
          height={1280}
          className="h-full w-full object-cover animate-hero-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/10 to-background" />
      </div>

      {/* Hero copy */}
      <section className="relative z-10 flex min-h-screen flex-col items-center justify-between px-6 pt-32 pb-10 md:px-12">
        <div className="mx-auto max-w-4xl text-center animate-fade-up">
          <p className="text-xs uppercase tracking-[0.4em] text-foreground/80">A new way to fly</p>
          <h1 className="mt-6 text-5xl font-light leading-[0.95] tracking-tight text-foreground md:text-7xl lg:text-8xl">
            Beyond the<br />destination.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-sm text-foreground/70 md:text-base">
            Discover premium flight deals and craft multi-city journeys with cinematic precision.
          </p>
        </div>

        {/* Bottom-anchored translucent search panel */}
        <form
          onSubmit={onSearch}
          className="glass-panel mt-12 w-full max-w-5xl rounded-2xl p-2 animate-fade-up md:p-3"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl md:grid-cols-[1fr_1fr_1fr_auto_auto]">
            <Field label="From">
              <input value={origin} onChange={(e) => setOrigin(e.target.value)} className="w-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground" />
            </Field>
            <Field label="To">
              <input value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full bg-transparent text-sm font-medium text-foreground outline-none" />
            </Field>
            <Field label="Departure">
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-transparent text-sm font-medium text-foreground outline-none [color-scheme:dark]" />
            </Field>
            <Field label="Guests">
              <select value={passengers} onChange={(e) => setPassengers(+e.target.value)} className="w-full bg-transparent text-sm font-medium text-foreground outline-none">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n} className="bg-background">{n}</option>
                ))}
              </select>
            </Field>
            <button type="submit" className="m-1 rounded-lg bg-foreground px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-background transition hover:opacity-90">
              Search
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 bg-background/60 px-5 py-4 transition hover:bg-background/80">
      <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

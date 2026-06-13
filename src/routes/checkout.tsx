import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useItinerary, itinerary } from "@/lib/itinerary";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Aero" },
      { name: "description", content: "Finalize your Aero itinerary." },
    ],
  }),
  component: Checkout,
});

function formatTime(iso: string) {
  return new Date(iso).toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function Checkout() {
  const { primary, secondary, passengers } = useItinerary();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  if (!primary) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 pt-24">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Empty itinerary</p>
          <h1 className="mt-3 text-3xl font-light text-foreground">No flights selected</h1>
          <Link to="/" className="mt-6 inline-block rounded-full bg-foreground px-6 py-3 text-xs uppercase tracking-[0.25em] text-background hover:opacity-90">
            Start a new search
          </Link>
        </div>
      </main>
    );
  }

  const primaryTotal = primary.price * passengers;
  const secondaryTotal = (secondary?.price ?? 0) * passengers;
  const subtotal = primaryTotal + secondaryTotal;
  const taxes = Math.round(subtotal * 0.12);
  const total = subtotal + taxes;
  const savings =
    Math.max(0, (primary.averagePrice - primary.price) * passengers) +
    (secondary ? Math.max(0, (secondary.averagePrice - secondary.price) * passengers) : 0);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 pt-24">
        <div className="animate-fade-up max-w-xl text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Confirmed</p>
          <h1 className="mt-4 text-5xl font-light text-foreground">You're flying.</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Itinerary confirmed for {primary.originCode} → {primary.destinationCode}
            {secondary ? ` → ${secondary.cityCode}` : ""}. A digital boarding pass is on its way.
          </p>
          <button
            onClick={() => { itinerary.clear(); navigate({ to: "/" }); }}
            className="mt-8 rounded-full bg-foreground px-8 py-4 text-xs uppercase tracking-[0.25em] text-background hover:opacity-90"
          >
            Plan another journey
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pt-24 pb-24">
      <section className="mx-auto max-w-6xl px-6 md:px-12">
        <div className="animate-fade-up">
          <Link to="/results" search={{ origin: primary.origin, destination: primary.destination, date: primary.departTime.slice(0, 10), passengers }} className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground">
            ← Back to results
          </Link>
          <h1 className="mt-2 text-4xl font-light tracking-tight text-foreground md:text-5xl">Checkout</h1>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[1.6fr_1fr]">
          <form onSubmit={handlePay} className="animate-fade-up space-y-12" style={{ animationDelay: "0.1s" }}>
            <FormSection title="Passenger" step="01">
              <Input label="Full name" placeholder="As shown on passport" required />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Date of birth" type="date" required />
                <Input label="Nationality" placeholder="Country" required />
              </div>
              <Input label="Email" type="email" placeholder="you@example.com" required />
              <Input label="Phone" type="tel" placeholder="+1 555 000 0000" required />
            </FormSection>

            <FormSection title="Payment" step="02">
              <Input label="Card number" placeholder="1234 5678 9012 3456" required />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Expiry" placeholder="MM / YY" required />
                <Input label="CVC" placeholder="123" required />
              </div>
              <Input label="Cardholder name" placeholder="Name on card" required />
            </FormSection>

            <button type="submit" className="w-full rounded-full bg-foreground py-5 text-xs font-semibold uppercase tracking-[0.3em] text-background transition hover:opacity-90">
              Confirm & pay ${total.toLocaleString()}
            </button>
          </form>

          {/* Sticky order summary */}
          <aside className="animate-fade-up lg:sticky lg:top-28 lg:self-start" style={{ animationDelay: "0.2s" }}>
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Order summary</p>
              <h2 className="mt-1 text-2xl font-light text-foreground">Your itinerary</h2>

              <div className="mt-6 border-t border-border pt-4">
                <SummaryRow
                  city={`${primary.originCode} → ${primary.destinationCode}`}
                  detail={`${formatTime(primary.departTime)} · ${primary.airline}`}
                  unitPrice={primary.price}
                  averagePrice={primary.averagePrice}
                  qty={passengers}
                />
                {secondary && (
                  <SummaryRow
                    city={`${primary.destinationCode} → ${secondary.cityCode}`}
                    detail={`Connection · ${secondary.city}, ${secondary.country}`}
                    unitPrice={secondary.price}
                    averagePrice={secondary.averagePrice}
                    qty={passengers}
                  />
                )}
              </div>

              <div className="mt-6 space-y-2 border-t border-border pt-4 text-sm">
                <Line label="Subtotal" value={`$${subtotal.toLocaleString()}`} />
                <Line label="Taxes & fees" value={`$${taxes.toLocaleString()}`} />
                {savings > 0 && (
                  <Line label="Deal savings" value={`−$${savings.toLocaleString()}`} accent />
                )}
              </div>

              <div className="mt-6 flex items-baseline justify-between border-t border-border pt-6">
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Total</span>
                <span className="text-3xl font-light text-foreground">${total.toLocaleString()}</span>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function FormSection({ title, step, children }: { title: string; step: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-6 flex items-baseline gap-4 border-b border-border pb-3">
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{step}</span>
        <h2 className="text-xl font-medium text-foreground">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</span>
      <input
        {...props}
        className="mt-2 w-full border-0 border-b border-border bg-transparent py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-foreground"
      />
    </label>
  );
}

function SummaryRow({ city, detail, unitPrice, averagePrice, qty }: { city: string; detail: string; unitPrice: number; averagePrice: number; qty: number }) {
  const isDeal = unitPrice < averagePrice;
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-foreground">{city}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>
        <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{qty} × ${unitPrice}</p>
      </div>
      <div className="text-right">
        <p className="text-base font-light text-foreground">${(unitPrice * qty).toLocaleString()}</p>
        {isDeal && <p className="text-[10px] uppercase tracking-[0.2em] text-deal">Deal</p>}
      </div>
    </div>
  );
}

function Line({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={accent ? "text-deal" : "text-foreground"}>{value}</span>
    </div>
  );
}

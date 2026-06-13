import { useSyncExternalStore } from "react";
import type { Flight, SecondaryUpsell } from "@/services/flightMockApi";

interface ItineraryState {
  primary: Flight | null;
  secondary: SecondaryUpsell | null;
  passengers: number;
}

let state: ItineraryState = { primary: null, secondary: null, passengers: 1 };
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export const itinerary = {
  get(): ItineraryState {
    return state;
  },
  setPrimary(f: Flight | null, passengers = state.passengers) {
    state = { ...state, primary: f, passengers };
    emit();
  },
  setSecondary(s: SecondaryUpsell | null) {
    state = { ...state, secondary: s };
    emit();
  },
  clear() {
    state = { primary: null, secondary: null, passengers: 1 };
    emit();
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useItinerary() {
  return useSyncExternalStore(
    (cb) => itinerary.subscribe(cb),
    () => itinerary.get(),
    () => itinerary.get()
  );
}

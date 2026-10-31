// Le choix des services d'un trajet libre : Valhalla et Photon par défaut, sans clé ; Google (Routes, Geocoding) les remplace
// tous deux dès qu'une clé Routes est fournie (VITE_GOOGLE_ROUTES_API_KEY de .env.local, SEC-007). Les adresses des instances
// ouvertes se règlent par VITE_ROUTING_URL et VITE_GEOCODING_URL (non secrètes), pour viser une instance auto-hébergée.
import { createGoogleGeocoder } from "./geocoding.ts";
import { createPhotonGeocoder } from "./photon.ts";
import type { Providers } from "./providers.ts";
import { createGoogleRouter, readRoutesKey } from "./routes-api.ts";
import { createValhallaRouter } from "./valhalla.ts";

export const VALHALLA_URL = "https://valhalla1.openstreetmap.de";
export const PHOTON_URL = "https://photon.komoot.io";

/** Une adresse de service de l'environnement, sans barre finale ; absente ou vide : celle par défaut. */
function readUrl(env: Record<string, unknown> | undefined, name: string, fallback: string): string {
  const value = env?.[name];
  return (typeof value === "string" && value.trim() !== "" ? value.trim() : fallback).replace(/\/+$/, "");
}

export function createProviders(env: Record<string, unknown> | undefined, fetchFn: typeof fetch): Providers {
  const googleKey = readRoutesKey(env);
  if (googleKey !== undefined) {
    const google = { apiKey: googleKey, fetch: fetchFn };
    return { router: createGoogleRouter(google), geocoder: createGoogleGeocoder(google), fetch: fetchFn };
  }
  return {
    router: createValhallaRouter(readUrl(env, "VITE_ROUTING_URL", VALHALLA_URL), fetchFn),
    geocoder: createPhotonGeocoder(readUrl(env, "VITE_GEOCODING_URL", PHOTON_URL), fetchFn),
    fetch: fetchFn,
  };
}

// Shared record store: local cache for responsive UI + Supabase persistence.
// Records retain the frontend's existing shape in JSONB so current pages/forms
// do not need to be rewritten during this integration step.
import { useEffect, useSyncExternalStore } from "react";
import { buildSeed, defaultSettings } from "./seed";
import { supabase } from "./supabase";
import type { Rec, Settings } from "./types";

const PREFIX = "suraksha_";
const cache = new Map<string, unknown>();
const listeners = new Set<() => void>();
const EMPTY: Rec[] = [];
const COLLECTIONS = ["employees", "equipment", "hazards", "incidents", "handovers", "logs", "settings"] as const;
let hydrationStarted = false;
let hydrationPromise: Promise<void> | null = null;

function notify() { listeners.forEach((listener) => listener()); }

function ensureSeeded() {
  if (typeof window === "undefined" || localStorage.getItem(PREFIX + "init")) return;
  const seed = buildSeed();
  Object.entries(seed).forEach(([key, value]) => localStorage.setItem(PREFIX + key, JSON.stringify(value)));
  localStorage.setItem(PREFIX + "init", "1");
}

function read<T>(key: string, fallback: T): T {
  if (!cache.has(key)) {
    ensureSeeded();
    let value: unknown = fallback;
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(PREFIX + key);
      try { if (raw) value = JSON.parse(raw); } catch { /* use fallback for corrupt local cache */ }
    }
    cache.set(key, value);
  }
  return cache.get(key) as T;
}

function persistLocal<T>(key: string, value: T) {
  cache.set(key, value);
  if (typeof window !== "undefined") localStorage.setItem(PREFIX + key, JSON.stringify(value));
  notify();
}

async function persistRecord(collection: string, record: Rec) {
  const { data: authData } = await supabase.auth.getSession();
  if (!authData.session) return;
  const { error } = await supabase.from("app_records").upsert({
    collection_key: collection,
    record_id: record.id,
    data: record,
    updated_by: authData.session.user.id,
    updated_at: new Date().toISOString(),
  }, { onConflict: "collection_key,record_id" });
  if (error) console.error(`Could not save ${collection} record to Supabase:`, error.message);
}

async function hydrateFromSupabase() {
  if (hydrationPromise) return hydrationPromise;
  hydrationStarted = true;
  hydrationPromise = (async () => {
    const { data: authData } = await supabase.auth.getSession();
    if (!authData.session) return;
    const { data, error } = await supabase.from("app_records").select("collection_key,record_id,data");
    if (error) {
      console.error("Could not load SurakshaOps records from Supabase:", error.message);
      return;
    }
    const rows = data ?? [];
    if (rows.length === 0) {
      // First authenticated run: migrate the existing browser records (including
      // clearly-labelled demonstration records) to the shared database once.
      for (const key of COLLECTIONS) {
        const value = read<unknown>(key, key === "settings" ? defaultSettings : []);
        const records: Rec[] = key === "settings" ? [{ id: "settings", ...(value as object) }] : value as Rec[];
        for (const record of records) await persistRecord(key, record);
      }
      return;
    }
    const grouped = new Map<string, Rec[]>();
    for (const row of rows) {
      const list = grouped.get(row.collection_key) ?? [];
      list.push(row.data as Rec);
      grouped.set(row.collection_key, list);
    }
    for (const key of COLLECTIONS) {
      const records = grouped.get(key);
      if (!records?.length) continue;
      if (key === "settings") {
        const { id: _id, ...settings } = records[0];
        persistLocal(key, settings);
      } else {
        persistLocal(key, records);
      }
    }
  })().finally(() => {
  hydrationPromise = null;
  notify();
});
  return hydrationPromise;
}

const subscribe = (listener: () => void) => { listeners.add(listener); return () => listeners.delete(listener); };

export function useStoreValue<T>(key: string, fallback: T): T {
  const value = useSyncExternalStore(subscribe, () => read(key, fallback), () => fallback);
  useEffect(() => {
    if (!hydrationStarted) void hydrateFromSupabase();
  }, []);
  return value;
}

export const newId = () => Math.random().toString(36).slice(2, 10);

/** Existing synchronous UI API; writes update the local cache immediately and persist remotely. */
export function useCollection<T extends Rec = Rec>(key: string) {
  const items = useStoreValue<T[]>(key, EMPTY as T[]);
  return {
    items,
    save(item: T) {
      const list = read<T[]>(key, []);
      const exists = list.some((record) => record.id === item.id);
      const next = exists ? list.map((record) => record.id === item.id ? item : record) : [item, ...list];
      persistLocal(key, next);
      void persistRecord(key, item);
    },
    remove(id: string) {
      const list = read<T[]>(key, []);
      const removed = list.find((record) => record.id === id);
      persistLocal(key, list.filter((record) => record.id !== id));
      if (removed) void supabase.from("app_records").delete().eq("collection_key", key).eq("record_id", id)
        .then(({ error }) => { if (error) console.error(`Could not remove ${key} record from Supabase:`, error.message); });
    },
  };
}

export function useSettings(): [Settings, (settings: Settings) => void] {
  const settings = useStoreValue<Settings>("settings", defaultSettings);
  return [settings, (next) => {
    persistLocal("settings", next);
    void persistRecord("settings", { id: "settings", ...next });
  }];
}

export function restoreDemoData() {
  if (typeof window === "undefined") return;
  Object.keys(localStorage).filter((key) => key.startsWith(PREFIX)).forEach((key) => localStorage.removeItem(key));
  cache.clear();
  hydrationStarted = false;
  hydrationPromise = null;
  ensureSeeded();
  for (const key of COLLECTIONS) {
    const value = read<unknown>(key, key === "settings" ? defaultSettings : []);
    const records: Rec[] = key === "settings" ? [{ id: "settings", ...(value as object) }] : value as Rec[];
    for (const record of records) void persistRecord(key, record);
  }
  notify();
}

export function clearAllData() {
  const seed = buildSeed();
  Object.keys(seed).forEach((key) => {
    const value = key === "settings" ? seed.settings : [];
    persistLocal(key, value);
    if (key === "settings") void persistRecord("settings", { id: "settings", ...(value as object) });
    else void supabase.from("app_records").delete().eq("collection_key", key)
      .then(({ error }) => { if (error) console.error(`Could not clear ${key} records in Supabase:`, error.message); });
  });
}

export const today = () => new Date().toISOString().slice(0, 10);

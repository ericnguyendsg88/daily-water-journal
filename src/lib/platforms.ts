export interface Platform {
  id: string;
  label: string;
  color: string; // CSS color string
  hslVar: string;
  isCustom?: boolean;
}

export const DEFAULT_PLATFORMS: Platform[] = [
  { id: 'instagram', label: 'Instagram', color: 'hsl(350, 70%, 60%)', hslVar: '--ink-instagram' },
  { id: 'tiktok', label: 'TikTok', color: 'hsl(180, 100%, 50%)', hslVar: '--ink-tiktok' },
  { id: 'youtube', label: 'YouTube', color: 'hsl(0, 85%, 50%)', hslVar: '--ink-youtube' },
  { id: 'twitter', label: 'X / Twitter', color: 'hsl(205, 90%, 50%)', hslVar: '--ink-twitter' },
  { id: 'facebook', label: 'Facebook', color: 'hsl(220, 60%, 45%)', hslVar: '--ink-facebook' },
  { id: 'linkedin', label: 'LinkedIn', color: 'hsl(215, 40%, 35%)', hslVar: '--ink-linkedin' },
];

export interface DayEntry {
  date: string; // ISO date
  platforms: Record<string, number>; // id -> minutes
  clarity: number;
  snapshot: string; // base64
  reflection: string;
}

export function getReflection(clarity: number): string {
  if (clarity >= 90) return "the water is still today.";
  if (clarity >= 75) return "a few gentle ripples.";
  if (clarity >= 60) return "soft hues drift beneath the surface.";
  if (clarity >= 45) return "the colors are gathering.";
  if (clarity >= 30) return "it's getting crowded in there.";
  if (clarity >= 15) return "the water grows heavy and dark.";
  return "you can barely see the bottom.";
}

export function getClarity(platforms: Record<string, number>): number {
  const total = Object.values(platforms).reduce((s, v) => s + v, 0);
  const maxTotal = 1800; // 6 platforms × 300 min
  return Math.max(0, Math.round(100 - (total / maxTotal) * 100));
}

const STORAGE_KEY = 'mindpool-entries';

export function loadEntries(): DayEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveEntry(entry: DayEntry): void {
  const entries = loadEntries();
  const idx = entries.findIndex(e => e.date === entry.date);
  if (idx >= 0) entries[idx] = entry;
  else entries.unshift(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function deleteEntry(date: string): void {
  const entries = loadEntries().filter(e => e.date !== date);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export type Mood = 'peaceful' | 'happy' | 'neutral' | 'sad' | 'anxious';

export interface JournalEntry {
  id: string;
  date: string; // ISO string
  content: string;
  mood: Mood;
  tags: string[];
}

export const MOOD_DATA: Record<Mood, { emoji: string; color: string; label: string }> = {
  peaceful: { emoji: '🌿', color: 'bg-emerald-500/20 text-emerald-300', label: 'Peaceful' },
  happy: { emoji: '✨', color: 'bg-amber-500/20 text-amber-300', label: 'Happy' },
  neutral: { emoji: '☁️', color: 'bg-slate-500/20 text-slate-300', label: 'Neutral' },
  sad: { emoji: '💧', color: 'bg-blue-500/20 text-blue-300', label: 'Low' },
  anxious: { emoji: '🌩️', color: 'bg-purple-500/20 text-purple-300', label: 'Restless' },
};

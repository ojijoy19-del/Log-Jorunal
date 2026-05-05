import { useState, useEffect, useMemo } from 'react';
import { JournalEntry, Mood } from '../types';
import { format, isSameDay, parseISO, differenceInDays } from 'date-fns';
import { supabase } from '../lib/supabase';

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem('life-log-entries');
    return saved ? JSON.parse(saved) : [];
  });

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<any>(null);

  // Auth Listener
  useEffect(() => {
    if (!supabase) return;
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sync from Supabase
  useEffect(() => {
    async function fetchEntries() {
      if (!supabase || !user) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .order('date', { ascending: false });

      if (data && !error) {
        setEntries(data as JournalEntry[]);
      }
      setLoading(false);
    }
    fetchEntries();
  }, [user]);

  // Save to LocalStorage fallback
  useEffect(() => {
    localStorage.setItem('life-log-entries', JSON.stringify(entries));
  }, [entries]);

  const addOrUpdateEntry = async (entry: Omit<JournalEntry, 'id'> & { id?: string }) => {
    const formattedDate = format(parseISO(entry.date), 'yyyy-MM-dd');
    
    // Update local state first for responsiveness
    setEntries(prev => {
      const existingIndex = prev.findIndex(e => 
        (entry.id && e.id === entry.id) || isSameDay(parseISO(e.date), parseISO(entry.date))
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], ...entry, id: updated[existingIndex].id };
        return updated;
      }

      return [{ ...entry, id: crypto.randomUUID() } as JournalEntry, ...prev];
    });

    // Supabase Sync
    if (supabase && user) {
      const payload = {
        user_id: user.id,
        date: formattedDate,
        content: entry.content,
        mood: entry.mood,
        tags: entry.tags || []
      };

      const { error } = await supabase
        .from('journal_entries')
        .upsert(payload, { onConflict: 'user_id,date' });
      
      if (error) console.error("Supabase sync error:", error);
    }
  };

  const deleteEntry = async (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
    
    if (supabase && user) {
      await supabase.from('journal_entries').delete().match({ id, user_id: user.id });
    }
  };

  const filteredEntries = useMemo(() => {
    return entries.filter(e => 
      (e.content?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (e.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ?? false)
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries, searchQuery]);

  const streak = useMemo(() => {
    if (entries.length === 0) return 0;
    const sortedDates = [...entries]
      .map(e => parseISO(e.date))
      .sort((a, b) => b.getTime() - a.getTime());
    
    let currentStreak = 0;
    const today = new Date();
    
    // Check if the most recent entry is today or yesterday
    const firstDiff = differenceInDays(today, sortedDates[0]);
    if (firstDiff > 1) return 0;

    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        currentStreak = 1;
        continue;
      }
      
      const diff = differenceInDays(sortedDates[i-1], sortedDates[i]);
      if (diff === 1) {
        currentStreak++;
      } else if (diff > 1) {
        break;
      }
    }
    return currentStreak;
  }, [entries]);

  return {
    entries,
    filteredEntries,
    addOrUpdateEntry,
    deleteEntry,
    searchQuery,
    setSearchQuery,
    streak
  };
}

import React, { useState } from 'react';
import { Search, Flame, BookOpen, Menu, X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useJournal } from './hooks/useJournal';
import { Editor } from './components/Editor';
import { Calendar } from './components/Calendar';
import { cn } from './lib/utils';
import { format, parseISO } from 'date-fns';
import { MOOD_DATA } from './types';
import { supabase } from './lib/supabase';

export default function App() {
  const { 
    filteredEntries, 
    addOrUpdateEntry, 
    deleteEntry, 
    searchQuery, 
    setSearchQuery, 
    streak,
    entries
  } = useJournal();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState<any>(null);

  React.useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const currentEntry = entries.find(e => 
    format(parseISO(e.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
  );

  return (
    <div className="relative min-h-screen font-sans selection:bg-white/20">
      <div className="paper-grain" />
      
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-emerald-500/5 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-purple-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 flex h-screen overflow-hidden">
        {/* Sidebar */}
        <motion.aside
          initial={false}
          animate={{ 
            width: isSidebarOpen ? '360px' : '0px',
            opacity: isSidebarOpen ? 1 : 0
          }}
          className="bg-white/[0.02] border-r border-white/5 flex flex-col shrink-0 overflow-hidden"
        >
          <div className="w-[360px] flex flex-col h-full p-8 space-y-8">
            {/* Logo & Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
                  <BookOpen size={18} className="text-white/60" />
                </div>
                <h1 className="font-serif italic text-xl">Life Log</h1>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 hover:bg-white/5 rounded-full text-white/20 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Streak Counter */}
            <div className="bg-white/5 rounded-3xl p-6 flex items-center justify-between border border-white/5 relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-[10px] uppercase tracking-widest font-bold text-white/30 mb-1">Current Streak</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-serif font-bold">{streak}</span>
                  <span className="text-sm font-medium text-white/40">days</span>
                </div>
              </div>
              <div className="relative z-10 w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-400">
                <Flame size={24} className={cn(streak > 0 && "animate-pulse")} />
              </div>
              {/* Decorative background for streak */}
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-orange-500/5 blur-2xl rounded-full group-hover:bg-orange-500/10 transition-colors duration-500" />
            </div>

            {/* Search */}
            <div className="space-y-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white/60 transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="Search memories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 transition-all placeholder:text-white/10"
                />
              </div>

              {/* Search Results / Recent */}
              <div className="max-h-[160px] overflow-y-auto space-y-2 scroll-hide">
                <AnimatePresence mode="popLayout">
                  {filteredEntries.slice(0, 3).map(entry => (
                    <motion.button
                      key={entry.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => setSelectedDate(parseISO(entry.date))}
                      className="w-full text-left p-3 hover:bg-white/5 rounded-xl transition-all group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{format(parseISO(entry.date), 'MMM d')}</span>
                        <span>{MOOD_DATA[entry.mood].emoji}</span>
                      </div>
                      <p className="text-xs text-white/60 line-clamp-1 italic font-serif leading-relaxed">
                        {entry.content || "No content..."}
                      </p>
                    </motion.button>
                  ))}
                </AnimatePresence>
                {searchQuery && filteredEntries.length === 0 && (
                  <p className="text-xs text-white/20 text-center py-4 italic">No matching records found.</p>
                )}
              </div>
            </div>

            {/* Calendar */}
            <div className="pt-4 border-t border-white/5">
              <Calendar 
                selectedDate={selectedDate} 
                onDateSelect={setSelectedDate} 
                entries={entries} 
              />
            </div>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto relative bg-[#0a0a0a]/50 backdrop-blur-sm">
          {!isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="fixed left-6 top-8 z-20 p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white/40 hover:text-white transition-all border border-white/5"
            >
              <Menu size={20} />
            </button>
          )}

          {/* New Entry Button (for today) */}
          <button
            onClick={() => setSelectedDate(new Date())}
            className="fixed right-10 bottom-10 z-20 w-14 h-14 bg-white text-black rounded-2xl flex items-center justify-center shadow-xl shadow-white/10 hover:scale-105 active:scale-95 transition-all"
            title="Today's Entry"
          >
            <Plus size={28} />
          </button>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDate.toISOString()}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="h-full"
            >
              <Editor
                date={selectedDate}
                content={currentEntry?.content || ''}
                mood={currentEntry?.mood || 'peaceful'}
                onSave={addOrUpdateEntry}
                onDelete={currentEntry ? () => deleteEntry(currentEntry.id) : undefined}
              />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

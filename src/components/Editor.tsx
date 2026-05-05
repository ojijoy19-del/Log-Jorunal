import React, { useRef, useEffect } from 'react';
import { Bold, Italic, List, Save, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { Mood, MOOD_DATA } from '../types';
import { MoodSelector } from './MoodSelector';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

interface EditorProps {
  date: Date;
  content: string;
  mood: Mood;
  onSave: (data: { content: string; mood: Mood; date: string }) => void;
  onDelete?: () => void;
}

export function Editor({ date, content: initialContent, mood: initialMood, onSave, onDelete }: EditorProps) {
  const [content, setContent] = React.useState(initialContent);
  const [mood, setMood] = React.useState<Mood>(initialMood);
  const [isSaved, setIsSaved] = React.useState(true);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setContent(initialContent);
    setMood(initialMood);
    setIsSaved(true);
  }, [initialContent, initialMood, date]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsSaved(false);
  };

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    
    const newText = text.substring(0, start) + before + selectedText + after + text.substring(end);
    setContent(newText);
    setIsSaved(false);
    
    // Focus back and set selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full px-6 py-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <CalendarIcon size={14} className="opacity-60" />
            <span className="text-xs uppercase tracking-[0.2em] font-medium text-white/40">
              {format(date, 'EEEE, MMMM do')}
            </span>
          </div>
          <h1 className="text-4xl font-serif font-medium text-white/90">Daily Entry</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <AnimatePresence>
            {!isSaved && (
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onClick={() => {
                  onSave({ content, mood, date: date.toISOString() });
                  setIsSaved(true);
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-full font-medium text-sm hover:bg-white/90 transition-colors shadow-lg shadow-white/5"
              >
                <Save size={16} />
                Save Entry
              </motion.button>
            )}
          </AnimatePresence>
          {onDelete && (
            <button 
              onClick={onDelete}
              className="p-2.5 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all"
              title="Delete Entry"
            >
              <Trash2 size={20} />
            </button>
          )}
        </div>
      </header>

      <div className="space-y-8 flex-1 flex flex-col">
        <section>
          <MoodSelector selected={mood} onChange={(m) => { setMood(m); setIsSaved(false); }} />
        </section>

        <section className="flex-1 flex flex-col relative group">
          <div className="absolute -left-12 top-0 flex flex-col gap-2 opacity-0 group-focus-within:opacity-100 transition-opacity hidden lg:flex">
            <ToolbarButton onClick={() => insertText('**', '**')} icon={<Bold size={18} />} label="Bold" />
            <ToolbarButton onClick={() => insertText('_', '_')} icon={<Italic size={18} />} label="Italic" />
            <ToolbarButton onClick={() => insertText('\n- ')} icon={<List size={18} />} label="Bullet" />
          </div>

          {/* Simple Toolbar for mobile/small screens */}
          <div className="flex lg:hidden gap-1 mb-4 p-1 bg-white/5 rounded-lg w-fit">
            <ToolbarButton onClick={() => insertText('**', '**')} icon={<Bold size={16} />} />
            <ToolbarButton onClick={() => insertText('_', '_')} icon={<Italic size={16} />} />
            <ToolbarButton onClick={() => insertText('\n- ')} icon={<List size={16} />} />
          </div>

          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            placeholder="How was your day? Write freely..."
            className="w-full flex-1 bg-transparent border-none focus:ring-0 text-xl leading-relaxed font-sans placeholder:text-white/10 resize-none caret-white/50 pb-20"
          />
        </section>
      </div>
    </div>
  );
}

function ToolbarButton({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="p-3 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all flex items-center gap-2"
      title={label}
    >
      {icon}
      {label && <span className="text-[10px] uppercase tracking-wider font-bold lg:hidden">{label}</span>}
    </button>
  );
}

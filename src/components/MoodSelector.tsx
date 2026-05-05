import React from 'react';
import { Mood, MOOD_DATA } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface MoodSelectorProps {
  selected: Mood;
  onChange: (mood: Mood) => void;
}

export function MoodSelector({ selected, onChange }: MoodSelectorProps) {
  return (
    <div className="flex gap-2 p-1 bg-white/5 rounded-2xl w-fit">
      {(Object.entries(MOOD_DATA) as [Mood, typeof MOOD_DATA[Mood]][]).map(([mood, data]) => (
        <button
          key={mood}
          onClick={() => onChange(mood)}
          className={cn(
            "relative flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 group",
            selected === mood ? data.color : "hover:bg-white/10"
          )}
        >
          <span className="text-xl group-hover:scale-110 transition-transform">{data.emoji}</span>
          <span className={cn(
            "text-sm font-medium transition-all duration-300 overflow-hidden",
            selected === mood ? "w-16 opacity-100 ml-1" : "w-0 opacity-0"
          )}>
            {data.label}
          </span>
          {selected === mood && (
            <motion.div
              layoutId="mood-glow"
              className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20"
              initial={false}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}

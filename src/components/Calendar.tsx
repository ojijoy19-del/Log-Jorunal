import React from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  isSameMonth, 
  addMonths, 
  subMonths,
  parseISO
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { JournalEntry, MOOD_DATA } from '../types';

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  entries: JournalEntry[];
}

export function Calendar({ selectedDate, onDateSelect, entries }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(startOfMonth(selectedDate));

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth)),
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-serif italic text-white/60">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-1">
          <button onClick={prevMonth} className="p-1.5 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors">
            <ChevronLeft size={16} />
          </button>
          <button onClick={nextMonth} className="p-1.5 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-3 gap-x-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
          <div key={`${day}-${idx}`} className="text-[10px] text-center font-bold text-white/20 uppercase tracking-widest pb-2">
            {day}
          </div>
        ))}
        
        {days.map((day, idx) => {
          const entry = entries.find(e => isSameDay(parseISO(e.date), day));
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentMonth);

          return (
            <button
              key={idx}
              onClick={() => onDateSelect(day)}
              className={cn(
                "relative h-10 w-10 flex items-center justify-center rounded-xl text-xs transition-all duration-300",
                !isCurrentMonth && "text-white/5",
                isCurrentMonth && !isSelected && "text-white/40 hover:bg-white/5 hover:text-white",
                isSelected && "bg-white text-black font-semibold shadow-lg shadow-white/10"
              )}
            >
              {format(day, 'd')}
              {entry && !isSelected && (
                <div 
                  className={cn(
                    "absolute bottom-1.5 w-1 h-1 rounded-full",
                    MOOD_DATA[entry.mood].color.split(' ')[0] // Get bg color
                  )} 
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

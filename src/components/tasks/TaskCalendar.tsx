import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Task } from '../../types';
import { useData } from '../../context/DataContext';
import { Badge } from '../common/Badge';
import { formatDate } from '../../utils/helpers';

interface TaskCalendarProps {
  tasks: Task[];
}

export const TaskCalendar: React.FC<TaskCalendarProps> = ({ tasks }) => {
  const { setSelectedTaskId } = useData();
  const [currentMonth, setCurrentMonth] = useState<number>(8); // 8 = September (0-indexed)
  const [currentYear, setCurrentYear] = useState<number>(2026);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Number of days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blankDays = Array.from({ length: firstDayIndex }, (_, i) => i);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-sm">
      {/* Calendar Month Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-blue-400" />
          <h3 className="text-base font-bold text-white tracking-tight">
            {monthNames[currentMonth]} {currentYear}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setCurrentMonth(8);
              setCurrentYear(2026);
            }}
            className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 rounded font-medium"
          >
            Today
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 border-b border-slate-800/80 bg-slate-950/40 text-center text-[11px] font-semibold text-slate-400 py-2.5">
        <span>SUN</span>
        <span>MON</span>
        <span>TUE</span>
        <span>WED</span>
        <span>THU</span>
        <span>FRI</span>
        <span>SAT</span>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 divide-x divide-y divide-slate-800/60 bg-slate-950/20">
        {blankDays.map((_, index) => (
          <div key={`blank-${index}`} className="min-h-[110px] bg-slate-950/40 p-2" />
        ))}

        {daysArray.map((day) => {
          // format day string e.g., '2026-09-04'
          const mStr = String(currentMonth + 1).padStart(2, '0');
          const dStr = String(day).padStart(2, '0');
          const dateKey = `${currentYear}-${mStr}-${dStr}`;

          const dayTasks = tasks.filter((t) => t.dueDate === dateKey);
          const isToday = currentYear === 2026 && currentMonth === 8 && day === 4;

          return (
            <div
              key={`day-${day}`}
              className={`min-h-[110px] p-2 transition-colors ${
                isToday ? 'bg-blue-950/20 ring-1 ring-inset ring-blue-500/40' : 'hover:bg-slate-900/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-xs font-mono font-medium rounded-full w-6 h-6 flex items-center justify-center ${
                    isToday ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'
                  }`}
                >
                  {day}
                </span>
                {dayTasks.length > 0 && (
                  <span className="text-[10px] font-mono text-slate-500 font-semibold">
                    {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
                  </span>
                )}
              </div>

              {/* Tasks due on this day */}
              <div className="space-y-1 overflow-y-auto max-h-[85px]">
                {dayTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTaskId(t.id)}
                    className={`p-1.5 rounded text-[11px] font-medium truncate cursor-pointer transition-all border ${
                      t.status === 'BLOCKED'
                        ? 'bg-rose-950/40 border-rose-500/40 text-rose-300 hover:border-rose-400'
                        : t.status === 'COMPLETED'
                        ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300 hover:border-emerald-400'
                        : 'bg-slate-850 border-slate-700/60 text-slate-200 hover:border-blue-500 hover:text-white'
                    }`}
                    title={`${t.id}: ${t.title} (${t.progress}%)`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="truncate">{t.title}</span>
                      <span className="font-mono text-[9px] text-slate-400 flex-shrink-0">{t.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

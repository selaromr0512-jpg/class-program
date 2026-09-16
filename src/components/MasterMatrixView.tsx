import React, { useState } from 'react';
import { 
  Layers, 
  Calendar, 
  AlertTriangle, 
  Users, 
  GraduationCap, 
  Clock 
} from 'lucide-react';
import { Section, Teacher, Room, SubjectItem, ScheduleSlot, ScheduleConflict, DayOfWeek, TimePeriod } from '../types';
import { TIME_PERIODS_DEFAULT, DAYS_OF_WEEK } from '../data/depedCurriculum';
import { isTimeOverlap } from '../utils/conflictDetector';

interface MasterMatrixViewProps {
  sections: Section[];
  teachers: Teacher[];
  rooms: Room[];
  subjects: SubjectItem[];
  slots: ScheduleSlot[];
  conflicts: ScheduleConflict[];
  activeTerm: string;
  timePeriods?: TimePeriod[];
}

export const MasterMatrixView: React.FC<MasterMatrixViewProps> = ({
  sections,
  teachers,
  rooms,
  subjects,
  slots,
  conflicts,
  activeTerm,
  timePeriods
}) => {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Monday');
  const [matrixMode, setMatrixMode] = useState<'SECTION' | 'TEACHER'>('SECTION');

  const activePeriods = timePeriods && timePeriods.length > 0 ? timePeriods : TIME_PERIODS_DEFAULT;
  const teachingPeriods = activePeriods.filter(p => !p.isBreak);

  const teacherMap = new Map<string, Teacher>(teachers.map(t => [t.id, t]));
  const sectionMap = new Map<string, Section>(sections.map(s => [s.id, s]));
  const roomMap = new Map<string, Room>(rooms.map(r => [r.id, r]));
  const subjectMap = new Map<string, SubjectItem>(subjects.map(sub => [sub.id, sub]));

  const activeDaySlots = slots.filter(
    s => s.day === selectedDay && (!s.term || s.term === activeTerm) && !s.isBreak
  );

  const conflictingSlotIds = new Set<string>();
  conflicts.forEach(c => {
    if (c.day === selectedDay || !c.day) {
      c.affectedSlotIds?.forEach(id => conflictingSlotIds.add(id));
    }
  });

  return (
    <div className="space-y-4">
      {/* Top Filter Controls */}
      <div className="bg-[#0f172a]/80 backdrop-blur-md p-4 rounded-xl border border-slate-800 shadow-lg shadow-black/20 flex flex-wrap items-center justify-between gap-4">
        
        {/* Day Selector Tabs */}
        <div className="flex items-center bg-slate-900/90 p-0.5 rounded-lg border border-slate-800 text-xs">
          {DAYS_OF_WEEK.map(d => (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                selectedDay === d
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Matrix Grouping Mode */}
        <div className="flex items-center bg-slate-900/90 p-0.5 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setMatrixMode('SECTION')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              matrixMode === 'SECTION'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Section Master View</span>
          </button>

          <button
            onClick={() => setMatrixMode('TEACHER')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              matrixMode === 'TEACHER'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Faculty Master View</span>
          </button>
        </div>
      </div>

      {/* Master Matrix Grid */}
      <div className="bg-[#0f172a]/90 backdrop-blur-md rounded-xl border border-slate-800 shadow-xl overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left text-xs">
          <thead>
            <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
              <th className="p-3 w-48 border-r border-slate-800">
                {matrixMode === 'SECTION' ? 'Class Section' : 'Faculty Member'}
              </th>
              {teachingPeriods.map(period => (
                <th key={period.id} className="p-2.5 border-r border-slate-800 last:border-r-0 text-center min-w-[130px]">
                  <div className="text-slate-200">{period.label}</div>
                  <div className="text-[10px] text-slate-500 font-mono font-normal">
                    {period.startTime}-{period.endTime}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {matrixMode === 'SECTION' ? (
              // Sections as Rows
              sections.map(section => {
                const secSlots = activeDaySlots.filter(s => s.sectionId === section.id);

                return (
                  <tr key={section.id} className="hover:bg-slate-800/20">
                    <td className="p-3 border-r border-slate-800 bg-slate-900/60">
                      <div className="font-bold text-slate-100">{section.name}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="font-semibold">{section.gradeLevel}</span>
                        {section.strand && (
                          <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-1.5 py-0.2 rounded font-bold text-[9px]">
                            {section.strand}
                          </span>
                        )}
                      </div>
                    </td>

                    {teachingPeriods.map(period => {
                      const matching = secSlots.filter(s =>
                        isTimeOverlap(s.startTime, s.endTime, period.startTime, period.endTime)
                      );

                      return (
                        <td key={period.id} className="p-1 border-r border-slate-800/60 last:border-r-0 align-top h-14">
                          {matching.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-[10px] text-slate-700">
                              -
                            </div>
                          ) : (
                            matching.map(slot => {
                              const sub = subjectMap.get(slot.subjectId);
                              const t = teacherMap.get(slot.teacherId);
                              const rm = roomMap.get(slot.roomId);
                              const isClash = conflictingSlotIds.has(slot.id);

                              return (
                                <div
                                  key={slot.id}
                                  className={`p-1.5 rounded text-[11px] shadow-sm border ${
                                    isClash
                                      ? 'bg-rose-950/70 border-rose-500 ring-2 ring-rose-500/30 text-rose-100 animate-pulse'
                                      : 'bg-slate-800/90 border-slate-700/80 text-slate-100'
                                  }`}
                                  style={{
                                    borderLeftWidth: '3px',
                                    borderLeftColor: sub?.color || '#3B82F6'
                                  }}
                                >
                                  <div className="font-bold text-slate-100 truncate">
                                    {sub?.code || 'Sub'}
                                  </div>
                                  <div className="text-[9px] text-slate-400 truncate">
                                    {t?.name?.split(' ').slice(-1)[0]} • {rm?.code}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            ) : (
              // Teachers as Rows
              teachers.map(teacher => {
                const tSlots = activeDaySlots.filter(s => s.teacherId === teacher.id);

                return (
                  <tr key={teacher.id} className="hover:bg-slate-800/20">
                    <td className="p-3 border-r border-slate-800 bg-slate-900/60">
                      <div className="font-bold text-slate-100">{teacher.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{teacher.title}</div>
                    </td>

                    {teachingPeriods.map(period => {
                      const matching = tSlots.filter(s =>
                        isTimeOverlap(s.startTime, s.endTime, period.startTime, period.endTime)
                      );

                      return (
                        <td key={period.id} className="p-1 border-r border-slate-800/60 last:border-r-0 align-top h-14">
                          {matching.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-[10px] text-slate-600 font-mono">
                              Free
                            </div>
                          ) : (
                            matching.map(slot => {
                              const sub = subjectMap.get(slot.subjectId);
                              const sec = sectionMap.get(slot.sectionId);
                              const rm = roomMap.get(slot.roomId);
                              const isClash = conflictingSlotIds.has(slot.id);

                              return (
                                <div
                                  key={slot.id}
                                  className={`p-1.5 rounded text-[11px] shadow-sm border ${
                                    isClash
                                      ? 'bg-rose-950/70 border-rose-500 ring-2 ring-rose-500/30 text-rose-100 animate-pulse'
                                      : 'bg-slate-800/90 border-slate-700/80 text-slate-100'
                                  }`}
                                  style={{
                                    borderLeftWidth: '3px',
                                    borderLeftColor: sub?.color || '#3B82F6'
                                  }}
                                >
                                  <div className="font-bold text-slate-100 truncate">
                                    {sec?.name || 'Class'}
                                  </div>
                                  <div className="text-[9px] text-slate-400 truncate">
                                    {sub?.code} ({rm?.code})
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

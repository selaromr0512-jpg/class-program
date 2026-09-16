import React, { useState } from 'react';
import { 
  User, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Award, 
  BookOpen, 
  Calendar,
  Layers
} from 'lucide-react';
import { Teacher, ScheduleSlot, Section, Room, SubjectItem, ScheduleConflict } from '../types';
import { TIME_PERIODS_DEFAULT, DAYS_OF_WEEK } from '../data/depedCurriculum';
import { timeToMinutes, isTimeOverlap } from '../utils/conflictDetector';
import { computeTeacherWeeklySummary } from '../utils/exporter';

interface TeacherViewProps {
  teachers: Teacher[];
  slots: ScheduleSlot[];
  sections: Section[];
  rooms: Room[];
  subjects: SubjectItem[];
  conflicts: ScheduleConflict[];
  activeTerm: string;
  onEditSlot: (slot: ScheduleSlot) => void;
  onDeleteSlot: (slotId: string) => void;
}

export const TeacherView: React.FC<TeacherViewProps> = ({
  teachers,
  slots,
  sections,
  rooms,
  subjects,
  conflicts,
  activeTerm,
  onEditSlot,
  onDeleteSlot
}) => {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(teachers[0]?.id || '');

  const activeTeacher = teachers.find(t => t.id === selectedTeacherId) || teachers[0];

  const teacherMap = new Map<string, Teacher>(teachers.map(t => [t.id, t]));
  const sectionMap = new Map<string, Section>(sections.map(s => [s.id, s]));
  const roomMap = new Map<string, Room>(rooms.map(r => [r.id, r]));
  const subjectMap = new Map<string, SubjectItem>(subjects.map(s => [s.id, s]));

  // Slots taught by this teacher
  const teacherSlots = slots.filter(
    s => s.teacherId === activeTeacher?.id && (!s.term || s.term === activeTerm) && !s.isBreak
  );

  const teacherConflicts = conflicts.filter(c => c.teacherId === activeTeacher?.id);
  const conflictingSlotIds = new Set<string>();
  teacherConflicts.forEach(c => c.affectedSlotIds?.forEach(id => conflictingSlotIds.add(id)));

  // Workload computation
  const summary = computeTeacherWeeklySummary(activeTeacher, slots, activeTerm);
  const maxWeeklyHours = (activeTeacher.maxWeeklyMinutes / 60) || 30;
  const isWeeklyOverloaded = parseFloat(summary.totalHours) > maxWeeklyHours;

  return (
    <div className="space-y-4">
      {/* Faculty Summary Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#0f172a]/80 backdrop-blur-md p-4 rounded-xl border border-slate-800 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Total Faculty</span>
            <User className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1">
            {teachers.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">JHS & SHS Teaching Staff</p>
        </div>

        <div className="bg-[#0f172a]/80 backdrop-blur-md p-4 rounded-xl border border-slate-800 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Active Term Loads</span>
            <BookOpen className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1">
            {slots.filter(s => (!s.term || s.term === activeTerm) && !s.isBreak).length}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Total class sessions scheduled</p>
        </div>

        <div className="bg-[#0f172a]/80 backdrop-blur-md p-4 rounded-xl border border-slate-800 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>DepEd Workload Compliance</span>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1">
            {teachers.filter(t => parseFloat(computeTeacherWeeklySummary(t, slots, activeTerm).totalHours) <= 30).length} / {teachers.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Under 30 hrs/wk DepEd Limit</p>
        </div>

        <div className="bg-[#0f172a]/80 backdrop-blur-md p-4 rounded-xl border border-slate-800 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Faculty Conflict Alerts</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1">
            {conflicts.filter(c => c.type === 'TEACHER_DOUBLE_BOOKED' || c.type === 'TEACHER_MAX_LOAD_EXCEEDED').length}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Double-bookings & daily overloads</p>
        </div>
      </div>

      {/* Main Layout: Faculty List Sidebar + Selected Teacher Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* Left: Faculty List */}
        <div className="lg:col-span-1 bg-[#0f172a]/80 backdrop-blur-md rounded-xl border border-slate-800 shadow-lg shadow-black/20 p-3 space-y-2 h-fit max-h-[750px] overflow-y-auto">
          <div className="px-2 py-1 font-bold text-slate-300 text-xs uppercase tracking-wider flex items-center justify-between">
            <span>Faculty Directory</span>
            <span className="text-[10px] bg-slate-900 text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded">
              {teachers.length}
            </span>
          </div>

          <div className="space-y-1.5">
            {teachers.map(teacher => {
              const isSelected = teacher.id === selectedTeacherId;
              const tSummary = computeTeacherWeeklySummary(teacher, slots, activeTerm);
              const hasClash = conflicts.some(c => c.teacherId === teacher.id && c.severity === 'CRITICAL');
              const isOver = parseFloat(tSummary.totalHours) > (teacher.maxWeeklyMinutes / 60 || 30);

              return (
                <button
                  key={teacher.id}
                  onClick={() => setSelectedTeacherId(teacher.id)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-950/60 border-indigo-500/50 ring-1 ring-indigo-500/30 text-white'
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100 truncate">{teacher.name}</span>
                    {hasClash ? (
                      <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] shrink-0" title="Clash detected" />
                    ) : isOver ? (
                      <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" title="Workload Warning" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Valid" />
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">{teacher.title}</div>
                  
                  {/* Hours badge */}
                  <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-slate-800/60 text-[10px] text-slate-400">
                    <span>{tSummary.assignedLoadsCount} class loads</span>
                    <span className={`font-semibold ${isOver ? 'text-rose-400' : 'text-slate-200'}`}>
                      {tSummary.totalHours} hrs/wk
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Active Teacher Program & Workload Analysis */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Teacher Profile Card */}
          {activeTeacher && (
            <div className="bg-[#0f172a]/80 backdrop-blur-md p-4 rounded-xl border border-slate-800 shadow-lg shadow-black/20 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.3)] text-white flex items-center justify-center font-bold text-lg border border-indigo-400/30">
                  {activeTeacher.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-base">{activeTeacher.name}</h3>
                    <span className="bg-indigo-500/10 text-indigo-300 text-xs px-2.5 py-0.5 rounded-full font-medium border border-indigo-500/20">
                      {activeTeacher.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>Emp ID: {activeTeacher.employeeId}</span>
                    <span className="text-slate-600">•</span>
                    <span>Advisory: {sectionMap.get(activeTeacher.advisorySectionId || '')?.name || 'None'}</span>
                  </p>
                </div>
              </div>

              {/* Workload Stats & DepEd Rule 6-Hour Limit */}
              <div className="flex items-center gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Teaching Hours</div>
                  <div className={`text-base font-bold ${isWeeklyOverloaded ? 'text-rose-400' : 'text-slate-100'}`}>
                    {summary.totalHours} <span className="text-xs font-normal text-slate-500">/ 30h</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Prep Time (DepEd)</div>
                  <div className="text-base font-bold text-slate-100">
                    2.0 <span className="text-xs font-normal text-slate-500">hrs/day</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Total Duty</div>
                  <div className="text-base font-bold text-slate-100">
                    {summary.totalDutyHours} <span className="text-xs font-normal text-slate-500">hrs</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Teacher Weekly Schedule Table */}
          <div className="bg-[#0f172a]/90 backdrop-blur-md rounded-xl border border-slate-800 shadow-xl overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-3 w-28 border-r border-slate-800 text-center">Period</th>
                  {DAYS_OF_WEEK.map(day => (
                    <th key={day} className="p-3 border-r border-slate-800 last:border-r-0 text-center">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {TIME_PERIODS_DEFAULT.map(period => {
                  if (period.isBreak) {
                    return (
                      <tr key={period.id} className="bg-slate-950/40">
                        <td className="p-2 text-center font-mono text-[10px] text-slate-400 border-r border-slate-800 bg-slate-900/40">
                          {period.startTime}-{period.endTime}
                        </td>
                        <td colSpan={5} className="p-1.5 text-center text-slate-400 text-[11px] font-medium bg-slate-900/20">
                          {period.label}
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={period.id} className="hover:bg-slate-800/20">
                      <td className="p-2 text-center font-mono text-slate-300 border-r border-slate-800 bg-slate-900/60">
                        <div className="font-bold text-slate-200 text-[11px]">{period.label}</div>
                        <div className="text-[10px] text-slate-500">{period.startTime}-{period.endTime}</div>
                      </td>

                      {DAYS_OF_WEEK.map(day => {
                        const matchingSlots = teacherSlots.filter(s => {
                          if (s.day !== day) return false;
                          return isTimeOverlap(s.startTime, s.endTime, period.startTime, period.endTime);
                        });

                        return (
                          <td key={day} className="p-1.5 border-r border-slate-800/60 last:border-r-0 align-top h-16 min-w-[120px]">
                            {matchingSlots.length === 0 ? (
                              <div className="h-full flex items-center justify-center text-[10px] text-slate-600 font-mono">
                                [Vacant / Prep]
                              </div>
                            ) : (
                              matchingSlots.map(slot => {
                                const sub = subjectMap.get(slot.subjectId);
                                const sec = sectionMap.get(slot.sectionId);
                                const rm = roomMap.get(slot.roomId);
                                const isClash = conflictingSlotIds.has(slot.id);

                                return (
                                  <div
                                    key={slot.id}
                                    className={`p-2 rounded-lg text-xs shadow-sm border ${
                                      isClash
                                        ? 'bg-rose-950/70 border-rose-500 ring-2 ring-rose-500/30 text-rose-100 animate-pulse'
                                        : 'bg-slate-800/90 border-slate-700/80 text-slate-100'
                                    }`}
                                    style={{
                                      borderLeftWidth: '3px',
                                      borderLeftColor: sub?.color || '#3B82F6'
                                    }}
                                  >
                                    <div className="font-bold text-slate-100 leading-tight truncate">
                                      {sec?.name || 'Class'}
                                    </div>
                                    <div className="text-[10px] text-slate-300 font-semibold truncate">
                                      {sub?.code} - {sub?.name}
                                    </div>
                                    <div className="text-[9px] text-slate-400 mt-1">
                                      {rm?.name}
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
                })}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
};

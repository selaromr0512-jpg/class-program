import React, { useState } from 'react';
import { 
  Plus, 
  AlertTriangle, 
  Trash2, 
  Edit2, 
  Clock, 
  User, 
  DoorOpen, 
  BookOpen, 
  CheckCircle2, 
  GraduationCap,
  Download,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { 
  ScheduleSlot, 
  Section, 
  Teacher, 
  Room, 
  SubjectItem, 
  ScheduleConflict, 
  DayOfWeek,
  TimePeriod 
} from '../types';
import { TIME_PERIODS_DEFAULT, DAYS_OF_WEEK } from '../data/depedCurriculum';
import { isTimeOverlap, timeToMinutes } from '../utils/conflictDetector';

interface TimetableGridProps {
  slots: ScheduleSlot[];
  sections: Section[];
  teachers: Teacher[];
  rooms: Room[];
  subjects: SubjectItem[];
  timePeriods?: TimePeriod[];
  conflicts: ScheduleConflict[];
  activeTerm: string;
  selectedSectionId: string;
  onSelectSectionId: (id: string) => void;
  onOpenAddSlot: (defaultValues?: Partial<ScheduleSlot>) => void;
  onEditSlot: (slot: ScheduleSlot) => void;
  onDeleteSlot: (slotId: string) => void;
  onOpenConflictDetails: () => void;
  onExportSection?: (format: 'EXCEL' | 'PDF' | 'CSV', sectionId: string) => void;
}

export const TimetableGrid: React.FC<TimetableGridProps> = ({
  slots,
  sections,
  teachers,
  rooms,
  subjects,
  timePeriods,
  conflicts,
  activeTerm,
  selectedSectionId,
  onSelectSectionId,
  onOpenAddSlot,
  onEditSlot,
  onDeleteSlot,
  onOpenConflictDetails,
  onExportSection
}) => {
  const activePeriods = timePeriods && timePeriods.length > 0 ? timePeriods : TIME_PERIODS_DEFAULT;
  const [levelFilter, setLevelFilter] = useState<'ALL' | 'JHS' | 'SHS'>('ALL');

  const filteredSections = sections.filter(s => {
    if (levelFilter === 'ALL') return true;
    return s.level === levelFilter;
  });

  const activeSection = sections.find(s => s.id === selectedSectionId) || filteredSections[0] || sections[0];

  const teacherMap = new Map<string, Teacher>(teachers.map(t => [t.id, t]));
  const roomMap = new Map<string, Room>(rooms.map(r => [r.id, r]));
  const subjectMap = new Map<string, SubjectItem>(subjects.map(s => [s.id, s]));

  // Slots for the active section & term
  const sectionSlots = slots.filter(
    s => s.sectionId === activeSection?.id && (!s.term || s.term === activeTerm)
  );

  // Set of slot IDs with conflicts
  const conflictingSlotIds = new Set<string>();
  conflicts.forEach(c => {
    c.affectedSlotIds?.forEach(id => conflictingSlotIds.add(id));
  });

  // Calculate curriculum compliance for this section
  const requiredSubjects = subjects.filter(sub => {
    if (!activeSection) return false;
    const gradeMatches = sub.gradeLevels.includes(activeSection.gradeLevel);
    const strandMatches = !sub.strand || sub.strand === activeSection.strand;
    return gradeMatches && strandMatches;
  });

  const subjectMinutesScheduled = new Map<string, number>();
  sectionSlots.forEach(slot => {
    if (slot.isBreak) return;
    const dur = timeToMinutes(slot.endTime) - timeToMinutes(slot.startTime);
    subjectMinutesScheduled.set(slot.subjectId, (subjectMinutesScheduled.get(slot.subjectId) || 0) + dur);
  });

  return (
    <div className="space-y-4">
      {/* Top Controls: Level filter, Section dropdown selector, Section details */}
      <div className="bg-[#0f172a]/80 backdrop-blur-md p-4 rounded-xl border border-slate-800 shadow-lg shadow-black/20 flex flex-wrap items-center justify-between gap-4">
        
        {/* Left: Section Picker */}
        <div className="flex items-center flex-wrap gap-3">
          {/* Level Switcher */}
          <div className="flex items-center bg-slate-900/90 p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setLevelFilter('ALL')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                levelFilter === 'ALL' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Levels
            </button>
            <button
              onClick={() => setLevelFilter('JHS')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                levelFilter === 'JHS' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Junior High (MATATAG)
            </button>
            <button
              onClick={() => setLevelFilter('SHS')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                levelFilter === 'SHS' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Senior High (Tracks)
            </button>
          </div>

          {/* Section Select Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="select-active-section" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Section:
            </label>
            <select
              id="select-active-section"
              value={activeSection?.id}
              onChange={(e) => onSelectSectionId(e.target.value)}
              className="bg-slate-900 border border-slate-700 font-bold text-slate-100 text-sm rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
            >
              {filteredSections.map(sec => (
                <option key={sec.id} value={sec.id}>
                  {sec.name} ({sec.gradeLevel} {sec.strand ? `• ${sec.strand}` : ''})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Section Meta Details */}
        {activeSection && (
          <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
            <div className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-semibold text-slate-200">{activeSection.gradeLevel}</span>
              {activeSection.strand && (
                <span className="bg-indigo-500/20 text-indigo-300 font-bold px-1.5 py-0.5 rounded text-[10px] border border-indigo-500/30">
                  {activeSection.strand}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Adviser: </span>
              <span className="font-semibold text-slate-200">
                {teacherMap.get(activeSection.adviserTeacherId || '')?.name || 'Unassigned'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800">
              <DoorOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>Home Rm: </span>
              <span className="font-semibold text-slate-200">
                {roomMap.get(activeSection.roomDefaultId || '')?.name || 'Rm 101'}
              </span>
            </div>

            <div className="text-slate-400 bg-slate-900/50 px-2 py-1 rounded-lg border border-slate-800/60">
              {activeSection.studentCount} Students
            </div>

            {onExportSection && (
              <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase px-1 hidden sm:inline">Export Section:</span>
                <button
                  type="button"
                  onClick={() => onExportSection('EXCEL', activeSection.id)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30 transition-colors cursor-pointer"
                  title="Export this section's schedule to Excel (.xlsx)"
                >
                  <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
                  <span>Excel</span>
                </button>
                <button
                  type="button"
                  onClick={() => onExportSection('PDF', activeSection.id)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-[11px] font-semibold border border-rose-500/30 transition-colors cursor-pointer"
                  title="Export official DepEd Class Program PDF for this section"
                >
                  <FileText className="w-3 h-3 text-rose-400" />
                  <span>PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => onExportSection('CSV', activeSection.id)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 text-[11px] font-semibold border border-sky-500/30 transition-colors cursor-pointer"
                  title="Export this section's schedule to CSV"
                >
                  <FileSpreadsheet className="w-3 h-3 text-sky-400" />
                  <span>CSV</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Timetable Matrix */}
      <div className="bg-[#0f172a]/90 backdrop-blur-md rounded-xl border border-slate-800 shadow-xl overflow-x-auto">
        <table className="w-full min-w-[850px] border-collapse text-left">
          <thead>
            <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
              <th className="p-3 w-32 border-r border-slate-800 text-center">Time Period</th>
              {DAYS_OF_WEEK.map(day => (
                <th key={day} className="p-3 border-r border-slate-800 last:border-r-0 text-center">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-xs">
            {activePeriods.map((period) => {
              // If this is a global break period (Flag Ceremony, Recess, Lunch)
              if (period.isBreak) {
                return (
                  <tr key={period.id} className="bg-slate-950/40">
                    <td className="p-2.5 text-center font-mono font-semibold text-slate-400 border-r border-slate-800 bg-slate-900/40">
                      <div className="text-[11px] text-slate-300">{period.startTime} - {period.endTime}</div>
                      <div className="text-[10px] text-slate-500 font-sans">{period.label}</div>
                    </td>
                    <td colSpan={5} className="p-2 text-center text-slate-400 font-medium text-xs bg-slate-900/20">
                      <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-800/80 text-slate-300 font-semibold text-[11px] border border-slate-700/60">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {period.label} ({period.startTime} – {period.endTime})
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={period.id} className="hover:bg-slate-800/20 transition-colors">
                  {/* Period Time Column */}
                  <td className="p-2.5 text-center font-mono text-slate-300 border-r border-slate-800 bg-slate-900/60">
                    <div className="font-bold text-slate-200 text-[11px]">{period.label}</div>
                    <div className="text-[10px] text-slate-500">{period.startTime} - {period.endTime}</div>
                  </td>

                  {/* Day Columns */}
                  {DAYS_OF_WEEK.map((day) => {
                    // Find slot(s) for this day and time window
                    const matchingSlots = sectionSlots.filter(s => {
                      if (s.day !== day) return false;
                      return isTimeOverlap(s.startTime, s.endTime, period.startTime, period.endTime);
                    });

                    return (
                      <td 
                        key={day} 
                        className="p-1.5 border-r border-slate-800/60 last:border-r-0 align-top h-20 min-w-[150px] relative group"
                      >
                        {matchingSlots.length === 0 ? (
                          <div 
                            onClick={() => onOpenAddSlot({
                              sectionId: activeSection?.id,
                              day,
                              startTime: period.startTime,
                              endTime: period.endTime,
                              term: activeTerm
                            })}
                            className="h-full w-full rounded-lg border border-dashed border-slate-800 hover:border-indigo-500/60 hover:bg-indigo-500/10 transition-all flex items-center justify-center cursor-pointer text-slate-600 hover:text-indigo-300 opacity-0 group-hover:opacity-100 p-2"
                            title={`Assign subject for ${day} ${period.startTime}`}
                          >
                            <Plus className="w-4 h-4" />
                            <span className="text-[11px] font-medium ml-1">Add Class</span>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            {matchingSlots.map(slot => {
                              const sub = subjectMap.get(slot.subjectId);
                              const teacher = teacherMap.get(slot.teacherId);
                              const room = roomMap.get(slot.roomId);
                              const isClashing = conflictingSlotIds.has(slot.id);

                              return (
                                <div
                                  key={slot.id}
                                  className={`p-2 rounded-lg text-xs transition-all relative shadow-sm group/card ${
                                    isClashing
                                      ? 'bg-rose-950/70 border-2 border-rose-500 ring-2 ring-rose-500/30 text-rose-100 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse'
                                      : 'bg-slate-800/90 border border-slate-700/80 hover:border-indigo-500/60 hover:shadow-md'
                                  }`}
                                  style={{
                                    borderLeftWidth: '4px',
                                    borderLeftColor: sub?.color || '#3B82F6'
                                  }}
                                >
                                  {/* Clash Alert Badge */}
                                  {isClashing && (
                                    <button
                                      onClick={onOpenConflictDetails}
                                      className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full p-0.5 shadow-lg hover:bg-rose-500 cursor-pointer"
                                      title="Conflict detected! Click to inspect and resolve"
                                    >
                                      <AlertTriangle className="w-3.5 h-3.5" />
                                    </button>
                                  )}

                                  {/* Subject Code & Name */}
                                  <div className="font-bold text-slate-100 leading-tight">
                                    {sub?.code || 'Subject'}
                                  </div>
                                  <div className="text-[10px] text-slate-400 truncate" title={sub?.name}>
                                    {sub?.name || 'Subject Name'}
                                  </div>

                                  {/* Teacher & Room metadata */}
                                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-300 gap-1">
                                    <span className="truncate flex items-center gap-0.5 font-medium" title={teacher?.name}>
                                      <User className="w-2.5 h-2.5 text-slate-400" />
                                      {teacher?.name?.split(' ').slice(-1)[0] || 'Teacher'}
                                    </span>
                                    <span className="px-1.5 py-0.2 bg-slate-900/90 border border-slate-700/60 rounded text-slate-300 font-mono text-[9px]">
                                      {room?.code || 'Rm'}
                                    </span>
                                  </div>

                                  {/* Action buttons (hover) */}
                                  <div className="absolute top-1 right-1 hidden group-hover/card:flex items-center gap-0.5 bg-slate-900/90 rounded px-1 shadow-md border border-slate-700">
                                    <button
                                      onClick={() => onEditSlot(slot)}
                                      className="p-0.5 text-slate-400 hover:text-indigo-400 cursor-pointer"
                                      title="Edit slot"
                                    >
                                      <Edit2 className="w-2.5 h-2.5" />
                                    </button>
                                    <button
                                      onClick={() => onDeleteSlot(slot.id)}
                                      className="p-0.5 text-slate-400 hover:text-rose-400 cursor-pointer"
                                      title="Delete slot"
                                    >
                                      <Trash2 className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
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

      {/* Curriculum Contact Hours Compliance Tracker */}
      <div className="bg-[#0f172a]/80 backdrop-blur-md p-4 rounded-xl border border-slate-800 shadow-lg shadow-black/20">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-white text-sm">
              DepEd Curriculum Compliance for {activeSection?.name}
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Standard weekly required contact hours (DepEd MATATAG / SHS)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {requiredSubjects.map(sub => {
            const scheduled = subjectMinutesScheduled.get(sub.id) || 0;
            const required = sub.weeklyMinutesRequired;
            const pct = Math.min(100, Math.round((scheduled / required) * 100));
            const isFulfilled = scheduled >= required;

            return (
              <div 
                key={sub.id} 
                className={`p-2.5 rounded-lg border text-xs transition-all ${
                  isFulfilled 
                    ? 'bg-emerald-950/25 border-emerald-500/30' 
                    : 'bg-slate-900/70 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-slate-200">
                  <span className="truncate">{sub.code}</span>
                  {isFulfilled ? (
                    <span className="flex items-center gap-1 text-emerald-400 text-[10px]">
                      <CheckCircle2 className="w-3 h-3" /> Met
                    </span>
                  ) : (
                    <span className="text-amber-400 text-[10px]">
                      {scheduled}/{required}m
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {sub.name}
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      isFulfilled ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

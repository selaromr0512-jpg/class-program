import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Wrench, 
  Trash2, 
  Clock, 
  Calendar, 
  User, 
  DoorOpen, 
  BookOpen, 
  Info,
  Sliders,
  Check,
  RefreshCw,
  Zap,
  ArrowRight,
  ShieldCheck,
  Flame
} from 'lucide-react';
import { ScheduleConflict, ScheduleSlot, Teacher, Section, Room, SubjectItem, DayOfWeek, TimePeriod } from '../types';
import { TIME_PERIODS_DEFAULT, DAYS_OF_WEEK } from '../data/depedCurriculum';
import { isTimeOverlap } from '../utils/conflictDetector';

interface ConflictDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  conflicts: ScheduleConflict[];
  slots: ScheduleSlot[];
  teachers: Teacher[];
  sections: Section[];
  rooms: Room[];
  subjects: SubjectItem[];
  timePeriods?: TimePeriod[];
  onAutoResolveConflict: (conflict: ScheduleConflict) => void;
  onEditSlot: (slot: ScheduleSlot) => void;
  onDeleteSlot: (slotId: string) => void;
  onAutoResolveAll: () => void;
  onUpdateSlot?: (updatedSlot: ScheduleSlot) => void;
  onRunScan?: () => void;
}

export const ConflictDrawer: React.FC<ConflictDrawerProps> = ({
  isOpen,
  onClose,
  conflicts,
  slots,
  teachers,
  sections,
  rooms,
  subjects,
  timePeriods,
  onAutoResolveConflict,
  onEditSlot,
  onDeleteSlot,
  onAutoResolveAll,
  onUpdateSlot,
  onRunScan
}) => {
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'>('ALL');
  const [manualSolvingConflictId, setManualSolvingConflictId] = useState<string | null>(null);
  const [manualSlotAdjustments, setManualSlotAdjustments] = useState<{
    slotId: string;
    day: DayOfWeek;
    startTime: string;
    endTime: string;
    teacherId: string;
    roomId: string;
  } | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [aiResolvingId, setAiResolvingId] = useState<string | null>(null);
  const [aiBatchResolving, setAiBatchResolving] = useState(false);

  if (!isOpen) return null;

  const activePeriods = timePeriods && timePeriods.length > 0 ? timePeriods : TIME_PERIODS_DEFAULT;
  const teachingPeriods = activePeriods.filter(p => !p.isBreak);

  const filteredConflicts = conflicts.filter(c => {
    if (filter === 'ALL') return true;
    return c.severity === filter;
  });

  const criticalCount = conflicts.filter(c => c.severity === 'CRITICAL').length;
  const warningCount = conflicts.filter(c => c.severity === 'WARNING').length;
  const infoCount = conflicts.filter(c => c.severity === 'INFO').length;

  const teacherMap = new Map<string, Teacher>(teachers.map(t => [t.id, t]));
  const sectionMap = new Map<string, Section>(sections.map(s => [s.id, s]));
  const roomMap = new Map<string, Room>(rooms.map(r => [r.id, r]));
  const subjectMap = new Map<string, SubjectItem>(subjects.map(sub => [sub.id, sub]));

  // Trigger manual resolver state for a slot
  const handleOpenManualResolver = (confId: string, slot: ScheduleSlot) => {
    setManualSolvingConflictId(confId);
    setManualSlotAdjustments({
      slotId: slot.id,
      day: slot.day,
      startTime: slot.startTime,
      endTime: slot.endTime,
      teacherId: slot.teacherId,
      roomId: slot.roomId
    });
  };

  // Commit manual fix
  const handleApplyManualFix = (originalSlot: ScheduleSlot) => {
    if (!manualSlotAdjustments || !onUpdateSlot) return;

    const updated: ScheduleSlot = {
      ...originalSlot,
      day: manualSlotAdjustments.day,
      startTime: manualSlotAdjustments.startTime,
      endTime: manualSlotAdjustments.endTime,
      teacherId: manualSlotAdjustments.teacherId,
      roomId: manualSlotAdjustments.roomId
    };

    onUpdateSlot(updated);
    setManualSolvingConflictId(null);
    setManualSlotAdjustments(null);
  };

  // AI Single Resolver with feedback
  const handleAiSingleResolve = (conflict: ScheduleConflict) => {
    setAiResolvingId(conflict.id);
    setTimeout(() => {
      onAutoResolveConflict(conflict);
      setAiResolvingId(null);
    }, 400);
  };

  // AI Batch Auto-Fix
  const handleAiBatchFix = () => {
    setAiBatchResolving(true);
    setTimeout(() => {
      onAutoResolveAll();
      setAiBatchResolving(false);
    }, 600);
  };

  // Manual Scan trigger
  const handleTriggerScan = () => {
    setIsScanning(true);
    if (onRunScan) onRunScan();
    setTimeout(() => {
      setIsScanning(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0f172a] h-full shadow-2xl flex flex-col border-l border-slate-800 text-slate-100">
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h2 className="font-bold text-white text-lg flex items-center gap-2">
                Conflict Detection & Resolution Center
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                criticalCount > 0 
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                  : warningCount > 0
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {conflicts.length} Issue{conflicts.length === 1 ? '' : 's'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Detect schedule clashes and resolve them automatically with AI or customize adjustments manually.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-scan-conflicts-drawer"
              onClick={handleTriggerScan}
              disabled={isScanning}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
              title="Rescan timetable matrix for clashes"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning...' : 'Scan Matrix'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Toolbar & Resolution Modes Overview */}
        <div className="px-4 py-3 border-b border-slate-800 bg-[#0b1120] flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                filter === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
              }`}
            >
              All ({conflicts.length})
            </button>
            <button
              onClick={() => setFilter('CRITICAL')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                filter === 'CRITICAL'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 border border-rose-800/40'
              }`}
            >
              Clashes ({criticalCount})
            </button>
            <button
              onClick={() => setFilter('WARNING')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                filter === 'WARNING'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-amber-950/40 text-amber-300 hover:bg-amber-900/60 border border-amber-800/40'
              }`}
            >
              Workload ({warningCount})
            </button>
            <button
              onClick={() => setFilter('INFO')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                filter === 'INFO'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-indigo-950/40 text-indigo-300 hover:bg-indigo-900/60 border border-indigo-800/40'
              }`}
            >
              Curriculum ({infoCount})
            </button>
          </div>

          {criticalCount > 0 && (
            <button
              id="btn-ai-autofix-all"
              onClick={handleAiBatchFix}
              disabled={aiBatchResolving}
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-3 py-1.5 rounded-lg shadow-md transition-all cursor-pointer active:scale-95"
            >
              <Sparkles className={`w-3.5 h-3.5 ${aiBatchResolving ? 'animate-spin' : ''}`} />
              <span>{aiBatchResolving ? 'AI Optimizing Schedule...' : 'AI Auto-Fix All Clashes'}</span>
            </button>
          )}
        </div>

        {/* Conflicts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filteredConflicts.length === 0 ? (
            <div className="py-20 text-center text-slate-400 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <p className="font-bold text-slate-100 text-base">All Schedule Entries Conflict-Free!</p>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                No double-booked faculty, overlapping classrooms, or section collisions detected. All DepEd curriculum hours match official requirements.
              </p>
            </div>
          ) : (
            filteredConflicts.map((conf) => {
              const isCritical = conf.severity === 'CRITICAL';
              const isWarning = conf.severity === 'WARNING';
              const isManualOpen = manualSolvingConflictId === conf.id;

              // Retrieve affected slots
              const affectedSlotsList = slots.filter(s => conf.affectedSlotIds?.includes(s.id));
              const slotToAdjust = affectedSlotsList[1] || affectedSlotsList[0];

              return (
                <div
                  key={conf.id}
                  className={`p-4 rounded-xl border transition-all text-xs ${
                    isCritical
                      ? 'bg-rose-950/20 border-rose-500/40 shadow-md shadow-rose-950/20'
                      : isWarning
                      ? 'bg-amber-950/20 border-amber-500/40'
                      : 'bg-indigo-950/20 border-indigo-500/40'
                  }`}
                >
                  {/* Top Bar: Conflict Type & Severity */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase tracking-wider ${
                        isCritical
                          ? 'bg-rose-600 text-white'
                          : isWarning
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-indigo-600 text-white'
                      }`}>
                        {conf.type.replace(/_/g, ' ')}
                      </span>
                      <h3 className="font-bold text-white text-sm">
                        {conf.title}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-slate-300 mt-2 leading-relaxed">
                    {conf.description}
                  </p>

                  {/* Context Metadata Badges */}
                  <div className="flex items-center gap-2 flex-wrap mt-3 text-[11px] text-slate-300">
                    {conf.day && (
                      <span className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-700 font-medium">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {conf.day}
                      </span>
                    )}
                    {conf.timeRange && (
                      <span className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-700 font-mono font-medium">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {conf.timeRange}
                      </span>
                    )}
                    {conf.teacherId && (
                      <span className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                        <User className="w-3 h-3 text-slate-400" />
                        {teacherMap.get(conf.teacherId)?.name}
                      </span>
                    )}
                    {conf.roomId && (
                      <span className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                        <DoorOpen className="w-3 h-3 text-slate-400" />
                        {roomMap.get(conf.roomId)?.name}
                      </span>
                    )}
                  </div>

                  {/* Affected Entries Box */}
                  {affectedSlotsList.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Conflicting Schedule Entries:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {affectedSlotsList.map((slot, idx) => {
                          const sub = subjectMap.get(slot.subjectId);
                          const sec = sectionMap.get(slot.sectionId);
                          const rm = roomMap.get(slot.roomId);
                          const t = teacherMap.get(slot.teacherId);

                          return (
                            <div
                              key={slot.id}
                              className={`p-2.5 rounded-lg border flex flex-col justify-between ${
                                idx === 1 
                                  ? 'bg-slate-900/90 border-indigo-500/40 ring-1 ring-indigo-500/30' 
                                  : 'bg-slate-900/60 border-slate-800'
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between font-bold text-slate-100">
                                  <span className="truncate">{sub?.code || 'Subject'}</span>
                                  <span className="text-[10px] font-mono text-slate-300 font-normal">
                                    {slot.startTime}-{slot.endTime}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-300 font-medium truncate">{sec?.name}</p>
                                <p className="text-[10px] text-slate-400 truncate">
                                  {t?.name} • {rm?.name}
                                </p>
                              </div>

                              <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800">
                                <span className="text-[9px] text-slate-500 font-mono">
                                  {idx === 0 ? 'Primary Slot' : 'Clashing Slot'}
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => onEditSlot(slot)}
                                    className="p-1 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded cursor-pointer"
                                    title="Edit Full Details in Slot Modal"
                                  >
                                    <Wrench className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => onDeleteSlot(slot.id)}
                                    className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 rounded cursor-pointer"
                                    title="Remove Duplicate Slot"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Dual Resolution Controls: Automatically with AI OR Done Manually */}
                  {isCritical && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
                          <span>Choose Resolution Strategy:</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Option A: Solve with AI */}
                          <button
                            id={`btn-ai-resolve-${conf.id}`}
                            onClick={() => handleAiSingleResolve(conf)}
                            disabled={aiResolvingId === conf.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
                            title="Automatically calculate conflict-free period, faculty or room replacement using AI"
                          >
                            <Sparkles className={`w-3.5 h-3.5 ${aiResolvingId === conf.id ? 'animate-spin' : ''}`} />
                            <span>{aiResolvingId === conf.id ? 'Resolving...' : 'Solve with AI'}</span>
                          </button>

                          {/* Option B: Solve Manually Toggle */}
                          <button
                            id={`btn-manual-resolve-${conf.id}`}
                            onClick={() => {
                              if (isManualOpen) {
                                setManualSolvingConflictId(null);
                                setManualSlotAdjustments(null);
                              } else if (slotToAdjust) {
                                handleOpenManualResolver(conf.id, slotToAdjust);
                              }
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs border transition-all cursor-pointer ${
                              isManualOpen
                                ? 'bg-amber-600 text-white border-amber-500'
                                : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
                            }`}
                            title="Open interactive manual clash-free period and faculty selector"
                          >
                            <Sliders className="w-3.5 h-3.5 text-amber-400" />
                            <span>{isManualOpen ? 'Close Manual' : 'Solve Manually'}</span>
                          </button>
                        </div>
                      </div>

                      {/* AI Recommendation Explanation Card */}
                      {conf.suggestedFix && !isManualOpen && (
                        <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-2 text-slate-300">
                          <Zap className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-indigo-300">AI Recommendation: </span>
                            <span className="text-slate-300">{conf.suggestedFix}</span>
                          </div>
                        </div>
                      )}

                      {/* Interactive Manual Adjustment Panel */}
                      {isManualOpen && manualSlotAdjustments && slotToAdjust && (
                        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/40 space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <span className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                              <Sliders className="w-3.5 h-3.5" />
                              Manual Adjustment Studio for {subjectMap.get(slotToAdjust.subjectId)?.code}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {sectionMap.get(slotToAdjust.sectionId)?.name}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {/* Day Selector */}
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                                Day of Week
                              </label>
                              <select
                                value={manualSlotAdjustments.day}
                                onChange={(e) => setManualSlotAdjustments(prev => prev ? ({ ...prev, day: e.target.value as DayOfWeek }) : null)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-100 cursor-pointer"
                              >
                                {DAYS_OF_WEEK.map(d => (
                                  <option key={d} value={d}>{d}</option>
                                ))}
                              </select>
                            </div>

                            {/* Time Period Selector */}
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                                Time Period
                              </label>
                              <select
                                value={`${manualSlotAdjustments.startTime}-${manualSlotAdjustments.endTime}`}
                                onChange={(e) => {
                                  const [start, end] = e.target.value.split('-');
                                  setManualSlotAdjustments(prev => prev ? ({ ...prev, startTime: start, endTime: end }) : null);
                                }}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold font-mono text-slate-100 cursor-pointer"
                              >
                                {teachingPeriods.map(p => (
                                  <option key={p.id} value={`${p.startTime}-${p.endTime}`}>
                                    {p.label} ({p.startTime} - {p.endTime})
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Teacher Reassign */}
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                                Reassign Teacher
                              </label>
                              <select
                                value={manualSlotAdjustments.teacherId}
                                onChange={(e) => setManualSlotAdjustments(prev => prev ? ({ ...prev, teacherId: e.target.value }) : null)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 cursor-pointer"
                              >
                                {teachers.map(t => (
                                  <option key={t.id} value={t.id}>
                                    {t.name} ({t.title})
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Room Reassign */}
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                                Reassign Room / Lab
                              </label>
                              <select
                                value={manualSlotAdjustments.roomId}
                                onChange={(e) => setManualSlotAdjustments(prev => prev ? ({ ...prev, roomId: e.target.value }) : null)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 cursor-pointer"
                              >
                                {rooms.map(r => (
                                  <option key={r.id} value={r.id}>
                                    {r.name} ({r.code} • {r.type})
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Action Buttons inside Manual Panel */}
                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                            <button
                              onClick={() => {
                                setManualSolvingConflictId(null);
                                setManualSlotAdjustments(null);
                              }}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleApplyManualFix(slotToAdjust)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold shadow transition-all cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Apply Manual Fix</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>DepEd Real-Time Validation & AI Heuristics Engine</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold cursor-pointer border border-slate-700"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};


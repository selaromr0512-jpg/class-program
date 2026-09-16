import React, { useState, useEffect } from 'react';
import { 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  User, 
  DoorOpen, 
  BookOpen, 
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { ScheduleSlot, Section, Teacher, Room, SubjectItem, DayOfWeek, TimePeriod } from '../types';
import { TIME_PERIODS_DEFAULT, DAYS_OF_WEEK } from '../data/depedCurriculum';
import { isTimeOverlap, timeToMinutes } from '../utils/conflictDetector';

interface SlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (slotData: Omit<ScheduleSlot, 'id'>, existingSlotId?: string) => void;
  editingSlot: ScheduleSlot | null;
  defaultValues?: Partial<ScheduleSlot>;
  sections: Section[];
  teachers: Teacher[];
  rooms: Room[];
  subjects: SubjectItem[];
  timePeriods?: TimePeriod[];
  allSlots: ScheduleSlot[];
  activeTerm: string;
}

export const SlotModal: React.FC<SlotModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingSlot,
  defaultValues,
  sections,
  teachers,
  rooms,
  subjects,
  timePeriods,
  allSlots,
  activeTerm
}) => {
  const activePeriods = timePeriods && timePeriods.length > 0 ? timePeriods : TIME_PERIODS_DEFAULT;
  const [sectionId, setSectionId] = useState<string>('');
  const [subjectId, setSubjectId] = useState<string>('');
  const [teacherId, setTeacherId] = useState<string>('');
  const [roomId, setRoomId] = useState<string>('');
  const [day, setDay] = useState<DayOfWeek>('Monday');
  const [startTime, setStartTime] = useState<string>('07:30');
  const [endTime, setEndTime] = useState<string>('08:30');
  const [periodPreset, setPeriodPreset] = useState<string>('p1');

  // Initialize form state
  useEffect(() => {
    if (editingSlot) {
      setSectionId(editingSlot.sectionId);
      setSubjectId(editingSlot.subjectId);
      setTeacherId(editingSlot.teacherId);
      setRoomId(editingSlot.roomId);
      setDay(editingSlot.day);
      setStartTime(editingSlot.startTime);
      setEndTime(editingSlot.endTime);
    } else {
      const initSecId = defaultValues?.sectionId || sections[0]?.id || '';
      setSectionId(initSecId);
      setDay(defaultValues?.day || 'Monday');
      setStartTime(defaultValues?.startTime || '07:30');
      setEndTime(defaultValues?.endTime || '08:30');
      
      const firstSub = subjects.find(s => s.gradeLevels.includes(sections[0]?.gradeLevel)) || subjects[0];
      setSubjectId(firstSub?.id || '');
      setTeacherId(teachers[0]?.id || '');
      setRoomId(rooms[0]?.id || '');
    }
  }, [editingSlot, defaultValues, isOpen]);

  // When Section changes, update subject list and suggested room/adviser
  const selectedSection = sections.find(s => s.id === sectionId);
  const relevantSubjects = subjects.filter(sub => {
    if (!selectedSection) return true;
    const gradeMatches = sub.gradeLevels.includes(selectedSection.gradeLevel);
    const strandMatches = !sub.strand || sub.strand === selectedSection.strand;
    return gradeMatches && strandMatches;
  });

  // Auto-suggest teacher and room when subject is picked
  const handleSubjectChange = (newSubjectId: string) => {
    setSubjectId(newSubjectId);
    const sub = subjects.find(s => s.id === newSubjectId);
    if (sub) {
      // Find matching teacher
      const matchingTeacher = teachers.find(t => t.specializations.includes(sub.code));
      if (matchingTeacher) {
        setTeacherId(matchingTeacher.id);
      }
      // Find matching room
      if (sub.preferredRoomType && sub.preferredRoomType !== 'Lecture') {
        const matchingRoom = rooms.find(r => r.type === sub.preferredRoomType);
        if (matchingRoom) setRoomId(matchingRoom.id);
      } else if (selectedSection?.roomDefaultId) {
        setRoomId(selectedSection.roomDefaultId);
      }
    }
  };

  const handlePeriodPresetChange = (presetId: string) => {
    setPeriodPreset(presetId);
    const found = activePeriods.find(p => p.id === presetId);
    if (found) {
      setStartTime(found.startTime);
      setEndTime(found.endTime);
    }
  };

  // --- Real-time conflict preview checker ---
  const currentSlotId = editingSlot?.id;
  const otherSlots = allSlots.filter(s => s.id !== currentSlotId && (!s.term || s.term === activeTerm) && !s.isBreak);

  const potentialConflicts: string[] = [];

  // 1. Check teacher collision
  const teacherClash = otherSlots.find(s => {
    if (s.day !== day || s.teacherId !== teacherId) return false;
    return isTimeOverlap(s.startTime, s.endTime, startTime, endTime);
  });
  if (teacherClash) {
    const t = teachers.find(x => x.id === teacherId);
    const clashingSec = sections.find(x => x.id === teacherClash.sectionId);
    potentialConflicts.push(`Teacher Collision: ${t?.name} is already teaching ${clashingSec?.name} from ${teacherClash.startTime} to ${teacherClash.endTime}.`);
  }

  // 2. Check room collision
  const roomClash = otherSlots.find(s => {
    if (s.day !== day || s.roomId !== roomId) return false;
    return isTimeOverlap(s.startTime, s.endTime, startTime, endTime);
  });
  if (roomClash) {
    const r = rooms.find(x => x.id === roomId);
    const clashingSec = sections.find(x => x.id === roomClash.sectionId);
    potentialConflicts.push(`Room Collision: ${r?.name} is already booked for ${clashingSec?.name} from ${roomClash.startTime} to ${roomClash.endTime}.`);
  }

  // 3. Check section double booking
  const sectionClash = otherSlots.find(s => {
    if (s.day !== day || s.sectionId !== sectionId) return false;
    return isTimeOverlap(s.startTime, s.endTime, startTime, endTime);
  });
  if (sectionClash) {
    const sub = subjects.find(x => x.id === sectionClash.subjectId);
    potentialConflicts.push(`Section Collision: ${selectedSection?.name} already has ${sub?.name || 'Class'} scheduled at this time.`);
  }

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionId || !subjectId || !teacherId || !roomId) {
      alert('Please fill in all required fields.');
      return;
    }

    onSave(
      {
        sectionId,
        subjectId,
        teacherId,
        roomId,
        day,
        startTime,
        endTime,
        term: activeTerm
      },
      editingSlot?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#0f172a] rounded-2xl max-w-xl w-full shadow-2xl border border-slate-800 overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.3)] text-white">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base sm:text-lg">
                {editingSlot ? 'Edit Class Schedule Slot' : 'Assign Class Schedule Slot'}
              </h2>
              <p className="text-xs text-slate-400">
                Configure subject, faculty, room, and time allotment.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">

          {/* Section Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
              Target Class Section *
            </label>
            <select
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-slate-100 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              required
            >
              {sections.map(sec => (
                <option key={sec.id} value={sec.id} className="bg-slate-900 text-slate-100">
                  {sec.name} ({sec.gradeLevel} {sec.strand ? `• ${sec.strand}` : ''} • {sec.shift})
                </option>
              ))}
            </select>
          </div>

          {/* Subject Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              Subject (DepEd MATATAG / SHS / Trimester) *
            </label>
            <select
              value={subjectId}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-slate-100 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              required
            >
              <optgroup label="Curriculum Recommended for this Grade" className="bg-slate-900 text-slate-300">
                {relevantSubjects.map(sub => (
                  <option key={sub.id} value={sub.id} className="bg-slate-900 text-slate-100">
                    {sub.code} - {sub.name} ({sub.weeklyMinutesRequired} mins/wk req)
                  </option>
                ))}
              </optgroup>
              <optgroup label="Other DepEd Subjects" className="bg-slate-900 text-slate-400">
                {subjects
                  .filter(s => !relevantSubjects.some(rs => rs.id === s.id))
                  .map(sub => (
                    <option key={sub.id} value={sub.id} className="bg-slate-900 text-slate-100">
                      {sub.code} - {sub.name}
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>

          {/* Teacher and Room 2-Column */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Teacher */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Assigned Teacher *
              </label>
              <select
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-100 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                required
              >
                {teachers.map(t => (
                  <option key={t.id} value={t.id} className="bg-slate-900 text-slate-100">
                    {t.name} ({t.title})
                  </option>
                ))}
              </select>
            </div>

            {/* Room */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <DoorOpen className="w-3.5 h-3.5 text-slate-400" />
                Room / Laboratory *
              </label>
              <select
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-100 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                required
              >
                {rooms.map(r => (
                  <option key={r.id} value={r.id} className="bg-slate-900 text-slate-100">
                    {r.name} ({r.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Day & Period Quick Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Day */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Day of the Week *
              </label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value as DayOfWeek)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-100 cursor-pointer"
              >
                {DAYS_OF_WEEK.map(d => (
                  <option key={d} value={d} className="bg-slate-900 text-slate-100">{d}</option>
                ))}
              </select>
            </div>

            {/* Standard Period Preset */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Standard Period Preset
              </label>
              <select
                value={periodPreset}
                onChange={(e) => handlePeriodPresetChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 cursor-pointer"
              >
                {activePeriods.filter(p => !p.isBreak).map(p => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-slate-100">
                    {p.label} ({p.startTime} - {p.endTime})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom Start & End Time */}
          <div className="grid grid-cols-2 gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Start Time (24H)
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs font-mono text-slate-100"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                End Time (24H)
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs font-mono text-slate-100"
                required
              />
            </div>
          </div>

          {/* Live Conflict Warning Box */}
          {potentialConflicts.length > 0 ? (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs space-y-1 animate-pulse">
              <div className="flex items-center gap-1.5 font-bold text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Scheduling Collision Detected:</span>
              </div>
              {potentialConflicts.map((msg, i) => (
                <p key={i} className="text-[11px] text-rose-300 pl-5">
                  • {msg}
                </p>
              ))}
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Slot is completely conflict-free. Ready to save!</span>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{editingSlot ? 'Save Changes' : 'Confirm Slot'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

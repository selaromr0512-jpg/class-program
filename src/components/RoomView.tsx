import React, { useState } from 'react';
import { 
  Building2, 
  DoorOpen, 
  AlertTriangle, 
  FlaskConical, 
  Monitor, 
  Dumbbell, 
  Tv, 
  CheckCircle2, 
  Users 
} from 'lucide-react';
import { Room, ScheduleSlot, Section, Teacher, SubjectItem, ScheduleConflict } from '../types';
import { TIME_PERIODS_DEFAULT, DAYS_OF_WEEK } from '../data/depedCurriculum';
import { isTimeOverlap, timeToMinutes } from '../utils/conflictDetector';

interface RoomViewProps {
  rooms: Room[];
  slots: ScheduleSlot[];
  sections: Section[];
  teachers: Teacher[];
  subjects: SubjectItem[];
  conflicts: ScheduleConflict[];
  activeTerm: string;
}

export const RoomView: React.FC<RoomViewProps> = ({
  rooms,
  slots,
  sections,
  teachers,
  subjects,
  conflicts,
  activeTerm
}) => {
  const [selectedRoomId, setSelectedRoomId] = useState<string>(rooms[0]?.id || '');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const filteredRooms = rooms.filter(r => {
    if (typeFilter === 'ALL') return true;
    return r.type === typeFilter;
  });

  const activeRoom = rooms.find(r => r.id === selectedRoomId) || filteredRooms[0] || rooms[0];

  const teacherMap = new Map<string, Teacher>(teachers.map(t => [t.id, t]));
  const sectionMap = new Map<string, Section>(sections.map(s => [s.id, s]));
  const subjectMap = new Map<string, SubjectItem>(subjects.map(sub => [sub.id, sub]));

  // Slots in this room
  const roomSlots = slots.filter(
    s => s.roomId === activeRoom?.id && (!s.term || s.term === activeTerm) && !s.isBreak
  );

  const roomConflicts = conflicts.filter(c => c.roomId === activeRoom?.id);
  const conflictingSlotIds = new Set<string>();
  roomConflicts.forEach(c => c.affectedSlotIds?.forEach(id => conflictingSlotIds.add(id)));

  // Calculate room occupancy rate (out of 40 available teaching periods in a week)
  const totalPossiblePeriods = 40;
  const occupiedPeriods = roomSlots.length;
  const occupancyPct = Math.min(100, Math.round((occupiedPeriods / totalPossiblePeriods) * 100));

  const getRoomIcon = (type: Room['type']) => {
    switch (type) {
      case 'ScienceLab': return <FlaskConical className="w-4 h-4 text-purple-400" />;
      case 'ComputerLab': return <Monitor className="w-4 h-4 text-blue-400" />;
      case 'Gym': return <Dumbbell className="w-4 h-4 text-orange-400" />;
      case 'AudioVisual': return <Tv className="w-4 h-4 text-emerald-400" />;
      default: return <DoorOpen className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="bg-[#0f172a]/80 backdrop-blur-md p-4 rounded-xl border border-slate-800 shadow-lg shadow-black/20 flex flex-wrap items-center justify-between gap-4">
        
        {/* Room Type Buttons */}
        <div className="flex items-center bg-slate-900/90 p-0.5 rounded-lg border border-slate-800 text-xs flex-wrap">
          <button
            onClick={() => setTypeFilter('ALL')}
            className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              typeFilter === 'ALL' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Facilities ({rooms.length})
          </button>
          <button
            onClick={() => setTypeFilter('Lecture')}
            className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              typeFilter === 'Lecture' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Lecture Rooms
          </button>
          <button
            onClick={() => setTypeFilter('ScienceLab')}
            className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              typeFilter === 'ScienceLab' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Science Labs
          </button>
          <button
            onClick={() => setTypeFilter('ComputerLab')}
            className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              typeFilter === 'ComputerLab' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Computer Labs
          </button>
          <button
            onClick={() => setTypeFilter('Gym')}
            className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              typeFilter === 'Gym' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Gym / Court
          </button>
        </div>

        {/* Room Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Select Room:
          </label>
          <select
            value={activeRoom?.id}
            onChange={(e) => setSelectedRoomId(e.target.value)}
            className="bg-slate-900 border border-slate-700 font-bold text-slate-100 text-sm rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {filteredRooms.map(rm => (
              <option key={rm.id} value={rm.id}>
                {rm.name} ({rm.type} • Cap: {rm.capacity})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Room Details & Occupancy Overview Card */}
      {activeRoom && (
        <div className="bg-[#0f172a]/80 backdrop-blur-md p-4 rounded-xl border border-slate-800 shadow-lg shadow-black/20 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
              {getRoomIcon(activeRoom.type)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">{activeRoom.name}</h3>
                <span className="bg-indigo-500/10 text-indigo-300 text-xs px-2.5 py-0.5 rounded font-semibold border border-indigo-500/20">
                  {activeRoom.type}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeRoom.building} • Max Capacity: {activeRoom.capacity} students
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-center min-w-[100px]">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Occupancy</div>
              <div className="text-base font-bold text-slate-100">
                {occupancyPct}%
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-center min-w-[100px]">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Classes / Wk</div>
              <div className="text-base font-bold text-slate-100">
                {roomSlots.length}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-center min-w-[100px]">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Clashes</div>
              <div className={`text-base font-bold ${roomConflicts.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {roomConflicts.length}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Room Weekly Grid */}
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
                    const matchingSlots = roomSlots.filter(s => {
                      if (s.day !== day) return false;
                      return isTimeOverlap(s.startTime, s.endTime, period.startTime, period.endTime);
                    });

                    return (
                      <td key={day} className="p-1.5 border-r border-slate-800/60 last:border-r-0 align-top h-16 min-w-[120px]">
                        {matchingSlots.length === 0 ? (
                          <div className="h-full flex items-center justify-center text-[10px] text-slate-600 font-mono">
                            [Available Room]
                          </div>
                        ) : (
                          matchingSlots.map(slot => {
                            const sub = subjectMap.get(slot.subjectId);
                            const sec = sectionMap.get(slot.sectionId);
                            const t = teacherMap.get(slot.teacherId);
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
                                  {sec?.name || 'Section'}
                                </div>
                                <div className="text-[10px] text-slate-300 font-medium truncate">
                                  {sub?.code} - {t?.name?.split(' ').slice(-1)[0]}
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
  );
};

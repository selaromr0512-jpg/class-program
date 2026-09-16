import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Building, 
  CheckCircle2, 
  FileText 
} from 'lucide-react';
import { SchoolProfile, Teacher, Section, Room, SubjectItem, ScheduleSlot, TimePeriod } from '../types';
import { computeTeacherWeeklySummary } from '../utils/exporter';
import { TIME_PERIODS_DEFAULT, DAYS_OF_WEEK } from '../data/depedCurriculum';
import { isTimeOverlap, timeToMinutes } from '../utils/conflictDetector';

interface DepEdSF7ModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: SchoolProfile;
  teachers: Teacher[];
  sections: Section[];
  rooms: Room[];
  subjects: SubjectItem[];
  slots: ScheduleSlot[];
  activeTerm: string;
  timePeriods?: TimePeriod[];
}

export const DepEdSF7Modal: React.FC<DepEdSF7ModalProps> = ({
  isOpen,
  onClose,
  profile,
  teachers,
  sections,
  rooms,
  subjects,
  slots,
  activeTerm,
  timePeriods
}) => {
  const [reportType, setReportType] = useState<'SF7_PERSONNEL' | 'SECTION_PROGRAM'>('SF7_PERSONNEL');
  const [selectedSectionId, setSelectedSectionId] = useState<string>(sections[0]?.id || '');

  if (!isOpen) return null;

  const activePeriods = timePeriods && timePeriods.length > 0 ? timePeriods : TIME_PERIODS_DEFAULT;

  const teacherMap = new Map<string, Teacher>(teachers.map(t => [t.id, t]));
  const sectionMap = new Map<string, Section>(sections.map(s => [s.id, s]));
  const roomMap = new Map<string, Room>(rooms.map(r => [r.id, r]));
  const subjectMap = new Map<string, SubjectItem>(subjects.map(s => [s.id, s]));

  const activeSection = sections.find(s => s.id === selectedSectionId) || sections[0];
  const sectionSlots = slots.filter(
    s => s.sectionId === activeSection?.id && (!s.term || s.term === activeTerm)
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#0f172a] rounded-2xl max-w-5xl w-full shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[90vh] text-slate-100">
        
        {/* Modal Controls Top Bar (Hidden during print) */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-600 text-white shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base">
                DepEd School Form 7 & Class Program Exporter
              </h2>
              <p className="text-xs text-slate-400">
                Official Department of Education standard school personnel and class program format.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Format toggle */}
            <div className="flex items-center bg-slate-950 border border-slate-800 p-0.5 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setReportType('SF7_PERSONNEL')}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  reportType === 'SF7_PERSONNEL' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                DepEd SF7 (Faculty Profile)
              </button>
              <button
                onClick={() => setReportType('SECTION_PROGRAM')}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  reportType === 'SECTION_PROGRAM' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Section Class Program
              </button>
            </div>

            {reportType === 'SECTION_PROGRAM' && (
              <select
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-100 cursor-pointer"
              >
                {sections.map(sec => (
                  <option key={sec.id} value={sec.id}>
                    {sec.name} ({sec.gradeLevel})
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet Container */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950/80 print:p-0 print:overflow-visible print:bg-white">
          <div className="max-w-4xl mx-auto bg-white border border-slate-300 print:border-none p-8 rounded-lg shadow-xl print:shadow-none font-serif text-slate-900">
            
            {/* DepEd Letterhead */}
            <div className="text-center space-y-0.5 border-b-2 border-slate-900 pb-4 mb-5">
              <div className="text-[11px] uppercase tracking-widest text-slate-600">
                Republic of the Philippines • Republika ng Pilipinas
              </div>
              <div className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Department of Education
              </div>
              <div className="text-xs text-slate-700 font-sans">
                {profile.region} • {profile.division}
              </div>
              <div className="text-lg font-extrabold uppercase tracking-wide text-slate-900 font-sans pt-1">
                {profile.schoolName}
              </div>
              <div className="text-[11px] font-sans text-slate-600">
                School ID: <span className="font-bold text-slate-900">{profile.schoolId}</span> • School Year: <span className="font-bold text-slate-900">{profile.schoolYear}</span> • Term: <span className="font-bold text-slate-900">{activeTerm}</span>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center mb-6">
              <h3 className="text-base font-bold uppercase tracking-wider font-sans underline decoration-2 underline-offset-4">
                {reportType === 'SF7_PERSONNEL' 
                  ? 'SCHOOL FORM 7 (SF7) - SCHOOL PERSONNEL ASSIGNMENT LIST AND BASIC PROFILE'
                  : `OFFICIAL CLASS PROGRAM • ${activeSection?.name?.toUpperCase()} (${activeSection?.gradeLevel})`
                }
              </h3>
              <p className="text-[11px] text-slate-500 font-sans mt-1">
                DepEd MATATAG / Senior High School Compliant Curriculum Schedule
              </p>
            </div>

            {/* Content: SF7 Personnel Table */}
            {reportType === 'SF7_PERSONNEL' ? (
              <div className="space-y-6">
                <table className="w-full border-collapse border border-slate-900 text-left font-sans text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-900 font-bold text-[11px] text-slate-800 text-center">
                      <th className="border border-slate-900 p-2 w-28">Employee No.</th>
                      <th className="border border-slate-900 p-2">Name of Personnel</th>
                      <th className="border border-slate-900 p-2">Position / Title</th>
                      <th className="border border-slate-900 p-2">Advisory Section</th>
                      <th className="border border-slate-900 p-2">Assigned Subject Loads</th>
                      <th className="border border-slate-900 p-2 text-center w-24">Weekly Teaching Mins</th>
                      <th className="border border-slate-900 p-2 text-center w-20">Prep / Duty (Hrs)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {teachers.map(teacher => {
                      const summary = computeTeacherWeeklySummary(teacher, slots, activeTerm);
                      const tSlots = slots.filter(s => s.teacherId === teacher.id && (!s.term || s.term === activeTerm) && !s.isBreak);
                      
                      // Unique subjects taught
                      const subjectsTaughtCodes = Array.from(new Set(tSlots.map(s => subjectMap.get(s.subjectId)?.code).filter(Boolean)));

                      return (
                        <tr key={teacher.id} className="text-[11px]">
                          <td className="border border-slate-900 p-2 font-mono text-center">
                            {teacher.employeeId}
                          </td>
                          <td className="border border-slate-900 p-2 font-bold">
                            {teacher.name}
                          </td>
                          <td className="border border-slate-900 p-2 text-slate-700">
                            {teacher.title}
                          </td>
                          <td className="border border-slate-900 p-2 text-slate-700">
                            {sectionMap.get(teacher.advisorySectionId || '')?.name || 'None'}
                          </td>
                          <td className="border border-slate-900 p-2">
                            <div className="flex flex-wrap gap-1">
                              {subjectsTaughtCodes.map(code => (
                                <span key={code} className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-slate-300">
                                  {code}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="border border-slate-900 p-2 text-center font-bold font-mono">
                            {summary.totalMinutes}m ({summary.totalHours}h)
                          </td>
                          <td className="border border-slate-900 p-2 text-center font-mono">
                            {summary.totalDutyHours}h
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* DepEd Note */}
                <p className="text-[10px] text-slate-500 font-sans italic">
                  Note: Computed in accordance with Republic Act 4670 (Magna Carta for Public School Teachers) maximum of 6 hours (360 mins) daily actual classroom teaching.
                </p>
              </div>
            ) : (
              // Content: Section Class Program
              <div className="space-y-6">
                {/* Section Meta Bar */}
                <div className="grid grid-cols-3 gap-2 font-sans text-xs bg-slate-50 p-3 rounded border border-slate-300">
                  <div>
                    <span className="font-bold">Grade & Section: </span>
                    <span>{activeSection?.name} ({activeSection?.gradeLevel})</span>
                  </div>
                  <div>
                    <span className="font-bold">Class Adviser: </span>
                    <span>{teacherMap.get(activeSection?.adviserTeacherId || '')?.name || 'Unassigned'}</span>
                  </div>
                  <div>
                    <span className="font-bold">Home Room: </span>
                    <span>{roomMap.get(activeSection?.roomDefaultId || '')?.name || 'Room 101'}</span>
                  </div>
                </div>

                {/* Class Program Timetable */}
                <table className="w-full border-collapse border border-slate-900 text-left font-sans text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-900 font-bold text-[11px] text-slate-800 text-center">
                      <th className="border border-slate-900 p-2 w-28">Time Period</th>
                      {DAYS_OF_WEEK.map(d => (
                        <th key={d} className="border border-slate-900 p-2">{d}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activePeriods.map(period => {
                      if (period.isBreak) {
                        return (
                          <tr key={period.id} className="bg-slate-100 font-medium text-center text-[10px] text-slate-600">
                            <td className="border border-slate-900 p-1.5 font-mono">{period.startTime}-{period.endTime}</td>
                            <td colSpan={5} className="border border-slate-900 p-1.5 uppercase font-bold tracking-wider">
                              {period.label}
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <tr key={period.id} className="text-[11px]">
                          <td className="border border-slate-900 p-1.5 font-mono text-center bg-slate-50 font-medium">
                            {period.startTime}-{period.endTime}
                          </td>
                          {DAYS_OF_WEEK.map(day => {
                            const matching = sectionSlots.filter(s =>
                              s.day === day && isTimeOverlap(s.startTime, s.endTime, period.startTime, period.endTime)
                            );

                            return (
                              <td key={day} className="border border-slate-900 p-1.5 align-top">
                                {matching.map(slot => {
                                  const sub = subjectMap.get(slot.subjectId);
                                  const t = teacherMap.get(slot.teacherId);
                                  const rm = roomMap.get(slot.roomId);

                                  return (
                                    <div key={slot.id}>
                                      <div className="font-bold text-slate-900">{sub?.code || 'Sub'}</div>
                                      <div className="text-[9px] text-slate-600">{t?.name?.split(' ').slice(-1)[0]} • {rm?.code}</div>
                                    </div>
                                  );
                                })}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Official Signatures Footer */}
            <div className="grid grid-cols-2 gap-12 pt-16 font-sans text-xs text-center mt-8">
              <div>
                <div className="border-b border-slate-900 pb-1 font-bold uppercase text-slate-900">
                  {profile.principalName}
                </div>
                <div className="text-[11px] text-slate-600 mt-1">
                  School Head / Secondary School Principal
                </div>
                <div className="text-[10px] text-slate-400">Date: ________________________</div>
              </div>

              <div>
                <div className="border-b border-slate-900 pb-1 font-bold uppercase text-slate-900">
                  PUBLIC SCHOOLS DISTRICT SUPERVISOR
                </div>
                <div className="text-[11px] text-slate-600 mt-1">
                  Approved / Certified Correct
                </div>
                <div className="text-[10px] text-slate-400">Date: ________________________</div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

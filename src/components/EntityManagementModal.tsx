import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Users, 
  GraduationCap, 
  Building2, 
  BookOpen,
  Clock,
  Edit2, 
  Trash2, 
  Check, 
  Search,
  RotateCcw,
  Sparkles,
  Calendar,
  Layers,
  AlertCircle
} from 'lucide-react';
import { 
  Teacher, 
  Section, 
  Room, 
  SubjectItem, 
  TimePeriod, 
  GradeLevel, 
  EducationLevel, 
  SHSStrand 
} from '../types';
import { TIME_PERIODS_DEFAULT } from '../data/depedCurriculum';
import { timeToMinutes } from '../utils/conflictDetector';

export type EntityTab = 'TEACHERS' | 'SUBJECTS' | 'TIME' | 'SECTIONS' | 'ROOMS';

interface EntityManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: EntityTab;
  teachers: Teacher[];
  sections: Section[];
  rooms: Room[];
  subjects: SubjectItem[];
  timePeriods: TimePeriod[];
  onAddTeacher: (teacher: Teacher) => void;
  onUpdateTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (id: string) => void;
  onAddSection: (section: Section) => void;
  onUpdateSection: (section: Section) => void;
  onDeleteSection: (id: string) => void;
  onAddRoom: (room: Room) => void;
  onUpdateRoom: (room: Room) => void;
  onDeleteRoom: (id: string) => void;
  onAddSubject: (subject: SubjectItem) => void;
  onUpdateSubject: (subject: SubjectItem) => void;
  onDeleteSubject: (id: string) => void;
  onAddTimePeriod: (period: TimePeriod) => void;
  onUpdateTimePeriod: (period: TimePeriod) => void;
  onDeleteTimePeriod: (id: string) => void;
  onResetTimePeriods?: () => void;
}

const ALL_GRADE_LEVELS: GradeLevel[] = [
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12'
];

export const EntityManagementModal: React.FC<EntityManagementModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'TEACHERS',
  teachers,
  sections,
  rooms,
  subjects,
  timePeriods,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
  onAddSection,
  onUpdateSection,
  onDeleteSection,
  onAddRoom,
  onUpdateRoom,
  onDeleteRoom,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
  onAddTimePeriod,
  onUpdateTimePeriod,
  onDeleteTimePeriod,
  onResetTimePeriods
}) => {
  const [activeTab, setActiveTab] = useState<EntityTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync tab when initialTab prop changes
  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Reset search and forms when tab changes
  const switchTab = (tab: EntityTab) => {
    setActiveTab(tab);
    setSearchQuery('');
    setIsTeacherFormOpen(false);
    setIsSectionFormOpen(false);
    setIsRoomFormOpen(false);
    setIsSubjectFormOpen(false);
    setIsTimeFormOpen(false);
    setEditingTeacher(null);
    setEditingSection(null);
    setEditingRoom(null);
    setEditingSubject(null);
    setEditingTime(null);
  };

  // ================= 1. TEACHER STATE =================
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [tName, setTName] = useState('');
  const [tEmpId, setTEmpId] = useState('');
  const [tTitle, setTTitle] = useState('Teacher III');
  const [tSpecs, setTSpecs] = useState('MATH7, GENMATH');
  const [tAdvisory, setTAdvisory] = useState('');
  const [tMaxMinutes, setTMaxMinutes] = useState(1800);
  const [isTeacherFormOpen, setIsTeacherFormOpen] = useState(false);

  // ================= 2. SUBJECT STATE =================
  const [editingSubject, setEditingSubject] = useState<SubjectItem | null>(null);
  const [subCode, setSubCode] = useState('');
  const [subName, setSubName] = useState('');
  const [subLevel, setSubLevel] = useState<EducationLevel>('JHS');
  const [subGradeLevels, setSubGradeLevels] = useState<GradeLevel[]>(['Grade 7']);
  const [subStrand, setSubStrand] = useState<SHSStrand>('None');
  const [subCategory, setSubCategory] = useState<SubjectItem['category']>('JHS-MATATAG');
  const [subWeeklyMinutes, setSubWeeklyMinutes] = useState(240);
  const [subDuration, setSubDuration] = useState(60);
  const [subPreferredRoom, setSubPreferredRoom] = useState<SubjectItem['preferredRoomType']>('Lecture');
  const [subColor, setSubColor] = useState('#3B82F6');
  const [isSubjectFormOpen, setIsSubjectFormOpen] = useState(false);

  // ================= 3. TIME PERIOD STATE =================
  const [editingTime, setEditingTime] = useState<TimePeriod | null>(null);
  const [timeLabel, setTimeLabel] = useState('');
  const [timeStart, setTimeStart] = useState('07:30');
  const [timeEnd, setTimeEnd] = useState('08:30');
  const [timeIsBreak, setTimeIsBreak] = useState(false);
  const [isTimeFormOpen, setIsTimeFormOpen] = useState(false);

  // ================= 4. SECTION STATE =================
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [secName, setSecName] = useState('');
  const [secGrade, setSecGrade] = useState<GradeLevel>('Grade 7');
  const [secLevel, setSecLevel] = useState<EducationLevel>('JHS');
  const [secStrand, setSecStrand] = useState<SHSStrand>('None');
  const [secAdviser, setSecAdviser] = useState('');
  const [secRoom, setSecRoom] = useState('');
  const [secCount, setSecCount] = useState(45);
  const [secShift, setSecShift] = useState<'Morning' | 'Afternoon' | 'Whole Day'>('Morning');
  const [isSectionFormOpen, setIsSectionFormOpen] = useState(false);

  // ================= 5. ROOM STATE =================
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [rName, setRName] = useState('');
  const [rCode, setRCode] = useState('');
  const [rType, setRType] = useState<Room['type']>('Lecture');
  const [rCap, setRCap] = useState(45);
  const [rBldg, setRBldg] = useState('Main Academic Building');
  const [isRoomFormOpen, setIsRoomFormOpen] = useState(false);

  if (!isOpen) return null;

  // --- Handlers for Teachers ---
  const handleStartAddTeacher = () => {
    setEditingTeacher(null);
    setTName('');
    setTEmpId(`DEPED-304469-${Math.floor(100 + Math.random() * 900)}`);
    setTTitle('Teacher III');
    setTSpecs('');
    setTAdvisory('');
    setTMaxMinutes(1800);
    setIsTeacherFormOpen(true);
  };

  const handleStartEditTeacher = (t: Teacher) => {
    setEditingTeacher(t);
    setTName(t.name);
    setTEmpId(t.employeeId);
    setTTitle(t.title);
    setTSpecs(t.specializations.join(', '));
    setTAdvisory(t.advisorySectionId || '');
    setTMaxMinutes(t.maxWeeklyMinutes || 1800);
    setIsTeacherFormOpen(true);
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tName.trim()) return;

    const newTeacher: Teacher = {
      id: editingTeacher ? editingTeacher.id : `t-${Date.now()}`,
      name: tName.trim(),
      employeeId: tEmpId.trim() || `DEPED-304469-${Math.floor(1000 + Math.random() * 9000)}`,
      title: tTitle,
      specializations: tSpecs.split(',').map(s => s.trim().toUpperCase()).filter(Boolean),
      advisorySectionId: tAdvisory || undefined,
      maxWeeklyMinutes: Number(tMaxMinutes) || 1800,
      color: editingTeacher?.color || '#2563EB'
    };

    if (editingTeacher) {
      onUpdateTeacher(newTeacher);
    } else {
      onAddTeacher(newTeacher);
    }
    setIsTeacherFormOpen(false);
    setEditingTeacher(null);
  };

  // --- Handlers for Subjects ---
  const handleStartAddSubject = () => {
    setEditingSubject(null);
    setSubCode('');
    setSubName('');
    setSubLevel('JHS');
    setSubGradeLevels(['Grade 7']);
    setSubStrand('None');
    setSubCategory('JHS-MATATAG');
    setSubWeeklyMinutes(240);
    setSubDuration(60);
    setSubPreferredRoom('Lecture');
    setSubColor('#3B82F6');
    setIsSubjectFormOpen(true);
  };

  const handleStartEditSubject = (sub: SubjectItem) => {
    setEditingSubject(sub);
    setSubCode(sub.code);
    setSubName(sub.name);
    setSubLevel(sub.level);
    setSubGradeLevels(sub.gradeLevels || ['Grade 7']);
    setSubStrand(sub.strand || 'None');
    setSubCategory(sub.category);
    setSubWeeklyMinutes(sub.weeklyMinutesRequired);
    setSubDuration(sub.sessionDurationMinutes);
    setSubPreferredRoom(sub.preferredRoomType || 'Lecture');
    setSubColor(sub.color || '#3B82F6');
    setIsSubjectFormOpen(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subCode.trim() || !subName.trim()) {
      alert('Please specify both subject code and title.');
      return;
    }

    const newSub: SubjectItem = {
      id: editingSubject ? editingSubject.id : `sub-${Date.now()}`,
      code: subCode.toUpperCase().trim(),
      name: subName.trim(),
      level: subLevel,
      gradeLevels: subGradeLevels,
      strand: subStrand !== 'None' ? subStrand : undefined,
      category: subCategory,
      weeklyMinutesRequired: Number(subWeeklyMinutes) || 240,
      sessionDurationMinutes: Number(subDuration) || 60,
      preferredRoomType: subPreferredRoom,
      color: subColor
    };

    if (editingSubject) {
      onUpdateSubject(newSub);
    } else {
      onAddSubject(newSub);
    }
    setIsSubjectFormOpen(false);
    setEditingSubject(null);
  };

  const toggleGradeSelection = (grade: GradeLevel) => {
    setSubGradeLevels(prev => {
      if (prev.includes(grade)) {
        if (prev.length === 1) return prev; // keep at least 1
        return prev.filter(g => g !== grade);
      } else {
        return [...prev, grade];
      }
    });
  };

  // --- Handlers for Time Periods ---
  const handleStartAddTime = () => {
    setEditingTime(null);
    setTimeLabel(`Period ${timePeriods.filter(p => !p.isBreak).length + 1}`);
    setTimeStart('08:00');
    setTimeEnd('09:00');
    setTimeIsBreak(false);
    setIsTimeFormOpen(true);
  };

  const handleStartEditTime = (period: TimePeriod) => {
    setEditingTime(period);
    setTimeLabel(period.label);
    setTimeStart(period.startTime);
    setTimeEnd(period.endTime);
    setTimeIsBreak(!!period.isBreak);
    setIsTimeFormOpen(true);
  };

  const handleSaveTime = (e: React.FormEvent) => {
    e.preventDefault();
    if (!timeLabel.trim() || !timeStart || !timeEnd) return;

    const startMins = timeToMinutes(timeStart);
    const endMins = timeToMinutes(timeEnd);
    if (endMins <= startMins) {
      alert('End time must be later than start time.');
      return;
    }

    const newPeriod: TimePeriod = {
      id: editingTime ? editingTime.id : `p-${Date.now()}`,
      label: timeLabel.trim(),
      startTime: timeStart,
      endTime: timeEnd,
      isBreak: timeIsBreak
    };

    if (editingTime) {
      onUpdateTimePeriod(newPeriod);
    } else {
      onAddTimePeriod(newPeriod);
    }
    setIsTimeFormOpen(false);
    setEditingTime(null);
  };

  // --- Handlers for Sections ---
  const handleStartAddSection = () => {
    setEditingSection(null);
    setSecName('');
    setSecGrade('Grade 7');
    setSecLevel('JHS');
    setSecStrand('None');
    setSecAdviser('');
    setSecRoom(rooms[0]?.id || '');
    setSecCount(45);
    setSecShift('Morning');
    setIsSectionFormOpen(true);
  };

  const handleStartEditSection = (sec: Section) => {
    setEditingSection(sec);
    setSecName(sec.name);
    setSecGrade(sec.gradeLevel);
    setSecLevel(sec.level);
    setSecStrand(sec.strand || 'None');
    setSecAdviser(sec.adviserTeacherId || '');
    setSecRoom(sec.roomDefaultId || '');
    setSecCount(sec.studentCount || 45);
    setSecShift(sec.shift || 'Morning');
    setIsSectionFormOpen(true);
  };

  const handleSaveSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!secName.trim()) return;

    const newSection: Section = {
      id: editingSection ? editingSection.id : `sec-${Date.now()}`,
      name: secName.trim(),
      gradeLevel: secGrade,
      level: secLevel,
      strand: secStrand !== 'None' ? secStrand : undefined,
      adviserTeacherId: secAdviser || undefined,
      roomDefaultId: secRoom || undefined,
      studentCount: Number(secCount) || 45,
      shift: secShift
    };

    if (editingSection) {
      onUpdateSection(newSection);
    } else {
      onAddSection(newSection);
    }
    setIsSectionFormOpen(false);
    setEditingSection(null);
  };

  // --- Handlers for Rooms ---
  const handleStartAddRoom = () => {
    setEditingRoom(null);
    setRName('');
    setRCode(`RM-${rooms.length + 101}`);
    setRType('Lecture');
    setRCap(45);
    setRBldg('Main Academic Building');
    setIsRoomFormOpen(true);
  };

  const handleStartEditRoom = (r: Room) => {
    setEditingRoom(r);
    setRName(r.name);
    setRCode(r.code);
    setRType(r.type);
    setRCap(r.capacity);
    setRBldg(r.building);
    setIsRoomFormOpen(true);
  };

  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rName.trim() || !rCode.trim()) return;

    const newRoom: Room = {
      id: editingRoom ? editingRoom.id : `r-${Date.now()}`,
      name: rName.trim(),
      code: rCode.trim().toUpperCase(),
      type: rType,
      capacity: Number(rCap) || 45,
      building: rBldg.trim()
    };

    if (editingRoom) {
      onUpdateRoom(newRoom);
    } else {
      onAddRoom(newRoom);
    }
    setIsRoomFormOpen(false);
    setEditingRoom(null);
  };

  // Filtered lists
  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.specializations.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.strand && s.strand.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredSections = sections.filter(sec => 
    sec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sec.gradeLevel.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (sec.strand && sec.strand.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredRooms = rooms.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedTimePeriods = [...timePeriods].sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#0f172a] rounded-2xl max-w-5xl w-full shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[90vh] text-slate-100">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-white text-base sm:text-lg">
                  Manual Data Management Center
                </h2>
                <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-indigo-500/30">
                  Malasila NVTHS
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Add, edit, or configure teachers, subjects, daily time periods, grade levels & sections, and classrooms manually.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 5-Tab Selector & Quick Add Button Bar */}
        <div className="px-4 py-3 border-b border-slate-800 bg-[#0b1120] flex items-center justify-between flex-wrap gap-2.5">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto max-w-full">
            <button
              id="tab-entity-teachers"
              onClick={() => switchTab('TEACHERS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'TEACHERS' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Teachers ({teachers.length})</span>
            </button>

            <button
              id="tab-entity-subjects"
              onClick={() => switchTab('SUBJECTS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'SUBJECTS' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Subjects ({subjects.length})</span>
            </button>

            <button
              id="tab-entity-time"
              onClick={() => switchTab('TIME')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'TIME' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Time Schedule ({timePeriods.length})</span>
            </button>

            <button
              id="tab-entity-sections"
              onClick={() => switchTab('SECTIONS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'SECTIONS' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Grade Levels & Sections ({sections.length})</span>
            </button>

            <button
              id="tab-entity-rooms"
              onClick={() => switchTab('ROOMS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'ROOMS' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Rooms & Labs ({rooms.length})</span>
            </button>
          </div>

          {/* Tab Primary Action: Add Button */}
          <div className="flex items-center gap-2">
            {activeTab === 'TEACHERS' && !isTeacherFormOpen && (
              <button
                id="btn-add-teacher-manual"
                onClick={handleStartAddTeacher}
                className="flex items-center gap-1 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-md cursor-pointer active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Teacher</span>
              </button>
            )}

            {activeTab === 'SUBJECTS' && !isSubjectFormOpen && (
              <button
                id="btn-add-subject-manual"
                onClick={handleStartAddSubject}
                className="flex items-center gap-1 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-md cursor-pointer active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Subject</span>
              </button>
            )}

            {activeTab === 'TIME' && !isTimeFormOpen && (
              <div className="flex items-center gap-2">
                {onResetTimePeriods && (
                  <button
                    onClick={onResetTimePeriods}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 cursor-pointer"
                    title="Restore DepEd 7:00 AM - 5:00 PM standard bell periods"
                  >
                    <RotateCcw className="w-3 h-3 text-slate-400" />
                    <span>Reset to Standard</span>
                  </button>
                )}
                <button
                  id="btn-add-time-manual"
                  onClick={handleStartAddTime}
                  className="flex items-center gap-1 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-md cursor-pointer active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Time Period</span>
                </button>
              </div>
            )}

            {activeTab === 'SECTIONS' && !isSectionFormOpen && (
              <button
                id="btn-add-section-manual"
                onClick={handleStartAddSection}
                className="flex items-center gap-1 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-md cursor-pointer active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Section</span>
              </button>
            )}

            {activeTab === 'ROOMS' && !isRoomFormOpen && (
              <button
                id="btn-add-room-manual"
                onClick={handleStartAddRoom}
                className="flex items-center gap-1 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-md cursor-pointer active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Room</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">

          {/* Search bar for listing views */}
          {!isTeacherFormOpen && !isSubjectFormOpen && !isTimeFormOpen && !isSectionFormOpen && !isRoomFormOpen && (
            <div className="mb-4">
              <div className="relative max-w-sm">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${activeTab.toLowerCase()}...`}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* ================= 1. TEACHERS TAB ================= */}
          {activeTab === 'TEACHERS' && (
            <div>
              {isTeacherFormOpen ? (
                <form onSubmit={handleSaveTeacher} className="space-y-4 max-w-xl mx-auto bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-400" />
                      {editingTeacher ? 'Edit Teacher Details' : 'Register New Faculty Member'}
                    </h3>
                    <span className="text-[11px] text-slate-400">DepEd SF7 Faculty Record</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Teacher Full Name *</label>
                      <input
                        type="text"
                        value={tName}
                        onChange={(e) => setTName(e.target.value)}
                        placeholder="e.g. Maria Santos, Juan Dela Cruz"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-100 focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Rank / Position Title</label>
                      <select
                        value={tTitle}
                        onChange={(e) => setTTitle(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 cursor-pointer"
                      >
                        <option value="Teacher I">Teacher I</option>
                        <option value="Teacher II">Teacher II</option>
                        <option value="Teacher III">Teacher III</option>
                        <option value="Master Teacher I">Master Teacher I</option>
                        <option value="Master Teacher II">Master Teacher II</option>
                        <option value="Head Teacher I">Head Teacher I</option>
                        <option value="Head Teacher II">Head Teacher II</option>
                        <option value="Vocational Instructor I">Vocational Instructor I</option>
                        <option value="Special Education Teacher">Special Education Teacher</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Employee Number</label>
                      <input
                        type="text"
                        value={tEmpId}
                        onChange={(e) => setTEmpId(e.target.value)}
                        placeholder="e.g. DEPED-304469-012"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Advisory Section</label>
                      <select
                        value={tAdvisory}
                        onChange={(e) => setTAdvisory(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 cursor-pointer"
                      >
                        <option value="">None / Non-Advisory Faculty</option>
                        {sections.map(sec => (
                          <option key={sec.id} value={sec.id}>
                            {sec.name} ({sec.gradeLevel})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Subject Specializations (Comma-separated codes)
                    </label>
                    <input
                      type="text"
                      value={tSpecs}
                      onChange={(e) => setTSpecs(e.target.value)}
                      placeholder="e.g. MATH7, MATH8, GENMATH, PRECALC"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono uppercase text-slate-100 focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Used by the conflict detection and auto-scheduler algorithms to match teachers with compatible subjects.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Max Weekly Teaching Load (Minutes)
                    </label>
                    <input
                      type="number"
                      value={tMaxMinutes}
                      onChange={(e) => setTMaxMinutes(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      DepEd standard teaching load: 1,800 minutes (30 teaching hours/week, 6 hrs/day).
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsTeacherFormOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md cursor-pointer"
                    >
                      Save Teacher
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredTeachers.map(teacher => {
                    const advisorySec = sections.find(s => s.id === teacher.advisorySectionId);
                    return (
                      <div
                        key={teacher.id}
                        className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between hover:border-slate-700 transition-all"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-bold text-white text-xs">{teacher.name}</div>
                              <div className="text-[11px] text-indigo-300 font-medium">{teacher.title}</div>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                              {teacher.employeeId}
                            </span>
                          </div>

                          {advisorySec && (
                            <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                              <GraduationCap className="w-3 h-3" />
                              <span>Adviser: {advisorySec.name} ({advisorySec.gradeLevel})</span>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-1 mt-2.5">
                            {teacher.specializations.map(spec => (
                              <span key={spec} className="bg-slate-800 text-slate-300 border border-slate-700 text-[10px] px-1.5 py-0.5 rounded font-mono">
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/80">
                          <span className="text-[10px] text-slate-500">
                            Max {Math.round(teacher.maxWeeklyMinutes / 60)}h / wk
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleStartEditTeacher(teacher)}
                              className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded cursor-pointer"
                              title="Edit Teacher"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteTeacher(teacher.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 rounded cursor-pointer"
                              title="Delete Teacher"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================= 2. SUBJECTS TAB ================= */}
          {activeTab === 'SUBJECTS' && (
            <div>
              {isSubjectFormOpen ? (
                <form onSubmit={handleSaveSubject} className="space-y-4 max-w-xl mx-auto bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-400" />
                      {editingSubject ? 'Edit Subject Details' : 'Add New Subject / Learning Area'}
                    </h3>
                    <span className="text-[11px] text-slate-400">Curriculum Catalog</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Subject Code *</label>
                      <input
                        type="text"
                        value={subCode}
                        onChange={(e) => setSubCode(e.target.value)}
                        placeholder="e.g. MATH7, FIL10"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono uppercase text-slate-100 focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-300 mb-1">Subject Title *</label>
                      <input
                        type="text"
                        value={subName}
                        onChange={(e) => setSubName(e.target.value)}
                        placeholder="e.g. Mathematics 7 (Numbers & Algebra)"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-100 focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Education Level</label>
                      <select
                        value={subLevel}
                        onChange={(e) => {
                          const lvl = e.target.value as EducationLevel;
                          setSubLevel(lvl);
                          if (lvl === 'JHS') {
                            setSubCategory('JHS-MATATAG');
                            setSubStrand('None');
                          } else {
                            setSubCategory('Core');
                            setSubStrand('ACADEMIC ELECTIVES');
                          }
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 cursor-pointer"
                      >
                        <option value="JHS">Junior High School (JHS)</option>
                        <option value="SHS">Senior High School (SHS)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Curriculum Category</label>
                      <select
                        value={subCategory}
                        onChange={(e) => setSubCategory(e.target.value as SubjectItem['category'])}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 cursor-pointer"
                      >
                        <option value="JHS-MATATAG">JHS-MATATAG</option>
                        <option value="Core">Core Curriculum</option>
                        <option value="Applied">Applied Subject</option>
                        <option value="Specialized">Specialized Track Subject</option>
                        <option value="Trimester-Unit">Trimester Unit</option>
                        <option value="Institutional">Institutional Requirement</option>
                      </select>
                    </div>
                  </div>

                  {subLevel === 'SHS' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Senior High Track / Elective Strand
                      </label>
                      <select
                        value={subStrand}
                        onChange={(e) => setSubStrand(e.target.value as SHSStrand)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 cursor-pointer"
                      >
                        <option value="None">None (Common Core for All Tracks)</option>
                        <option value="ACADEMIC ELECTIVES">ACADEMIC ELECTIVES</option>
                        <option value="TECHPRO ELECTIVE">TECHPRO ELECTIVE</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Applicable Grade Levels (Select one or more)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {ALL_GRADE_LEVELS.map(g => {
                        const isSelected = subGradeLevels.includes(g);
                        return (
                          <button
                            type="button"
                            key={g}
                            onClick={() => toggleGradeSelection(g)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                                : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                            {g}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Weekly Req. (Mins)
                      </label>
                      <input
                        type="number"
                        value={subWeeklyMinutes}
                        onChange={(e) => setSubWeeklyMinutes(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100"
                        required
                      />
                      <span className="text-[10px] text-slate-500">{subWeeklyMinutes / 60} hrs/week</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Block Duration (Mins)
                      </label>
                      <input
                        type="number"
                        value={subDuration}
                        onChange={(e) => setSubDuration(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100"
                        required
                      />
                      <span className="text-[10px] text-slate-500">Standard single session</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Preferred Facility
                      </label>
                      <select
                        value={subPreferredRoom}
                        onChange={(e) => setSubPreferredRoom(e.target.value as SubjectItem['preferredRoomType'])}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 cursor-pointer"
                      >
                        <option value="Lecture">Lecture Classroom</option>
                        <option value="ScienceLab">Science Laboratory</option>
                        <option value="ComputerLab">Computer Laboratory</option>
                        <option value="HE_Room">Home Economics / Workshop</option>
                        <option value="Gym">Gymnasium / Court</option>
                        <option value="AudioVisual">Audio-Visual Room</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsSubjectFormOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md cursor-pointer"
                    >
                      Save Subject
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredSubjects.map(sub => (
                    <div
                      key={sub.id}
                      className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between hover:border-slate-700 transition-all"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {sub.code}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                            {sub.level}
                          </span>
                        </div>

                        <div className="font-bold text-white text-xs mt-2">{sub.name}</div>

                        {sub.strand && (
                          <div className="mt-1 text-[10px] text-amber-400 font-semibold">
                            {sub.strand}
                          </div>
                        )}

                        <div className="flex flex-wrap gap-1 mt-2">
                          {sub.gradeLevels?.map(g => (
                            <span key={g} className="bg-slate-800 text-slate-300 text-[10px] px-1.5 py-0.5 rounded">
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                        <span>{sub.weeklyMinutesRequired} mins/wk ({sub.sessionDurationMinutes}m/day)</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleStartEditSubject(sub)}
                            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded cursor-pointer"
                            title="Edit Subject"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteSubject(sub.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 rounded cursor-pointer"
                            title="Delete Subject"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= 3. TIME PERIODS TAB ================= */}
          {activeTab === 'TIME' && (
            <div>
              {isTimeFormOpen ? (
                <form onSubmit={handleSaveTime} className="space-y-4 max-w-lg mx-auto bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      {editingTime ? 'Edit Time Period' : 'Add New Daily Time Period'}
                    </h3>
                    <span className="text-[11px] text-slate-400">Bell Schedule</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Period Name / Label *
                    </label>
                    <input
                      type="text"
                      value={timeLabel}
                      onChange={(e) => setTimeLabel(e.target.value)}
                      placeholder="e.g. Period 1, Morning Recess, Lunch Break"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-100 focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Start Time (24H) *
                      </label>
                      <input
                        type="time"
                        value={timeStart}
                        onChange={(e) => setTimeStart(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        End Time (24H) *
                      </label>
                      <input
                        type="time"
                        value={timeEnd}
                        onChange={(e) => setTimeEnd(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100"
                        required
                      />
                    </div>
                  </div>

                  {timeStart && timeEnd && timeToMinutes(timeEnd) > timeToMinutes(timeStart) && (
                    <div className="text-xs text-indigo-300 bg-indigo-950/40 p-2.5 rounded-lg border border-indigo-500/30 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Duration: <strong>{timeToMinutes(timeEnd) - timeToMinutes(timeStart)} minutes</strong></span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                    <input
                      type="checkbox"
                      id="checkbox-is-break"
                      checked={timeIsBreak}
                      onChange={(e) => setTimeIsBreak(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-indigo-500 cursor-pointer"
                    />
                    <label htmlFor="checkbox-is-break" className="text-xs font-semibold text-slate-200 cursor-pointer">
                      Flag Ceremony, Assembly, Recess, or Lunch Break (Non-teaching block)
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsTimeFormOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md cursor-pointer"
                    >
                      Save Time Period
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-2">
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 mb-3 text-xs text-slate-400 flex items-center justify-between">
                    <span>
                      Daily Bell Schedule contains <strong>{sortedTimePeriods.length} time periods</strong> ({sortedTimePeriods.filter(p => !p.isBreak).length} Academic Teaching Periods, {sortedTimePeriods.filter(p => p.isBreak).length} Breaks/Ceremonies).
                    </span>
                  </div>

                  <div className="divide-y divide-slate-800/80 rounded-xl border border-slate-800 overflow-hidden">
                    {sortedTimePeriods.map(period => {
                      const dur = timeToMinutes(period.endTime) - timeToMinutes(period.startTime);
                      return (
                        <div
                          key={period.id}
                          className={`p-3 flex items-center justify-between gap-3 transition-colors ${
                            period.isBreak ? 'bg-slate-950/50' : 'bg-slate-900/80 hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-center font-mono w-28 bg-slate-950 px-2 py-1.5 rounded-lg border border-slate-800">
                              <span className="text-xs font-bold text-slate-200">{period.startTime} - {period.endTime}</span>
                            </div>

                            <div>
                              <div className="font-bold text-xs text-white flex items-center gap-2">
                                <span>{period.label}</span>
                                {period.isBreak ? (
                                  <span className="text-[10px] font-semibold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                                    Break / Assembly
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                                    Class Period
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                                {dur} minutes
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleStartEditTime(period)}
                              className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded cursor-pointer"
                              title="Edit Time Period"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteTimePeriod(period.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 rounded cursor-pointer"
                              title="Delete Time Period"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= 4. SECTIONS & GRADE LEVELS TAB ================= */}
          {activeTab === 'SECTIONS' && (
            <div>
              {isSectionFormOpen ? (
                <form onSubmit={handleSaveSection} className="space-y-4 max-w-xl mx-auto bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-indigo-400" />
                      {editingSection ? 'Edit Section Details' : 'Add New Grade Level Section'}
                    </h3>
                    <span className="text-[11px] text-slate-400">Class Section</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Section Name *</label>
                      <input
                        type="text"
                        value={secName}
                        onChange={(e) => setSecName(e.target.value)}
                        placeholder="e.g. Diamond, Pearl, Rizal, STEM-Alpha"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-100 focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Grade Level *</label>
                      <select
                        value={secGrade}
                        onChange={(e) => {
                          const g = e.target.value as GradeLevel;
                          setSecGrade(g);
                          setSecLevel(g === 'Grade 11' || g === 'Grade 12' ? 'SHS' : 'JHS');
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-100 cursor-pointer"
                      >
                        <option value="Grade 7">Grade 7 (Junior High)</option>
                        <option value="Grade 8">Grade 8 (Junior High)</option>
                        <option value="Grade 9">Grade 9 (Junior High)</option>
                        <option value="Grade 10">Grade 10 (Junior High)</option>
                        <option value="Grade 11">Grade 11 (Senior High)</option>
                        <option value="Grade 12">Grade 12 (Senior High)</option>
                      </select>
                    </div>
                  </div>

                  {secLevel === 'SHS' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Senior High Track / Elective Option
                      </label>
                      <select
                        value={secStrand}
                        onChange={(e) => setSecStrand(e.target.value as SHSStrand)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-100 cursor-pointer"
                      >
                        <option value="ACADEMIC ELECTIVES">ACADEMIC ELECTIVES</option>
                        <option value="TECHPRO ELECTIVE">TECHPRO ELECTIVE</option>
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Class Adviser</label>
                      <select
                        value={secAdviser}
                        onChange={(e) => setSecAdviser(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 cursor-pointer"
                      >
                        <option value="">None / To be assigned</option>
                        {teachers.map(t => (
                          <option key={t.id} value={t.id}>{t.name} ({t.title})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Default Home Room</label>
                      <select
                        value={secRoom}
                        onChange={(e) => setSecRoom(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 cursor-pointer"
                      >
                        <option value="">None / Floating</option>
                        {rooms.map(r => (
                          <option key={r.id} value={r.id}>{r.name} ({r.code} • {r.type})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Student Enrollment</label>
                      <input
                        type="number"
                        value={secCount}
                        onChange={(e) => setSecCount(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Class Shift</label>
                      <select
                        value={secShift}
                        onChange={(e) => setSecShift(e.target.value as 'Morning' | 'Afternoon' | 'Whole Day')}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 cursor-pointer"
                      >
                        <option value="Morning">Morning Shift</option>
                        <option value="Afternoon">Afternoon Shift</option>
                        <option value="Whole Day">Whole Day</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsSectionFormOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md cursor-pointer"
                    >
                      Save Section
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredSections.map(sec => {
                    const adv = teachers.find(t => t.id === sec.adviserTeacherId);
                    const rm = rooms.find(r => r.id === sec.roomDefaultId);
                    return (
                      <div
                        key={sec.id}
                        className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between hover:border-slate-700 transition-all"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-bold text-white text-xs">{sec.name}</div>
                              <span className="text-[10px] font-bold text-indigo-300">
                                {sec.gradeLevel} ({sec.level})
                              </span>
                            </div>

                            {sec.strand && (
                              <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                {sec.strand}
                              </span>
                            )}
                          </div>

                          <div className="mt-2.5 space-y-1 text-[11px] text-slate-400">
                            {adv && (
                              <div>
                                <span className="text-slate-500">Adviser: </span>
                                <span className="text-slate-300 font-medium">{adv.name}</span>
                              </div>
                            )}
                            {rm && (
                              <div>
                                <span className="text-slate-500">Home Room: </span>
                                <span className="text-slate-300">{rm.name}</span>
                              </div>
                            )}
                            <div>
                              <span className="text-slate-500">Enrollment: </span>
                              <span className="text-slate-300">{sec.studentCount} students • {sec.shift}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-1 mt-3 pt-2 border-t border-slate-800/80">
                          <button
                            onClick={() => handleStartEditSection(sec)}
                            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded cursor-pointer"
                            title="Edit Section"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteSection(sec.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 rounded cursor-pointer"
                            title="Delete Section"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================= 5. ROOMS TAB ================= */}
          {activeTab === 'ROOMS' && (
            <div>
              {isRoomFormOpen ? (
                <form onSubmit={handleSaveRoom} className="space-y-4 max-w-xl mx-auto bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-indigo-400" />
                      {editingRoom ? 'Edit Facility Details' : 'Add New Classroom / Laboratory'}
                    </h3>
                    <span className="text-[11px] text-slate-400">School Facility</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Room Name *</label>
                      <input
                        type="text"
                        value={rName}
                        onChange={(e) => setRName(e.target.value)}
                        placeholder="e.g. Science Laboratory 1"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-100 focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Room Code *</label>
                      <input
                        type="text"
                        value={rCode}
                        onChange={(e) => setRCode(e.target.value)}
                        placeholder="e.g. SCILAB1"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono uppercase text-slate-100 focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Facility Type</label>
                      <select
                        value={rType}
                        onChange={(e) => setRType(e.target.value as Room['type'])}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 cursor-pointer"
                      >
                        <option value="Lecture">Lecture Classroom</option>
                        <option value="ScienceLab">Science Laboratory</option>
                        <option value="ComputerLab">Computer Laboratory</option>
                        <option value="HE_Room">Home Economics / Vocational Workshop</option>
                        <option value="Gym">Gymnasium / Court</option>
                        <option value="AudioVisual">Audio-Visual Room (AVR)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Seat Capacity</label>
                      <input
                        type="number"
                        value={rCap}
                        onChange={(e) => setRCap(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Building Location</label>
                    <input
                      type="text"
                      value={rBldg}
                      onChange={(e) => setRBldg(e.target.value)}
                      placeholder="e.g. Main Academic Building, TVL Building"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsRoomFormOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md cursor-pointer"
                    >
                      Save Room
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredRooms.map(r => (
                    <div
                      key={r.id}
                      className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between hover:border-slate-700 transition-all"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-bold text-white text-xs">{r.name}</div>
                          <span className="text-[10px] font-mono font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                            {r.code}
                          </span>
                        </div>

                        <div className="mt-2 text-[11px] text-indigo-300 font-medium">
                          {r.type}
                        </div>

                        <div className="mt-1 text-[11px] text-slate-400">
                          {r.building} • Max {r.capacity} seats
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-1 mt-3 pt-2 border-t border-slate-800/80">
                        <button
                          onClick={() => handleStartEditRoom(r)}
                          className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded cursor-pointer"
                          title="Edit Room"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteRoom(r.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 rounded cursor-pointer"
                          title="Delete Room"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400">
          <span>Malasila National Vocational and Technological High School (ID: 304469)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold cursor-pointer border border-slate-700 transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};

import React, { useState, useMemo, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  SchoolProfile, 
  Teacher, 
  Section, 
  Room, 
  SubjectItem, 
  ScheduleSlot, 
  ScheduleConflict,
  TimePeriod 
} from './types';
import { DEPED_SUBJECTS, TIME_PERIODS_DEFAULT } from './data/depedCurriculum';
import { 
  INITIAL_SCHOOL_PROFILE, 
  INITIAL_TEACHERS, 
  INITIAL_SECTIONS, 
  INITIAL_ROOMS, 
  INITIAL_SCHEDULE_SLOTS 
} from './data/initialSchoolData';
import { detectAllConflicts } from './utils/conflictDetector';
import { generateAutoSchedule, autoResolveSingleConflict } from './utils/autoScheduler';
import { 
  exportScheduleAsJson, 
  downloadJsonFile,
  exportScheduleAsExcel,
  exportScheduleAsPdf,
  exportScheduleAsCsv
} from './utils/exporter';

import { Header } from './components/Header';
import { ConflictDrawer } from './components/ConflictDrawer';
import { TimetableGrid } from './components/TimetableGrid';
import { TeacherView } from './components/TeacherView';
import { RoomView } from './components/RoomView';
import { MasterMatrixView } from './components/MasterMatrixView';
import { SlotModal } from './components/SlotModal';
import { DepEdSF7Modal } from './components/DepEdSF7Modal';
import { CurriculumManagerModal } from './components/CurriculumManagerModal';
import { EntityManagementModal } from './components/EntityManagementModal';
import { ExportModal, ExportFormat } from './components/ExportModal';

export default function App() {
  // --- Persistent / State Storage ---
  const [profile, setProfile] = useState<SchoolProfile>(() => {
    const saved = localStorage.getItem('deped_sched_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          schoolName: INITIAL_SCHOOL_PROFILE.schoolName,
          schoolId: '304469',
          division: INITIAL_SCHOOL_PROFILE.division,
          region: INITIAL_SCHOOL_PROFILE.region,
        };
      } catch {
        return INITIAL_SCHOOL_PROFILE;
      }
    }
    return INITIAL_SCHOOL_PROFILE;
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('deped_sched_teachers');
    return saved ? JSON.parse(saved) : INITIAL_TEACHERS;
  });

  const [sections, setSections] = useState<Section[]>(() => {
    const saved = localStorage.getItem('deped_sched_sections');
    return saved ? JSON.parse(saved) : INITIAL_SECTIONS;
  });

  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = localStorage.getItem('deped_sched_rooms');
    return saved ? JSON.parse(saved) : INITIAL_ROOMS;
  });

  const [subjects, setSubjects] = useState<SubjectItem[]>(() => {
    const saved = localStorage.getItem('deped_sched_subjects');
    return saved ? JSON.parse(saved) : DEPED_SUBJECTS;
  });

  const [slots, setSlots] = useState<ScheduleSlot[]>(() => {
    const saved = localStorage.getItem('deped_sched_slots');
    return saved ? JSON.parse(saved) : INITIAL_SCHEDULE_SLOTS;
  });

  const [timePeriods, setTimePeriods] = useState<TimePeriod[]>(() => {
    const saved = localStorage.getItem('deped_sched_time_periods');
    return saved ? JSON.parse(saved) : TIME_PERIODS_DEFAULT;
  });

  // Local storage synchronization
  useEffect(() => {
    localStorage.setItem('deped_sched_profile', JSON.stringify(profile));
    localStorage.setItem('deped_sched_teachers', JSON.stringify(teachers));
    localStorage.setItem('deped_sched_sections', JSON.stringify(sections));
    localStorage.setItem('deped_sched_rooms', JSON.stringify(rooms));
    localStorage.setItem('deped_sched_subjects', JSON.stringify(subjects));
    localStorage.setItem('deped_sched_slots', JSON.stringify(slots));
    localStorage.setItem('deped_sched_time_periods', JSON.stringify(timePeriods));
  }, [profile, teachers, sections, rooms, subjects, slots, timePeriods]);

  // --- View & UI States ---
  const [activeView, setActiveView] = useState<'section' | 'teacher' | 'room' | 'master'>('section');
  const [selectedSectionId, setSelectedSectionId] = useState<string>(sections[0]?.id || 'sec-7-pearl');

  // Modals & Drawers
  const [isConflictDrawerOpen, setIsConflictDrawerOpen] = useState(false);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<ScheduleSlot | null>(null);
  const [defaultSlotValues, setDefaultSlotValues] = useState<Partial<ScheduleSlot> | undefined>(undefined);
  const [isSF7ModalOpen, setIsSF7ModalOpen] = useState(false);
  const [isCurriculumModalOpen, setIsCurriculumModalOpen] = useState(false);
  const [isEntitiesModalOpen, setIsEntitiesModalOpen] = useState(false);
  const [initialEntityTab, setInitialEntityTab] = useState<'TEACHERS' | 'SUBJECTS' | 'TIME' | 'SECTIONS' | 'ROOMS'>('TEACHERS');

  // Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportModalFormat, setExportModalFormat] = useState<ExportFormat>('EXCEL');
  const [exportModalSectionId, setExportModalSectionId] = useState<string | undefined>(undefined);

  const handleOpenExportModal = (format: ExportFormat = 'EXCEL', sectionId?: string) => {
    setExportModalFormat(format);
    setExportModalSectionId(sectionId);
    setIsExportModalOpen(true);
  };

  const handleOpenEntitiesModal = (tab: 'TEACHERS' | 'SUBJECTS' | 'TIME' | 'SECTIONS' | 'ROOMS' = 'TEACHERS') => {
    setInitialEntityTab(tab);
    setIsEntitiesModalOpen(true);
  };

  // --- Real-Time Conflict Detection Engine ---
  const conflicts = useMemo<ScheduleConflict[]>(() => {
    return detectAllConflicts(
      slots,
      teachers,
      sections,
      rooms,
      subjects,
      profile.activeTerm
    );
  }, [slots, teachers, sections, rooms, subjects, profile.activeTerm]);

  // --- Slot Handlers ---
  const handleSaveSlot = (slotData: Omit<ScheduleSlot, 'id'>, existingSlotId?: string) => {
    if (existingSlotId) {
      setSlots(prev => prev.map(s => s.id === existingSlotId ? { ...slotData, id: existingSlotId } : s));
    } else {
      const newSlot: ScheduleSlot = {
        ...slotData,
        id: `slot-${Date.now()}`
      };
      setSlots(prev => [...prev, newSlot]);
    }
  };

  const handleDeleteSlot = (slotId: string) => {
    setSlots(prev => prev.filter(s => s.id !== slotId));
  };

  const handleOpenAddSlot = (defaults?: Partial<ScheduleSlot>) => {
    setEditingSlot(null);
    setDefaultSlotValues(defaults);
    setIsSlotModalOpen(true);
  };

  const handleOpenEditSlot = (slot: ScheduleSlot) => {
    setEditingSlot(slot);
    setDefaultSlotValues(undefined);
    setIsSlotModalOpen(true);
  };

  // --- Auto-Schedule & Conflict Resolution ---
  const handleAutoSchedule = () => {
    const generated = generateAutoSchedule(
      sections,
      teachers,
      rooms,
      subjects,
      profile.activeTerm
    );
    setSlots(generated);

    // Launch celebratory confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleAutoResolveConflict = (conflict: ScheduleConflict) => {
    const resolved = autoResolveSingleConflict(conflict, slots, teachers, rooms);
    setSlots(resolved);
  };

  const handleAutoResolveAll = () => {
    let current = [...slots];
    const criticals = conflicts.filter(c => c.severity === 'CRITICAL');
    criticals.forEach(c => {
      current = autoResolveSingleConflict(c, current, teachers, rooms);
    });
    setSlots(current);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  // --- Reset to Demo Data ---
  const handleResetToDemo = () => {
    if (confirm('Reset entire school program to initial sample data with demo conflict highlights?')) {
      setProfile(INITIAL_SCHOOL_PROFILE);
      setTeachers(INITIAL_TEACHERS);
      setSections(INITIAL_SECTIONS);
      setRooms(INITIAL_ROOMS);
      setSubjects(DEPED_SUBJECTS);
      setTimePeriods(TIME_PERIODS_DEFAULT);
      setSlots(INITIAL_SCHEDULE_SLOTS);
      setSelectedSectionId(INITIAL_SECTIONS[0]?.id || '');
    }
  };

  // --- Export & Import ---
  const handleDownloadExcel = (sectionId?: string) => {
    exportScheduleAsExcel(
      profile,
      teachers,
      sections,
      rooms,
      subjects,
      slots,
      timePeriods,
      profile.activeTerm,
      sectionId
    );
  };

  const handleDownloadPdf = (sectionId?: string) => {
    exportScheduleAsPdf(
      profile,
      teachers,
      sections,
      rooms,
      subjects,
      slots,
      timePeriods,
      profile.activeTerm,
      sectionId
    );
  };

  const handleDownloadCsv = (sectionId?: string) => {
    exportScheduleAsCsv(
      profile,
      teachers,
      sections,
      rooms,
      subjects,
      slots,
      profile.activeTerm,
      sectionId
    );
  };

  const handleExportJson = () => {
    const jsonStr = exportScheduleAsJson(profile, teachers, sections, rooms, subjects, slots, timePeriods);
    downloadJsonFile(jsonStr, `DepEd-ClassProgram-${profile.schoolId}-${profile.activeTerm.replace(/\s+/g, '_')}.json`);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.profile) setProfile(data.profile);
        if (data.teachers) setTeachers(data.teachers);
        if (data.sections) setSections(data.sections);
        if (data.rooms) setRooms(data.rooms);
        if (data.subjects) setSubjects(data.subjects);
        if (data.timePeriods) setTimePeriods(data.timePeriods);
        if (data.slots) setSlots(data.slots);
        alert('Class Schedule dataset imported successfully!');
      } catch (err) {
        alert('Invalid JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Header & Navigation */}
      <Header
        profile={profile}
        onUpdateProfile={(updated) => setProfile(prev => ({ ...prev, ...updated }))}
        conflicts={conflicts}
        onOpenConflictDrawer={() => setIsConflictDrawerOpen(true)}
        onOpenAddSlotModal={() => handleOpenAddSlot()}
        onOpenSF7Modal={() => setIsSF7ModalOpen(true)}
        onOpenCurriculumModal={() => handleOpenEntitiesModal('SUBJECTS')}
        onOpenEntitiesModal={handleOpenEntitiesModal}
        onAutoSchedule={handleAutoSchedule}
        onResetToDemo={handleResetToDemo}
        onExportJson={handleExportJson}
        onDownloadExcel={() => handleDownloadExcel()}
        onDownloadPdf={() => handleDownloadPdf()}
        onDownloadCsv={() => handleDownloadCsv()}
        onOpenExportModal={(fmt) => handleOpenExportModal(fmt || 'EXCEL')}
        onImportJson={handleImportJson}
        activeView={activeView}
        onChangeView={setActiveView}
      />

      {/* Main App Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {activeView === 'section' && (
          <TimetableGrid
            slots={slots}
            sections={sections}
            teachers={teachers}
            rooms={rooms}
            subjects={subjects}
            timePeriods={timePeriods}
            conflicts={conflicts}
            activeTerm={profile.activeTerm}
            selectedSectionId={selectedSectionId}
            onSelectSectionId={setSelectedSectionId}
            onOpenAddSlot={handleOpenAddSlot}
            onEditSlot={handleOpenEditSlot}
            onDeleteSlot={handleDeleteSlot}
            onOpenConflictDetails={() => setIsConflictDrawerOpen(true)}
            onExportSection={(format, secId) => {
              if (format === 'EXCEL') handleDownloadExcel(secId);
              else if (format === 'PDF') handleDownloadPdf(secId);
              else handleDownloadCsv(secId);
            }}
          />
        )}

        {activeView === 'teacher' && (
          <TeacherView
            teachers={teachers}
            slots={slots}
            sections={sections}
            rooms={rooms}
            subjects={subjects}
            conflicts={conflicts}
            activeTerm={profile.activeTerm}
            onEditSlot={handleOpenEditSlot}
            onDeleteSlot={handleDeleteSlot}
          />
        )}

        {activeView === 'room' && (
          <RoomView
            rooms={rooms}
            slots={slots}
            sections={sections}
            teachers={teachers}
            subjects={subjects}
            conflicts={conflicts}
            activeTerm={profile.activeTerm}
          />
        )}

        {activeView === 'master' && (
          <MasterMatrixView
            sections={sections}
            teachers={teachers}
            rooms={rooms}
            subjects={subjects}
            slots={slots}
            conflicts={conflicts}
            activeTerm={profile.activeTerm}
            timePeriods={timePeriods}
          />
        )}
      </main>

      {/* Conflict Inspector Sliding Drawer */}
      <ConflictDrawer
        isOpen={isConflictDrawerOpen}
        onClose={() => setIsConflictDrawerOpen(false)}
        conflicts={conflicts}
        slots={slots}
        teachers={teachers}
        sections={sections}
        rooms={rooms}
        subjects={subjects}
        timePeriods={timePeriods}
        onAutoResolveConflict={handleAutoResolveConflict}
        onEditSlot={handleOpenEditSlot}
        onDeleteSlot={handleDeleteSlot}
        onAutoResolveAll={handleAutoResolveAll}
        onUpdateSlot={(updatedSlot) => {
          setSlots(prev => prev.map(s => s.id === updatedSlot.id ? updatedSlot : s));
        }}
        onRunScan={() => {
          // Re-trigger conflict evaluation
        }}
      />

      {/* Add / Edit Slot Modal */}
      <SlotModal
        isOpen={isSlotModalOpen}
        onClose={() => setIsSlotModalOpen(false)}
        onSave={handleSaveSlot}
        editingSlot={editingSlot}
        defaultValues={defaultSlotValues}
        sections={sections}
        teachers={teachers}
        rooms={rooms}
        subjects={subjects}
        timePeriods={timePeriods}
        allSlots={slots}
        activeTerm={profile.activeTerm}
      />

      {/* DepEd SF7 & Official Class Program Printable Document Modal */}
      <DepEdSF7Modal
        isOpen={isSF7ModalOpen}
        onClose={() => setIsSF7ModalOpen(false)}
        profile={profile}
        teachers={teachers}
        sections={sections}
        rooms={rooms}
        subjects={subjects}
        slots={slots}
        activeTerm={profile.activeTerm}
        timePeriods={timePeriods}
      />

      {/* DepEd MATATAG / SHS / Trimester Curriculum Manager Modal */}
      <CurriculumManagerModal
        isOpen={isCurriculumModalOpen}
        onClose={() => setIsCurriculumModalOpen(false)}
        subjects={subjects}
        onAddSubject={(newSub) => setSubjects(prev => [...prev, newSub])}
        onUpdateSubject={(updSub) => setSubjects(prev => prev.map(s => s.id === updSub.id ? updSub : s))}
        onDeleteSubject={(subId) => setSubjects(prev => prev.filter(s => s.id !== subId))}
      />

      {/* Faculty, Sections & Facilities Management Modal */}
      <EntityManagementModal
        isOpen={isEntitiesModalOpen}
        onClose={() => setIsEntitiesModalOpen(false)}
        initialTab={initialEntityTab}
        teachers={teachers}
        sections={sections}
        rooms={rooms}
        subjects={subjects}
        timePeriods={timePeriods}
        onAddTeacher={(t) => setTeachers(prev => [...prev, t])}
        onUpdateTeacher={(t) => setTeachers(prev => prev.map(x => x.id === t.id ? t : x))}
        onDeleteTeacher={(id) => setTeachers(prev => prev.filter(x => x.id !== id))}
        onAddSection={(s) => setSections(prev => [...prev, s])}
        onUpdateSection={(s) => setSections(prev => prev.map(x => x.id === s.id ? s : x))}
        onDeleteSection={(id) => setSections(prev => prev.filter(x => x.id !== id))}
        onAddRoom={(r) => setRooms(prev => [...prev, r])}
        onUpdateRoom={(r) => setRooms(prev => prev.map(x => x.id === r.id ? r : x))}
        onDeleteRoom={(id) => setRooms(prev => prev.filter(x => x.id !== id))}
        onAddSubject={(newSub) => setSubjects(prev => [...prev, newSub])}
        onUpdateSubject={(updSub) => setSubjects(prev => prev.map(s => s.id === updSub.id ? updSub : s))}
        onDeleteSubject={(subId) => setSubjects(prev => prev.filter(s => s.id !== subId))}
        onAddTimePeriod={(p) => setTimePeriods(prev => [...prev, p])}
        onUpdateTimePeriod={(p) => setTimePeriods(prev => prev.map(x => x.id === p.id ? p : x))}
        onDeleteTimePeriod={(id) => setTimePeriods(prev => prev.filter(x => x.id !== id))}
        onResetTimePeriods={() => setTimePeriods(TIME_PERIODS_DEFAULT)}
      />

      {/* Download & Export Schedule Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        profile={profile}
        teachers={teachers}
        sections={sections}
        rooms={rooms}
        subjects={subjects}
        slots={slots}
        timePeriods={timePeriods}
        initialFormat={exportModalFormat}
        initialSectionId={exportModalSectionId}
      />
    </div>
  );
}

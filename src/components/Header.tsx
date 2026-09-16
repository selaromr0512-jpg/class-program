import React, { useState, useRef, useEffect } from 'react';
import { 
  AlertTriangle, 
  Calendar, 
  CheckCircle2, 
  Download, 
  Layers, 
  Plus, 
  Printer, 
  Sparkles, 
  Upload, 
  Users, 
  Building2, 
  BookOpen, 
  RotateCcw,
  SlidersHorizontal,
  Clock,
  FileSpreadsheet,
  FileText,
  ChevronDown,
  FileCode,
  Sliders
} from 'lucide-react';
import { SchoolProfile, ScheduleConflict } from '../types';
import { EntityTab } from './EntityManagementModal';

interface HeaderProps {
  profile: SchoolProfile;
  onUpdateProfile: (updated: Partial<SchoolProfile>) => void;
  conflicts: ScheduleConflict[];
  onOpenConflictDrawer: () => void;
  onOpenAddSlotModal: () => void;
  onOpenSF7Modal: () => void;
  onOpenCurriculumModal: () => void;
  onOpenEntitiesModal: (tab?: EntityTab) => void;
  onAutoSchedule: () => void;
  onResetToDemo: () => void;
  onExportJson: () => void;
  onDownloadExcel: () => void;
  onDownloadPdf: () => void;
  onDownloadCsv: () => void;
  onOpenExportModal: (format?: 'EXCEL' | 'PDF' | 'CSV' | 'JSON') => void;
  onImportJson: (e: React.ChangeEvent<HTMLInputElement>) => void;
  activeView: 'section' | 'teacher' | 'room' | 'master';
  onChangeView: (view: 'section' | 'teacher' | 'room' | 'master') => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  onUpdateProfile,
  conflicts,
  onOpenConflictDrawer,
  onOpenAddSlotModal,
  onOpenSF7Modal,
  onOpenCurriculumModal,
  onOpenEntitiesModal,
  onAutoSchedule,
  onResetToDemo,
  onExportJson,
  onDownloadExcel,
  onDownloadPdf,
  onDownloadCsv,
  onOpenExportModal,
  onImportJson,
  activeView,
  onChangeView,
}) => {
  const criticalCount = conflicts.filter(c => c.severity === 'CRITICAL').length;
  const warningCount = conflicts.filter(c => c.severity === 'WARNING').length;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const downloadDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (downloadDropdownRef.current && !downloadDropdownRef.current.contains(event.target as Node)) {
        setIsDownloadOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const termOptions = profile.curriculumType === 'TRIMESTER'
    ? ['Trimester 1', 'Trimester 2', 'Trimester 3']
    : ['1st Semester', '2nd Semester'];

  return (
    <header className="bg-[#0f172a]/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 shadow-lg shadow-black/20">
      {/* Top Banner: DepEd School Info & Conflict Alert Status */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.4)] text-white flex items-center justify-center font-bold text-lg border border-indigo-400/30">
            🏫
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-white text-base sm:text-lg leading-tight tracking-tight">
                {profile.schoolName}
              </h1>
              <span className="bg-indigo-500/10 text-indigo-400 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-indigo-500/20">
                DepEd ID: {profile.schoolId}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 flex-wrap mt-0.5">
              <span>{profile.division}</span>
              <span className="text-slate-600">•</span>
              <span>{profile.region}</span>
              <span className="text-slate-600">•</span>
              <span className="font-medium text-slate-300">S.Y. {profile.schoolYear}</span>
            </p>
          </div>
        </div>

        {/* Conflict Detection Status & Live Badge */}
        <div className="flex items-center gap-2">
          <button
            id="btn-conflict-drawer"
            onClick={onOpenConflictDrawer}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm cursor-pointer ${
              criticalCount > 0
                ? 'bg-rose-500/15 text-rose-300 border border-rose-500/40 hover:bg-rose-500/25 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                : warningCount > 0
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 hover:bg-amber-500/25 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/25 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
            }`}
          >
            {criticalCount > 0 ? (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
            ) : warningCount > 0 ? (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
            <span>
              {criticalCount > 0
                ? `${criticalCount} Clash${criticalCount > 1 ? 'es' : ''} Detected`
                : warningCount > 0
                ? `${warningCount} Schedule Warning${warningCount > 1 ? 's' : ''}`
                : '0 Conflicts • All Valid'}
            </span>
          </button>

          {/* Term Switcher */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-lg border border-slate-800 text-xs">
            <select
              value={profile.curriculumType}
              onChange={(e) => {
                const newType = e.target.value as 'DEPED_SEMESTRAL' | 'TRIMESTER';
                onUpdateProfile({
                  curriculumType: newType,
                  activeTerm: newType === 'TRIMESTER' ? 'Trimester 1' : '1st Semester'
                });
              }}
              className="bg-slate-800 text-slate-200 font-medium py-1 px-2 rounded-md border border-slate-700/60 focus:ring-1 focus:ring-indigo-500 text-xs mr-1 cursor-pointer"
            >
              <option value="DEPED_SEMESTRAL">DepEd MATATAG / Semestral</option>
              <option value="TRIMESTER">Trimester System</option>
            </select>

            <select
              value={profile.activeTerm}
              onChange={(e) => onUpdateProfile({ activeTerm: e.target.value })}
              className="bg-indigo-950/80 text-indigo-300 font-bold py-1 px-2 rounded-md border border-indigo-800/80 focus:ring-1 focus:ring-indigo-500 text-xs cursor-pointer"
            >
              {termOptions.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Navigation & Action Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* View Switcher Tabs */}
        <div className="flex items-center space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-inner">
          <button
            id="tab-view-section"
            onClick={() => onChangeView('section')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeView === 'section'
                ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(79,70,229,0.4)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Section / Class View</span>
          </button>
          <button
            id="tab-view-teacher"
            onClick={() => onChangeView('teacher')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeView === 'teacher'
                ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(79,70,229,0.4)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Teacher Load & Program</span>
          </button>
          <button
            id="tab-view-room"
            onClick={() => onChangeView('room')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeView === 'room'
                ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(79,70,229,0.4)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Rooms & Facilities</span>
          </button>
          <button
            id="tab-view-master"
            onClick={() => onChangeView('master')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeView === 'master'
                ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(79,70,229,0.4)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Master Matrix</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Detect & Resolve Conflicts Action Button */}
          <button
            id="btn-detect-resolve-conflicts"
            onClick={onOpenConflictDrawer}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95 ${
              criticalCount > 0
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-[0_0_15px_rgba(225,29,72,0.35)]'
                : warningCount > 0
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-[0_0_15px_rgba(217,119,6,0.35)]'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
            title="Detect schedule clashes and solve with AI or manual controls"
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${criticalCount > 0 ? 'animate-bounce' : 'text-amber-400'}`} />
            <span>
              {criticalCount > 0 ? `Detect Conflicts (${criticalCount})` : 'Detect & Resolve Conflicts'}
            </span>
          </button>

          <button
            id="btn-auto-schedule"
            onClick={onAutoSchedule}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-lg text-xs font-bold shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all cursor-pointer active:scale-95"
            title="Automatically assign conflict-free time slots based on DepEd curriculum"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Auto-Schedule</span>
          </button>

          <button
            id="btn-add-slot"
            onClick={onOpenAddSlotModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-all border border-slate-700/80 cursor-pointer"
            title="Add a manual timetable slot to the schedule"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span>Add Slot</span>
          </button>

          {/* Primary Manual Data Entry Option for Teachers, Subjects, Time, Grade Level & Sections */}
          <button
            id="btn-manual-data-entry"
            onClick={() => onOpenEntitiesModal('TEACHERS')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-700/90 to-teal-700/90 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg text-xs font-bold border border-emerald-500/40 shadow-sm transition-all cursor-pointer active:scale-95"
            title="Manually add/edit teachers, subjects, daily time periods, grade levels and sections"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-300" />
            <span>Add / Manage Data Manually</span>
          </button>

          <button
            id="btn-manage-time-periods"
            onClick={() => onOpenEntitiesModal('TIME')}
            className="flex items-center gap-1 px-2.5 py-1.5 text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            title="Configure Daily Time Periods & Bell Schedule"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Time Periods</span>
          </button>

          <button
            id="btn-manage-curriculum"
            onClick={() => onOpenEntitiesModal('SUBJECTS')}
            className="flex items-center gap-1 px-2.5 py-1.5 text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            title="Configure Subjects & Learning Areas"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Subjects</span>
          </button>

          <button
            id="btn-manage-entities"
            onClick={() => onOpenEntitiesModal('SECTIONS')}
            className="flex items-center gap-1 px-2.5 py-1.5 text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            title="Manage Grade Levels, Sections & Faculty"
          >
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>Sections & Teachers</span>
          </button>

          <button
            id="btn-sf7-print"
            onClick={onOpenSF7Modal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            title="Generate official DepEd School Form 7 & Class Program document"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            <span>DepEd Form SF7</span>
          </button>

          {/* Download & Export Schedule Dropdown */}
          <div className="relative" ref={downloadDropdownRef}>
            <button
              id="btn-download-schedule-dropdown"
              type="button"
              onClick={() => setIsDownloadOpen(prev => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer active:scale-95"
              title="Download Schedule as Excel (.xlsx), PDF (.pdf), or CSV (.csv)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Schedule</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isDownloadOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDownloadOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl z-50 p-2 space-y-1 backdrop-blur-lg animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Download Options
                </div>

                {/* Option 1: Excel (.xlsx) */}
                <button
                  type="button"
                  id="btn-download-excel"
                  onClick={() => {
                    setIsDownloadOpen(false);
                    onDownloadExcel();
                  }}
                  className="w-full flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-800/80 transition-colors text-left group cursor-pointer"
                >
                  <div className="p-1.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 group-hover:bg-emerald-500/25 shrink-0 mt-0.5">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-100 group-hover:text-white">Excel Workbook</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">.XLSX</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                      Master Timetable, Section Schedules & SF7 Workloads
                    </p>
                  </div>
                </button>

                {/* Option 2: PDF (.pdf) */}
                <button
                  type="button"
                  id="btn-download-pdf"
                  onClick={() => {
                    setIsDownloadOpen(false);
                    onDownloadPdf();
                  }}
                  className="w-full flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-800/80 transition-colors text-left group cursor-pointer"
                >
                  <div className="p-1.5 rounded-md bg-rose-500/15 text-rose-400 border border-rose-500/30 group-hover:bg-rose-500/25 shrink-0 mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-100 group-hover:text-white">Official DepEd PDF</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300">.PDF</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                      Class Program document with letterhead & sign-offs
                    </p>
                  </div>
                </button>

                {/* Option 3: CSV (.csv) */}
                <button
                  type="button"
                  id="btn-download-csv"
                  onClick={() => {
                    setIsDownloadOpen(false);
                    onDownloadCsv();
                  }}
                  className="w-full flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-800/80 transition-colors text-left group cursor-pointer"
                >
                  <div className="p-1.5 rounded-md bg-sky-500/15 text-sky-400 border border-sky-500/30 group-hover:bg-sky-500/25 shrink-0 mt-0.5">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-100 group-hover:text-white">CSV Data Table</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300">.CSV</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                      Comma-separated data for DepEd LIS & spreadsheets
                    </p>
                  </div>
                </button>

                {/* Option 4: JSON Backup (.json) */}
                <button
                  type="button"
                  id="btn-download-json"
                  onClick={() => {
                    setIsDownloadOpen(false);
                    onExportJson();
                  }}
                  className="w-full flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-800/80 transition-colors text-left group cursor-pointer"
                >
                  <div className="p-1.5 rounded-md bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 group-hover:bg-indigo-500/25 shrink-0 mt-0.5">
                    <FileCode className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-100 group-hover:text-white">System Backup</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">.JSON</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                      Full raw backup of entities, slots & periods
                    </p>
                  </div>
                </button>

                <div className="pt-1 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDownloadOpen(false);
                      onOpenExportModal();
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-950/40 hover:bg-indigo-950/70 rounded-lg transition-colors cursor-pointer border border-indigo-500/30"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Custom Scope & Export Settings...</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Backup & Reset Menu */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs transition-colors cursor-pointer"
              title="Import Schedule Data (JSON)"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={onImportJson}
              className="hidden"
            />

            <button
              onClick={onResetToDemo}
              className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-900/80 hover:bg-rose-950/40 border border-slate-800 rounded-lg text-xs transition-colors cursor-pointer"
              title="Reset to Sample DepEd School Data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

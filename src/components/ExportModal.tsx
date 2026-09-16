import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  FileCode, 
  Layers, 
  Check, 
  School,
  Calendar,
  Users
} from 'lucide-react';
import { SchoolProfile, Teacher, Section, Room, SubjectItem, ScheduleSlot, TimePeriod } from '../types';
import { 
  exportScheduleAsExcel, 
  exportScheduleAsPdf, 
  exportScheduleAsCsv, 
  exportScheduleAsJson, 
  downloadJsonFile 
} from '../utils/exporter';

export type ExportFormat = 'EXCEL' | 'PDF' | 'CSV' | 'JSON';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: SchoolProfile;
  teachers: Teacher[];
  sections: Section[];
  rooms: Room[];
  subjects: SubjectItem[];
  slots: ScheduleSlot[];
  timePeriods: TimePeriod[];
  initialFormat?: ExportFormat;
  initialSectionId?: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  profile,
  teachers,
  sections,
  rooms,
  subjects,
  slots,
  timePeriods,
  initialFormat = 'EXCEL',
  initialSectionId
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(initialFormat);
  const [scope, setScope] = useState<'ALL' | 'SINGLE'>('ALL');
  const [targetSectionId, setTargetSectionId] = useState<string>(initialSectionId || sections[0]?.id || '');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExecuteExport = () => {
    setIsExporting(true);
    setExportSuccess(null);

    try {
      const filterSec = scope === 'SINGLE' ? targetSectionId : undefined;

      if (selectedFormat === 'EXCEL') {
        exportScheduleAsExcel(
          profile,
          teachers,
          sections,
          rooms,
          subjects,
          slots,
          timePeriods,
          profile.activeTerm,
          filterSec
        );
        setExportSuccess('Excel (.xlsx) workbook downloaded successfully!');
      } else if (selectedFormat === 'PDF') {
        exportScheduleAsPdf(
          profile,
          teachers,
          sections,
          rooms,
          subjects,
          slots,
          timePeriods,
          profile.activeTerm,
          filterSec
        );
        setExportSuccess('DepEd Official Class Program (.pdf) generated successfully!');
      } else if (selectedFormat === 'CSV') {
        exportScheduleAsCsv(
          profile,
          teachers,
          sections,
          rooms,
          subjects,
          slots,
          profile.activeTerm,
          filterSec
        );
        setExportSuccess('CSV spreadsheet file (.csv) downloaded successfully!');
      } else if (selectedFormat === 'JSON') {
        const jsonStr = exportScheduleAsJson(
          profile,
          teachers,
          sections,
          rooms,
          subjects,
          slots,
          timePeriods
        );
        const filename = `${profile.schoolName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 25)}_Backup.json`;
        downloadJsonFile(jsonStr, filename);
        setExportSuccess('JSON database backup (.json) downloaded successfully!');
      }
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to generate export file. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const activeSlotsCount = slots.filter(s => !s.term || s.term === profile.activeTerm).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Download & Export Generated Schedule
              </h2>
              <p className="text-xs text-slate-400">
                {profile.schoolName} • ID: {profile.schoolId} • {profile.activeTerm}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Format Selection Cards */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
              1. Select Export Format
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Excel Card */}
              <button
                type="button"
                onClick={() => setSelectedFormat('EXCEL')}
                className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedFormat === 'EXCEL'
                    ? 'bg-emerald-950/40 border-emerald-500/80 ring-1 ring-emerald-500/50 shadow-lg shadow-emerald-950/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-sm text-white">Excel Spreadsheet</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      .XLSX
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Formatted multi-sheet workbook with Master Schedule, Class Program Timetables, and SF7 Faculty Workloads.
                  </p>
                </div>
              </button>

              {/* PDF Card */}
              <button
                type="button"
                onClick={() => setSelectedFormat('PDF')}
                className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedFormat === 'PDF'
                    ? 'bg-rose-950/40 border-rose-500/80 ring-1 ring-rose-500/50 shadow-lg shadow-rose-950/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="p-2.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-sm text-white">Printable Document</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      .PDF
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Official DepEd-formatted landscape document with school letterhead, timetable grid, and signature blocks.
                  </p>
                </div>
              </button>

              {/* CSV Card */}
              <button
                type="button"
                onClick={() => setSelectedFormat('CSV')}
                className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedFormat === 'CSV'
                    ? 'bg-sky-950/40 border-sky-500/80 ring-1 ring-sky-500/50 shadow-lg shadow-sky-950/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="p-2.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-sm text-white">CSV Data Table</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      .CSV
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Standard comma-separated table with UTF-8 BOM, perfect for Google Sheets, DepEd LIS, or school databases.
                  </p>
                </div>
              </button>

              {/* JSON Backup Card */}
              <button
                type="button"
                onClick={() => setSelectedFormat('JSON')}
                className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedFormat === 'JSON'
                    ? 'bg-indigo-950/40 border-indigo-500/80 ring-1 ring-indigo-500/50 shadow-lg shadow-indigo-950/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="p-2.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
                  <FileCode className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-sm text-white">System Backup</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      .JSON
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Complete raw backup of all school settings, teachers, sections, time periods, and scheduled timetable slots.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Scope Selection */}
          {selectedFormat !== 'JSON' && (
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-3">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                2. Choose Schedule Scope
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    scope === 'ALL'
                      ? 'bg-indigo-950/30 border-indigo-500/60 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="exportScope"
                    checked={scope === 'ALL'}
                    onChange={() => setScope('ALL')}
                    className="accent-indigo-600"
                  />
                  <div>
                    <div className="font-semibold text-xs text-slate-100 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      All Sections ({sections.length} Sections)
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Includes entire school program across Grades 7 to 12
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    scope === 'SINGLE'
                      ? 'bg-indigo-950/30 border-indigo-500/60 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="exportScope"
                    checked={scope === 'SINGLE'}
                    onChange={() => setScope('SINGLE')}
                    className="accent-indigo-600"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-xs text-slate-100 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      Single Section Only
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Download schedule for one specific advisory class
                    </p>
                  </div>
                </label>
              </div>

              {scope === 'SINGLE' && (
                <div className="pt-2 animate-in fade-in duration-150">
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Select Target Section:
                  </label>
                  <select
                    value={targetSectionId}
                    onChange={(e) => setTargetSectionId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    {sections.map(s => (
                      <option key={s.id} value={s.id}>
                        Grade {s.gradeLevel} - {s.name} ({s.strand || 'General'})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Export File Summary Box */}
          <div className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-xl flex items-start gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0 mt-0.5">
              <School className="w-4 h-4" />
            </div>
            <div className="text-xs space-y-1">
              <div className="font-semibold text-slate-200">
                Summary of Export Contents:
              </div>
              <div className="text-slate-400">
                • Target Institution: <span className="text-slate-300">{profile.schoolName}</span> (School ID: {profile.schoolId})
              </div>
              <div className="text-slate-400">
                • Active Term: <span className="text-slate-300">{profile.activeTerm}</span> ({profile.schoolYear})
              </div>
              <div className="text-slate-400">
                • Slots Included: <span className="text-slate-300 font-mono">{activeSlotsCount} scheduled class periods</span>
              </div>
              <div className="text-slate-400">
                • Faculty & Workload: <span className="text-slate-300">{teachers.length} teachers evaluated with DepEd SF7 formulas</span>
              </div>
            </div>
          </div>

          {/* Success Notification */}
          {exportSuccess && (
            <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in duration-200">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{exportSuccess}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Ready to generate {selectedFormat} file</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              id="btn-download-export-confirm"
              onClick={handleExecuteExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-lg shadow-lg shadow-indigo-600/30 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Generating...' : `Download as ${selectedFormat}`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

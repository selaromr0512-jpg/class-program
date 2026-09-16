import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  BookOpen, 
  Edit2, 
  Trash2, 
  Check, 
  Clock, 
  Sparkles,
  Layers
} from 'lucide-react';
import { SubjectItem, EducationLevel, GradeLevel, SHSStrand } from '../types';

interface CurriculumManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: SubjectItem[];
  onAddSubject: (subject: SubjectItem) => void;
  onUpdateSubject: (subject: SubjectItem) => void;
  onDeleteSubject: (subjectId: string) => void;
}

export const CurriculumManagerModal: React.FC<CurriculumManagerModalProps> = ({
  isOpen,
  onClose,
  subjects,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [editingSubject, setEditingSubject] = useState<SubjectItem | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [level, setLevel] = useState<EducationLevel>('JHS');
  const [gradeLevels, setGradeLevels] = useState<GradeLevel[]>(['Grade 7']);
  const [strand, setStrand] = useState<SHSStrand>('None');
  const [category, setCategory] = useState<SubjectItem['category']>('JHS-MATATAG');
  const [weeklyMinutes, setWeeklyMinutes] = useState(240);
  const [sessionDuration, setSessionDuration] = useState(60);
  const [preferredRoomType, setPreferredRoomType] = useState<SubjectItem['preferredRoomType']>('Lecture');
  const [color, setColor] = useState('#3B82F6');

  if (!isOpen) return null;

  const filteredSubjects = subjects.filter(s => {
    if (activeCategory === 'ALL') return true;
    if (activeCategory === 'JHS') return s.level === 'JHS';
    if (activeCategory === 'SHS') return s.level === 'SHS';
    if (activeCategory === 'TRIMESTER') return s.category === 'Trimester-Unit';
    return s.category === activeCategory;
  });

  const handleStartAdd = () => {
    setIsAdding(true);
    setEditingSubject(null);
    setCode('');
    setName('');
    setLevel('JHS');
    setGradeLevels(['Grade 7']);
    setStrand('None');
    setCategory('JHS-MATATAG');
    setWeeklyMinutes(240);
    setSessionDuration(60);
    setPreferredRoomType('Lecture');
    setColor('#3B82F6');
  };

  const handleStartEdit = (sub: SubjectItem) => {
    setEditingSubject(sub);
    setIsAdding(true);
    setCode(sub.code);
    setName(sub.name);
    setLevel(sub.level);
    setGradeLevels(sub.gradeLevels);
    setStrand(sub.strand || 'None');
    setCategory(sub.category);
    setWeeklyMinutes(sub.weeklyMinutesRequired);
    setSessionDuration(sub.sessionDurationMinutes);
    setPreferredRoomType(sub.preferredRoomType || 'Lecture');
    setColor(sub.color);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) {
      alert('Please provide subject code and title.');
      return;
    }

    const newSub: SubjectItem = {
      id: editingSubject ? editingSubject.id : `sub-custom-${Date.now()}`,
      code: code.toUpperCase().trim(),
      name: name.trim(),
      level,
      gradeLevels,
      strand: strand !== 'None' ? strand : undefined,
      category,
      weeklyMinutesRequired: Number(weeklyMinutes),
      sessionDurationMinutes: Number(sessionDuration),
      preferredRoomType,
      color
    };

    if (editingSubject) {
      onUpdateSubject(newSub);
    } else {
      onAddSubject(newSub);
    }

    setIsAdding(false);
    setEditingSubject(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#0f172a] rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[85vh] text-slate-100">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.3)] text-white">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base">
                DepEd Curriculum & Subject Matrix Manager
              </h2>
              <p className="text-xs text-slate-400">
                Configure MATATAG Junior High, SHS Academic/TVL Tracks, and Trimester subjects.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isAdding && (
              <button
                onClick={handleStartAdd}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Subject</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        {!isAdding && (
          <div className="p-3 border-b border-slate-800 bg-[#0f172a] flex items-center gap-2 flex-wrap text-xs">
            <button
              onClick={() => setActiveCategory('ALL')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                activeCategory === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
              }`}
            >
              All Subjects ({subjects.length})
            </button>
            <button
              onClick={() => setActiveCategory('JHS')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                activeCategory === 'JHS' ? 'bg-blue-600 text-white' : 'bg-blue-950/40 text-blue-300 hover:bg-blue-900/60 border border-blue-800/40'
              }`}
            >
              Junior High MATATAG
            </button>
            <button
              onClick={() => setActiveCategory('SHS')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                activeCategory === 'SHS' ? 'bg-emerald-600 text-white' : 'bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60 border border-emerald-800/40'
              }`}
            >
              Senior High (Core/Tracks)
            </button>
            <button
              onClick={() => setActiveCategory('TRIMESTER')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                activeCategory === 'TRIMESTER' ? 'bg-purple-600 text-white' : 'bg-purple-950/40 text-purple-300 hover:bg-purple-900/60 border border-purple-800/40'
              }`}
            >
              Trimester Intensive Blocks
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {isAdding ? (
            // Add / Edit Subject Form
            <form onSubmit={handleSaveForm} className="space-y-4 max-w-2xl mx-auto">
              <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-2">
                {editingSubject ? 'Edit Curriculum Subject' : 'Add New Curriculum Subject'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Subject Code *</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. MATH7, PRECALC"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-bold font-mono uppercase text-slate-100 focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">Subject Full Title *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. English 7 (Language & Literature)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-medium text-slate-100 focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Education Level</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as EducationLevel)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-100 cursor-pointer"
                  >
                    <option value="JHS">Junior High School (JHS)</option>
                    <option value="SHS">Senior High School (SHS)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-100 cursor-pointer"
                  >
                    <option value="JHS-MATATAG">JHS MATATAG</option>
                    <option value="Core">SHS Core</option>
                    <option value="Applied">SHS Applied</option>
                    <option value="Specialized">SHS Specialized</option>
                    <option value="Trimester-Unit">Trimester Unit</option>
                    <option value="Institutional">Institutional / Homeroom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">SHS Elective Track</label>
                  <select
                    value={strand}
                    onChange={(e) => setStrand(e.target.value as SHSStrand)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 cursor-pointer"
                  >
                    <option value="None">None (General / Core / JHS)</option>
                    <option value="ACADEMIC ELECTIVES">ACADEMIC ELECTIVES</option>
                    <option value="TECHPRO ELECTIVE">TECHPRO ELECTIVE</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Weekly Minutes Required</label>
                  <input
                    type="number"
                    value={weeklyMinutes}
                    onChange={(e) => setWeeklyMinutes(Number(e.target.value))}
                    step={10}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Block Duration (Mins)</label>
                  <input
                    type="number"
                    value={sessionDuration}
                    onChange={(e) => setSessionDuration(Number(e.target.value))}
                    step={5}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Facility Required</label>
                  <select
                    value={preferredRoomType}
                    onChange={(e) => setPreferredRoomType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 cursor-pointer"
                  >
                    <option value="Lecture">Standard Lecture Room</option>
                    <option value="ScienceLab">Science Laboratory</option>
                    <option value="ComputerLab">Computer Laboratory</option>
                    <option value="Gym">Gymnasium / Court</option>
                    <option value="AudioVisual">Audio-Visual Hall</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => { setIsAdding(false); setEditingSubject(null); }}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md cursor-pointer"
                >
                  {editingSubject ? 'Save Changes' : 'Create Subject'}
                </button>
              </div>
            </form>
          ) : (
            // Subjects Table
            <div className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredSubjects.map(sub => (
                  <div
                    key={sub.id}
                    className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 shadow-sm hover:border-slate-700 transition-all flex items-center justify-between"
                  >
                    <div className="space-y-1 max-w-[75%]">
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-3 h-3 rounded-full shrink-0" 
                          style={{ backgroundColor: sub.color }} 
                        />
                        <span className="font-bold text-white text-xs font-mono">{sub.code}</span>
                        <span className="bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                          {sub.category}
                        </span>
                        {sub.strand && (
                          <span className="bg-blue-950/60 text-blue-300 border border-blue-800/40 px-1.5 py-0.5 rounded text-[10px] font-bold">
                            {sub.strand}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-200 font-medium truncate">
                        {sub.name}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2">
                        <span>{sub.weeklyMinutesRequired} mins/wk ({sub.weeklyMinutesRequired / 60} hrs)</span>
                        <span>•</span>
                        <span>{sub.preferredRoomType}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEdit(sub)}
                        className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg cursor-pointer"
                        title="Edit Subject"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteSubject(sub.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 rounded-lg cursor-pointer"
                        title="Delete Subject"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

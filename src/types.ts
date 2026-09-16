export type GradeLevel = 'Grade 7' | 'Grade 8' | 'Grade 9' | 'Grade 10' | 'Grade 11' | 'Grade 12';
export type EducationLevel = 'JHS' | 'SHS';
export type SHSStrand = 'ACADEMIC ELECTIVES' | 'TECHPRO ELECTIVE' | 'None';

export type TermSystem = 'DEPED_SEMESTRAL' | 'TRIMESTER';

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

export interface TimePeriod {
  id: string;
  label: string;
  startTime: string; // "07:30" (24h format HH:MM)
  endTime: string;   // "08:30" (24h format HH:MM)
  isBreak?: boolean;
}

export interface SubjectItem {
  id: string;
  code: string;
  name: string;
  level: EducationLevel;
  gradeLevels: GradeLevel[];
  strand?: SHSStrand;
  category: 'Core' | 'Applied' | 'Specialized' | 'JHS-MATATAG' | 'Trimester-Unit' | 'Institutional';
  weeklyMinutesRequired: number; // e.g., 240 mins (4 hrs) or 200 mins
  sessionDurationMinutes: number; // standard block (e.g., 45m, 60m, 80m, 120m)
  preferredRoomType?: 'Lecture' | 'ScienceLab' | 'ComputerLab' | 'HE_Room' | 'Gym' | 'AudioVisual';
  color: string; // Tailwind color token or hex
}

export interface Teacher {
  id: string;
  name: string;
  employeeId: string;
  title: string; // e.g. "Master Teacher I", "Teacher III"
  specializations: string[]; // Subject codes or categories
  advisorySectionId?: string; // Section they advise
  maxWeeklyMinutes: number; // Standard DepEd: 30 hours = 1800 minutes (6 hrs/day * 5 days)
  color: string;
  avatarUrl?: string;
}

export interface Section {
  id: string;
  name: string; // e.g. "Diamond", "Rizal", "Newton", "Tesla"
  gradeLevel: GradeLevel;
  level: EducationLevel;
  strand?: SHSStrand;
  adviserTeacherId?: string;
  roomDefaultId?: string;
  studentCount: number;
  shift?: 'Morning' | 'Afternoon' | 'Whole Day';
}

export interface Room {
  id: string;
  name: string; // e.g. "Room 201", "Biology Lab", "Mac Lab"
  code: string;
  type: 'Lecture' | 'ScienceLab' | 'ComputerLab' | 'HE_Room' | 'Gym' | 'AudioVisual';
  capacity: number;
  building: string;
}

export interface ScheduleSlot {
  id: string;
  sectionId: string;
  subjectId: string;
  teacherId: string;
  roomId: string;
  day: DayOfWeek;
  startTime: string; // "07:30" (24h format HH:MM)
  endTime: string;   // "08:30" (24h format HH:MM)
  term: string;      // "1st Semester" | "2nd Semester" | "Trimester 1" | "Trimester 2" | "Trimester 3"
  isBreak?: boolean; // For flag ceremony, recess, lunch
  breakTitle?: string;
}

export type ConflictSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export type ConflictType = 
  | 'TEACHER_DOUBLE_BOOKED'
  | 'ROOM_DOUBLE_BOOKED'
  | 'SECTION_DOUBLE_BOOKED'
  | 'TEACHER_MAX_LOAD_EXCEEDED'
  | 'TEACHER_CONSECUTIVE_LOAD_HIGH'
  | 'ROOM_TYPE_MISMATCH'
  | 'CURRICULUM_HOURS_INSUFFICIENT'
  | 'CURRICULUM_HOURS_EXCEEDED'
  | 'OUTSIDE_SCHOOL_HOURS';

export interface ScheduleConflict {
  id: string;
  type: ConflictType;
  severity: ConflictSeverity;
  title: string;
  description: string;
  day?: DayOfWeek;
  timeRange?: string;
  affectedSlotIds: string[];
  teacherId?: string;
  sectionId?: string;
  roomId?: string;
  subjectId?: string;
  suggestedFix?: string;
}

export interface SchoolProfile {
  schoolName: string;
  schoolId: string;
  division: string;
  region: string;
  schoolYear: string;
  principalName: string;
  curriculumType: TermSystem;
  activeTerm: string;
}

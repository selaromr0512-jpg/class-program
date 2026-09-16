import { Teacher, Section, Room, ScheduleSlot, SchoolProfile } from '../types';

export const INITIAL_SCHOOL_PROFILE: SchoolProfile = {
  schoolName: 'Malasila National Vocational and Technological High School',
  schoolId: '304469',
  division: 'Division of Cotabato',
  region: 'Region XII (SOCCSKSARGEN)',
  schoolYear: '2026-2027',
  principalName: 'Dr. Remedios C. Mendoza, CESO V',
  curriculumType: 'DEPED_SEMESTRAL',
  activeTerm: '1st Semester'
};

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 't-1',
    name: 'Mr. Juan Dela Cruz',
    employeeId: 'DEPED-T-100234',
    title: 'Master Teacher II',
    specializations: ['MATH7', 'MATH10', 'GENMATH', 'PRECALC', 'BUSMATH'],
    advisorySectionId: 'sec-7-pearl',
    maxWeeklyMinutes: 1800, // 30 hours (6 hrs/day)
    color: '#059669', // emerald
  },
  {
    id: 't-2',
    name: 'Ms. Maria Santos',
    employeeId: 'DEPED-T-100452',
    title: 'Teacher III',
    specializations: ['ENG7', 'ENG10', 'ORALCOMM', 'EAPP'],
    advisorySectionId: 'sec-11-acad',
    maxWeeklyMinutes: 1800,
    color: '#2563EB', // blue
  },
  {
    id: 't-3',
    name: 'Dr. Roberto Reyes',
    employeeId: 'DEPED-T-100789',
    title: 'Master Teacher I',
    specializations: ['SCI7', 'SCI10', 'EARTHSCI', 'GENBIO1', 'GENPHYS1'],
    advisorySectionId: 'sec-10-rizal',
    maxWeeklyMinutes: 1800,
    color: '#7C3AED', // purple
  },
  {
    id: 't-4',
    name: 'Mrs. Corazon Aquino-Ramos',
    employeeId: 'DEPED-T-100112',
    title: 'Teacher III',
    specializations: ['FIL7', 'FIL10', 'KOMFIL'],
    advisorySectionId: 'sec-7-diamond',
    maxWeeklyMinutes: 1800,
    color: '#D97706', // amber
  },
  {
    id: 't-5',
    name: 'Mr. Antonio Luna',
    employeeId: 'DEPED-T-100667',
    title: 'Teacher II',
    specializations: ['AP7', 'AP10', 'UCSP', 'POLGOV', 'DISS'],
    advisorySectionId: 'sec-12-acad',
    maxWeeklyMinutes: 1800,
    color: '#DB2777', // pink
  },
  {
    id: 't-6',
    name: 'Coach Fernando Poe Jr.',
    employeeId: 'DEPED-T-100889',
    title: 'Teacher I',
    specializations: ['MAPEH7', 'MAPEH10', 'HOPE1'],
    maxWeeklyMinutes: 1800,
    color: '#EA580C', // orange
  },
  {
    id: 't-7',
    name: 'Engr. Teresa Magbanua',
    employeeId: 'DEPED-T-100994',
    title: 'Special Science Teacher I',
    specializations: ['CSS1', 'PROG1', 'EMPTECH', 'TLE7', 'AUTOTECH'],
    advisorySectionId: 'sec-11-techpro',
    maxWeeklyMinutes: 1800,
    color: '#0891B2', // cyan
  },
  {
    id: 't-8',
    name: 'Prof. Apolinario Mabini',
    employeeId: 'DEPED-T-100331',
    title: 'Master Teacher II',
    specializations: ['FABM1', 'BUSMATH', 'ORGMAN', 'PRACRES1', 'DISS'],
    advisorySectionId: 'sec-12-techpro',
    maxWeeklyMinutes: 1800,
    color: '#0D9488', // teal
  },
  {
    id: 't-9',
    name: 'Ms. Gabriela Silang',
    employeeId: 'DEPED-T-100553',
    title: 'Teacher II',
    specializations: ['VE7', 'HG7', 'EAPP', 'ENG7', 'AGRITECH'],
    maxWeeklyMinutes: 1800,
    color: '#4B5563', // slate
  }
];

export const INITIAL_SECTIONS: Section[] = [
  // --- Junior High School Sections ---
  {
    id: 'sec-7-pearl',
    name: 'Grade 7 - Pearl',
    gradeLevel: 'Grade 7',
    level: 'JHS',
    adviserTeacherId: 't-1',
    roomDefaultId: 'r-101',
    studentCount: 45,
    shift: 'Morning'
  },
  {
    id: 'sec-7-diamond',
    name: 'Grade 7 - Diamond',
    gradeLevel: 'Grade 7',
    level: 'JHS',
    adviserTeacherId: 't-4',
    roomDefaultId: 'r-102',
    studentCount: 44,
    shift: 'Morning'
  },
  {
    id: 'sec-10-rizal',
    name: 'Grade 10 - Rizal',
    gradeLevel: 'Grade 10',
    level: 'JHS',
    adviserTeacherId: 't-3',
    roomDefaultId: 'r-201',
    studentCount: 42,
    shift: 'Whole Day'
  },

  // --- Senior High School Sections (Academic Electives & TechPro Elective) ---
  {
    id: 'sec-11-acad',
    name: 'Grade 11 - Academic Electives Archimedes',
    gradeLevel: 'Grade 11',
    level: 'SHS',
    strand: 'ACADEMIC ELECTIVES',
    adviserTeacherId: 't-2',
    roomDefaultId: 'r-301',
    studentCount: 38,
    shift: 'Whole Day'
  },
  {
    id: 'sec-11-techpro',
    name: 'Grade 11 - TechPro Elective Turing',
    gradeLevel: 'Grade 11',
    level: 'SHS',
    strand: 'TECHPRO ELECTIVE',
    adviserTeacherId: 't-7',
    roomDefaultId: 'r-comlab1',
    studentCount: 35,
    shift: 'Whole Day'
  },
  {
    id: 'sec-12-acad',
    name: 'Grade 12 - Academic Electives Socrates',
    gradeLevel: 'Grade 12',
    level: 'SHS',
    strand: 'ACADEMIC ELECTIVES',
    adviserTeacherId: 't-5',
    roomDefaultId: 'r-302',
    studentCount: 40,
    shift: 'Whole Day'
  },
  {
    id: 'sec-12-techpro',
    name: 'Grade 12 - TechPro Elective Tesla',
    gradeLevel: 'Grade 12',
    level: 'SHS',
    strand: 'TECHPRO ELECTIVE',
    adviserTeacherId: 't-8',
    roomDefaultId: 'r-303',
    studentCount: 36,
    shift: 'Whole Day'
  }
];

export const INITIAL_ROOMS: Room[] = [
  { id: 'r-101', name: 'Room 101 (JHS Bldg)', code: 'R101', type: 'Lecture', capacity: 50, building: 'Rizal Academic Hall 1F' },
  { id: 'r-102', name: 'Room 102 (JHS Bldg)', code: 'R102', type: 'Lecture', capacity: 50, building: 'Rizal Academic Hall 1F' },
  { id: 'r-201', name: 'Room 201 (JHS Bldg)', code: 'R201', type: 'Lecture', capacity: 48, building: 'Rizal Academic Hall 2F' },
  { id: 'r-301', name: 'Room 301 (SHS Academic Wing)', code: 'R301', type: 'Lecture', capacity: 45, building: 'Bonifacio Senior High Wing 3F' },
  { id: 'r-302', name: 'Room 302 (SHS Academic Wing)', code: 'R302', type: 'Lecture', capacity: 45, building: 'Bonifacio Senior High Wing 3F' },
  { id: 'r-303', name: 'Room 303 (SHS TechPro Wing)', code: 'R303', type: 'Lecture', capacity: 45, building: 'Bonifacio Senior High Wing 3F' },
  { id: 'r-scilab1', name: 'Integrated Science Lab', code: 'SCI-LAB', type: 'ScienceLab', capacity: 45, building: 'Science & Innovation Complex 1F' },
  { id: 'r-comlab1', name: 'Computer Laboratory 1', code: 'COM-LAB1', type: 'ComputerLab', capacity: 40, building: 'ICT & Tech Building 2F' },
  { id: 'r-gym', name: 'School Gymnasium / Covered Court', code: 'GYM', type: 'Gym', capacity: 200, building: 'Sports & PE Pavilion' },
  { id: 'r-avr', name: 'Audio-Visual Multi-Purpose Hall', code: 'AVR', type: 'AudioVisual', capacity: 120, building: 'Library & Resource Hub' }
];

export const INITIAL_SCHEDULE_SLOTS: ScheduleSlot[] = [
  // ===================== GRADE 7 - PEARL (JHS) =====================
  // Monday
  { id: 'slot-1', sectionId: 'sec-7-pearl', subjectId: 'jhs-eng-7', teacherId: 't-2', roomId: 'r-101', day: 'Monday', startTime: '07:30', endTime: '08:30', term: '1st Semester' },
  { id: 'slot-2', sectionId: 'sec-7-pearl', subjectId: 'jhs-math-7', teacherId: 't-1', roomId: 'r-101', day: 'Monday', startTime: '08:30', endTime: '09:30', term: '1st Semester' },
  { id: 'slot-3', sectionId: 'sec-7-pearl', subjectId: 'jhs-sci-7', teacherId: 't-3', roomId: 'r-scilab1', day: 'Monday', startTime: '09:50', endTime: '10:50', term: '1st Semester' },
  { id: 'slot-4', sectionId: 'sec-7-pearl', subjectId: 'jhs-fil-7', teacherId: 't-4', roomId: 'r-101', day: 'Monday', startTime: '10:50', endTime: '11:50', term: '1st Semester' },
  { id: 'slot-5', sectionId: 'sec-7-pearl', subjectId: 'jhs-ap-7', teacherId: 't-5', roomId: 'r-101', day: 'Monday', startTime: '12:50', endTime: '13:50', term: '1st Semester' },
  { id: 'slot-6', sectionId: 'sec-7-pearl', subjectId: 'jhs-mapeh-7', teacherId: 't-6', roomId: 'r-gym', day: 'Monday', startTime: '13:50', endTime: '14:50', term: '1st Semester' },
  { id: 'slot-7', sectionId: 'sec-7-pearl', subjectId: 'jhs-tle-7', teacherId: 't-7', roomId: 'r-comlab1', day: 'Monday', startTime: '15:10', endTime: '16:10', term: '1st Semester' },

  // Tuesday
  { id: 'slot-8', sectionId: 'sec-7-pearl', subjectId: 'jhs-math-7', teacherId: 't-1', roomId: 'r-101', day: 'Tuesday', startTime: '07:30', endTime: '08:30', term: '1st Semester' },
  { id: 'slot-9', sectionId: 'sec-7-pearl', subjectId: 'jhs-eng-7', teacherId: 't-2', roomId: 'r-101', day: 'Tuesday', startTime: '08:30', endTime: '09:30', term: '1st Semester' },
  { id: 'slot-10', sectionId: 'sec-7-pearl', subjectId: 'jhs-sci-7', teacherId: 't-3', roomId: 'r-scilab1', day: 'Tuesday', startTime: '09:50', endTime: '10:50', term: '1st Semester' },
  { id: 'slot-11', sectionId: 'sec-7-pearl', subjectId: 'jhs-fil-7', teacherId: 't-4', roomId: 'r-101', day: 'Tuesday', startTime: '10:50', endTime: '11:50', term: '1st Semester' },
  { id: 'slot-12', sectionId: 'sec-7-pearl', subjectId: 'jhs-esp-7', teacherId: 't-9', roomId: 'r-101', day: 'Tuesday', startTime: '12:50', endTime: '13:50', term: '1st Semester' },
  { id: 'slot-13', sectionId: 'sec-7-pearl', subjectId: 'jhs-tle-7', teacherId: 't-7', roomId: 'r-comlab1', day: 'Tuesday', startTime: '13:50', endTime: '14:50', term: '1st Semester' },

  // Wednesday
  { id: 'slot-14', sectionId: 'sec-7-pearl', subjectId: 'jhs-eng-7', teacherId: 't-2', roomId: 'r-101', day: 'Wednesday', startTime: '07:30', endTime: '08:30', term: '1st Semester' },
  { id: 'slot-15', sectionId: 'sec-7-pearl', subjectId: 'jhs-math-7', teacherId: 't-1', roomId: 'r-101', day: 'Wednesday', startTime: '08:30', endTime: '09:30', term: '1st Semester' },
  { id: 'slot-16', sectionId: 'sec-7-pearl', subjectId: 'jhs-sci-7', teacherId: 't-3', roomId: 'r-scilab1', day: 'Wednesday', startTime: '09:50', endTime: '10:50', term: '1st Semester' },
  { id: 'slot-17', sectionId: 'sec-7-pearl', subjectId: 'jhs-fil-7', teacherId: 't-4', roomId: 'r-101', day: 'Wednesday', startTime: '10:50', endTime: '11:50', term: '1st Semester' },
  { id: 'slot-18', sectionId: 'sec-7-pearl', subjectId: 'jhs-ap-7', teacherId: 't-5', roomId: 'r-101', day: 'Wednesday', startTime: '12:50', endTime: '13:50', term: '1st Semester' },
  { id: 'slot-19', sectionId: 'sec-7-pearl', subjectId: 'jhs-mapeh-7', teacherId: 't-6', roomId: 'r-gym', day: 'Wednesday', startTime: '13:50', endTime: '14:50', term: '1st Semester' },

  // Thursday
  { id: 'slot-20', sectionId: 'sec-7-pearl', subjectId: 'jhs-math-7', teacherId: 't-1', roomId: 'r-101', day: 'Thursday', startTime: '07:30', endTime: '08:30', term: '1st Semester' },
  { id: 'slot-21', sectionId: 'sec-7-pearl', subjectId: 'jhs-eng-7', teacherId: 't-2', roomId: 'r-101', day: 'Thursday', startTime: '08:30', endTime: '09:30', term: '1st Semester' },
  { id: 'slot-22', sectionId: 'sec-7-pearl', subjectId: 'jhs-sci-7', teacherId: 't-3', roomId: 'r-scilab1', day: 'Thursday', startTime: '09:50', endTime: '10:50', term: '1st Semester' },
  { id: 'slot-23', sectionId: 'sec-7-pearl', subjectId: 'jhs-fil-7', teacherId: 't-4', roomId: 'r-101', day: 'Thursday', startTime: '10:50', endTime: '11:50', term: '1st Semester' },
  { id: 'slot-24', sectionId: 'sec-7-pearl', subjectId: 'jhs-esp-7', teacherId: 't-9', roomId: 'r-101', day: 'Thursday', startTime: '12:50', endTime: '13:50', term: '1st Semester' },

  // Friday
  { id: 'slot-25', sectionId: 'sec-7-pearl', subjectId: 'jhs-hg-7', teacherId: 't-1', roomId: 'r-101', day: 'Friday', startTime: '07:30', endTime: '08:30', term: '1st Semester' },
  { id: 'slot-26', sectionId: 'sec-7-pearl', subjectId: 'jhs-ap-7', teacherId: 't-5', roomId: 'r-101', day: 'Friday', startTime: '08:30', endTime: '09:30', term: '1st Semester' },
  { id: 'slot-27', sectionId: 'sec-7-pearl', subjectId: 'jhs-mapeh-7', teacherId: 't-6', roomId: 'r-gym', day: 'Friday', startTime: '09:50', endTime: '10:50', term: '1st Semester' },
  { id: 'slot-28', sectionId: 'sec-7-pearl', subjectId: 'jhs-tle-7', teacherId: 't-7', roomId: 'r-comlab1', day: 'Friday', startTime: '10:50', endTime: '11:50', term: '1st Semester' },

  // ===================== GRADE 11 - ACADEMIC ELECTIVES (SHS) =====================
  // Monday
  { id: 'slot-shs-1', sectionId: 'sec-11-acad', subjectId: 'shs-genmath-11', teacherId: 't-1', roomId: 'r-301', day: 'Monday', startTime: '09:50', endTime: '10:50', term: '1st Semester' }, // CONFLICT with Mr. Juan Dela Cruz who is in Pearl
  { id: 'slot-shs-2', sectionId: 'sec-11-acad', subjectId: 'shs-oralcomm-11', teacherId: 't-2', roomId: 'r-301', day: 'Monday', startTime: '10:50', endTime: '11:50', term: '1st Semester' },
  { id: 'slot-shs-3', sectionId: 'sec-11-acad', subjectId: 'shs-els-11', teacherId: 't-3', roomId: 'r-scilab1', day: 'Monday', startTime: '12:50', endTime: '13:50', term: '1st Semester' },
  { id: 'slot-shs-4', sectionId: 'sec-11-acad', subjectId: 'shs-precalc-11', teacherId: 't-1', roomId: 'r-301', day: 'Monday', startTime: '13:50', endTime: '14:50', term: '1st Semester' },
  { id: 'slot-shs-5', sectionId: 'sec-11-acad', subjectId: 'shs-genbio1-11', teacherId: 't-3', roomId: 'r-scilab1', day: 'Monday', startTime: '15:10', endTime: '16:10', term: '1st Semester' },

  // Tuesday
  { id: 'slot-shs-6', sectionId: 'sec-11-acad', subjectId: 'shs-precalc-11', teacherId: 't-1', roomId: 'r-301', day: 'Tuesday', startTime: '09:50', endTime: '10:50', term: '1st Semester' },
  { id: 'slot-shs-7', sectionId: 'sec-11-acad', subjectId: 'shs-genbio1-11', teacherId: 't-3', roomId: 'r-scilab1', day: 'Tuesday', startTime: '09:50', endTime: '10:50', term: '1st Semester' }, // CONFLICT: Room and Teacher Lab overlap with Pearl
  { id: 'slot-shs-8', sectionId: 'sec-11-acad', subjectId: 'shs-kom-11', teacherId: 't-4', roomId: 'r-301', day: 'Tuesday', startTime: '12:50', endTime: '13:50', term: '1st Semester' },
  { id: 'slot-shs-9', sectionId: 'sec-11-acad', subjectId: 'shs-eapp-11', teacherId: 't-2', roomId: 'r-301', day: 'Tuesday', startTime: '13:50', endTime: '14:50', term: '1st Semester' },

  // ===================== GRADE 11 - TECHPRO ELECTIVE (SHS) =====================
  // Monday
  { id: 'slot-tech-1', sectionId: 'sec-11-techpro', subjectId: 'shs-prog-11', teacherId: 't-7', roomId: 'r-comlab1', day: 'Monday', startTime: '07:30', endTime: '09:30', term: '1st Semester' },
  { id: 'slot-tech-2', sectionId: 'sec-11-techpro', subjectId: 'shs-emptech-11', teacherId: 't-7', roomId: 'r-comlab1', day: 'Monday', startTime: '09:50', endTime: '11:50', term: '1st Semester' },
  { id: 'slot-tech-3', sectionId: 'sec-11-techpro', subjectId: 'shs-oralcomm-11', teacherId: 't-2', roomId: 'r-303', day: 'Monday', startTime: '12:50', endTime: '13:50', term: '1st Semester' },
  { id: 'slot-tech-4', sectionId: 'sec-11-techpro', subjectId: 'shs-genmath-11', teacherId: 't-1', roomId: 'r-303', day: 'Monday', startTime: '15:10', endTime: '16:10', term: '1st Semester' },

  // ===================== GRADE 12 - ACADEMIC ELECTIVES =====================
  // Monday
  { id: 'slot-g12-1', sectionId: 'sec-12-acad', subjectId: 'shs-fabm1-11', teacherId: 't-8', roomId: 'r-302', day: 'Monday', startTime: '07:30', endTime: '08:30', term: '1st Semester' },
  { id: 'slot-g12-2', sectionId: 'sec-12-acad', subjectId: 'shs-busmath-11', teacherId: 't-8', roomId: 'r-302', day: 'Monday', startTime: '08:30', endTime: '09:30', term: '1st Semester' },
  { id: 'slot-g12-3', sectionId: 'sec-12-acad', subjectId: 'shs-orgman-11', teacherId: 't-8', roomId: 'r-302', day: 'Monday', startTime: '09:50', endTime: '10:50', term: '1st Semester' },
  { id: 'slot-g12-4', sectionId: 'sec-12-acad', subjectId: 'shs-diss-11', teacherId: 't-5', roomId: 'r-302', day: 'Monday', startTime: '13:50', endTime: '14:50', term: '1st Semester' }
];

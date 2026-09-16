import { ScheduleSlot, Teacher, Section, Room, SubjectItem, SchoolProfile, TimePeriod, DayOfWeek } from '../types';
import { timeToMinutes, isTimeOverlap } from './conflictDetector';
import { DAYS_OF_WEEK } from '../data/depedCurriculum';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportScheduleAsJson(
  profile: SchoolProfile,
  teachers: Teacher[],
  sections: Section[],
  rooms: Room[],
  subjects: SubjectItem[],
  slots: ScheduleSlot[],
  timePeriods?: TimePeriod[]
): string {
  const exportData = {
    app: 'DepEd Class Program & Conflict Scheduler',
    version: '2.0',
    exportDate: new Date().toISOString(),
    profile,
    teachers,
    sections,
    rooms,
    subjects,
    timePeriods,
    slots
  };
  return JSON.stringify(exportData, null, 2);
}

export function downloadJsonFile(content: string, filename = 'deped-class-schedule.json') {
  const blob = new Blob([content], { type: 'application/json' });
  triggerDownload(blob, filename);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function computeTeacherWeeklySummary(
  teacher: Teacher,
  slots: ScheduleSlot[],
  activeTerm: string
) {
  const tSlots = slots.filter(s => s.teacherId === teacher.id && (!s.term || s.term === activeTerm) && !s.isBreak);
  let totalMins = 0;
  const daysActive = new Set<string>();

  tSlots.forEach(s => {
    const dur = timeToMinutes(s.endTime) - timeToMinutes(s.startTime);
    if (dur > 0) totalMins += dur;
    daysActive.add(s.day);
  });

  const totalHours = (totalMins / 60).toFixed(1);
  const prepTimeHours = 2.0; // DepEd standard 2 hours prep time
  const totalDutyHours = (parseFloat(totalHours) + prepTimeHours).toFixed(1);

  return {
    assignedLoadsCount: tSlots.length,
    totalMinutes: totalMins,
    totalHours,
    prepTimeHours,
    totalDutyHours,
    daysActiveCount: daysActive.size
  };
}

// -------------------------------------------------------------
// CSV EXPORT
// -------------------------------------------------------------
export function exportScheduleAsCsv(
  profile: SchoolProfile,
  teachers: Teacher[],
  sections: Section[],
  rooms: Room[],
  subjects: SubjectItem[],
  slots: ScheduleSlot[],
  activeTerm: string,
  filterSectionId?: string
) {
  const teacherMap = new Map<string, Teacher>(teachers.map(t => [t.id, t]));
  const sectionMap = new Map<string, Section>(sections.map(s => [s.id, s]));
  const roomMap = new Map<string, Room>(rooms.map(r => [r.id, r]));
  const subjectMap = new Map<string, SubjectItem>(subjects.map(sub => [sub.id, sub]));

  let activeSlots = slots.filter(s => !s.term || s.term === activeTerm);
  if (filterSectionId) {
    activeSlots = activeSlots.filter(s => s.sectionId === filterSectionId);
  }

  // Sort by Day and Start Time
  const dayOrder: Record<DayOfWeek, number> = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5
  };

  activeSlots.sort((a, b) => {
    const dDiff = (dayOrder[a.day] || 99) - (dayOrder[b.day] || 99);
    if (dDiff !== 0) return dDiff;
    return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
  });

  const headers = [
    'School Name',
    'School ID',
    'School Year',
    'Term',
    'Day',
    'Start Time',
    'End Time',
    'Duration (Minutes)',
    'Section Name',
    'Grade Level',
    'Track/Strand',
    'Subject Code',
    'Subject Name',
    'Teacher Name',
    'Employee ID',
    'Teacher Rank',
    'Room Name',
    'Building',
    'Is Break'
  ];

  const escapeCsv = (val: string | number | boolean | undefined | null) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = activeSlots.map(slot => {
    const sec = sectionMap.get(slot.sectionId);
    const sub = subjectMap.get(slot.subjectId);
    const tea = teacherMap.get(slot.teacherId);
    const roo = roomMap.get(slot.roomId);
    const dur = timeToMinutes(slot.endTime) - timeToMinutes(slot.startTime);

    return [
      escapeCsv(profile.schoolName),
      escapeCsv(profile.schoolId),
      escapeCsv(profile.schoolYear),
      escapeCsv(slot.term || activeTerm),
      escapeCsv(slot.day),
      escapeCsv(slot.startTime),
      escapeCsv(slot.endTime),
      escapeCsv(dur),
      escapeCsv(sec?.name || 'Unknown Section'),
      escapeCsv(`Grade ${sec?.gradeLevel || ''}`),
      escapeCsv(sec?.strand || 'General'),
      escapeCsv(sub?.code || (slot.isBreak ? 'BREAK' : 'N/A')),
      escapeCsv(sub?.name || (slot.isBreak ? 'Recess / Lunch' : 'Unassigned')),
      escapeCsv(tea?.name || 'Unassigned'),
      escapeCsv(tea?.employeeId || ''),
      escapeCsv(tea?.title || ''),
      escapeCsv(roo?.name || 'Unassigned'),
      escapeCsv(roo?.building || ''),
      escapeCsv(slot.isBreak ? 'Yes' : 'No')
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const cleanSchool = profile.schoolName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 25);
  const cleanTerm = activeTerm.replace(/\s+/g, '_');
  const filename = `${cleanSchool}_Schedule_${cleanTerm}.csv`;
  
  triggerDownload(blob, filename);
}

// -------------------------------------------------------------
// EXCEL (.XLSX) EXPORT (Multi-Sheet Workbook)
// -------------------------------------------------------------
export function exportScheduleAsExcel(
  profile: SchoolProfile,
  teachers: Teacher[],
  sections: Section[],
  rooms: Room[],
  subjects: SubjectItem[],
  slots: ScheduleSlot[],
  timePeriods: TimePeriod[],
  activeTerm: string,
  filterSectionId?: string
) {
  const teacherMap = new Map<string, Teacher>(teachers.map(t => [t.id, t]));
  const sectionMap = new Map<string, Section>(sections.map(s => [s.id, s]));
  const roomMap = new Map<string, Room>(rooms.map(r => [r.id, r]));
  const subjectMap = new Map<string, SubjectItem>(subjects.map(sub => [sub.id, sub]));

  const workbook = XLSX.utils.book_new();

  // 1. SHEET 1: Master Timetable Slot List
  const dayOrder: Record<DayOfWeek, number> = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5
  };

  let activeSlots = slots.filter(s => !s.term || s.term === activeTerm);
  if (filterSectionId) {
    activeSlots = activeSlots.filter(s => s.sectionId === filterSectionId);
  }

  const sortedSlots = [...activeSlots].sort((a, b) => {
    const dDiff = (dayOrder[a.day] || 99) - (dayOrder[b.day] || 99);
    if (dDiff !== 0) return dDiff;
    return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
  });

  const masterRows = [
    ['DEPED CLASS SCHEDULE MASTER LIST'],
    [`School: ${profile.schoolName} (School ID: ${profile.schoolId})`],
    [`Division: ${profile.division} | Region: ${profile.region}`],
    [`School Year: ${profile.schoolYear} | Term: ${activeTerm} | Principal: ${profile.principalName}`],
    [],
    [
      'Day',
      'Start Time',
      'End Time',
      'Minutes',
      'Section',
      'Grade Level',
      'Track/Strand',
      'Subject Code',
      'Subject Title',
      'Teacher Name',
      'Employee ID',
      'Teacher Rank',
      'Room',
      'Building',
      'Remarks'
    ]
  ];

  sortedSlots.forEach(slot => {
    const sec = sectionMap.get(slot.sectionId);
    const sub = subjectMap.get(slot.subjectId);
    const tea = teacherMap.get(slot.teacherId);
    const roo = roomMap.get(slot.roomId);
    const dur = timeToMinutes(slot.endTime) - timeToMinutes(slot.startTime);

    masterRows.push([
      slot.day,
      slot.startTime,
      slot.endTime,
      String(dur),
      sec?.name || 'N/A',
      sec ? `Grade ${sec.gradeLevel}` : 'N/A',
      sec?.strand || 'General',
      sub?.code || (slot.isBreak ? 'BREAK' : 'N/A'),
      sub?.name || (slot.isBreak ? 'Recess / Lunch' : 'Unassigned'),
      tea?.name || 'Unassigned',
      tea?.employeeId || '',
      tea?.title || '',
      roo?.name || 'Unassigned',
      roo?.building || '',
      slot.isBreak ? 'Recess/Break' : 'Regular Class'
    ]);
  });

  const wsMaster = XLSX.utils.aoa_to_sheet(masterRows);
  // Set column widths
  wsMaster['!cols'] = [
    { wch: 12 }, // Day
    { wch: 11 }, // Start
    { wch: 11 }, // End
    { wch: 10 }, // Minutes
    { wch: 22 }, // Section
    { wch: 13 }, // Grade
    { wch: 15 }, // Strand
    { wch: 15 }, // Sub Code
    { wch: 30 }, // Sub Title
    { wch: 25 }, // Teacher
    { wch: 16 }, // Emp ID
    { wch: 18 }, // Rank
    { wch: 18 }, // Room
    { wch: 18 }, // Building
    { wch: 15 }  // Remarks
  ];
  XLSX.utils.book_append_sheet(workbook, wsMaster, 'Master Timetable');

  // 2. SHEET 2: Class Program Grid (Sections Timetable)
  const targetSections = filterSectionId 
    ? sections.filter(s => s.id === filterSectionId)
    : sections;

  const programRows: (string | number)[][] = [
    ['DEPED OFFICIAL SECTION CLASS PROGRAMS'],
    [`School: ${profile.schoolName} (${profile.schoolId}) - SY ${profile.schoolYear} - ${activeTerm}`],
    []
  ];

  targetSections.forEach(sec => {
    programRows.push([`SECTION: Grade ${sec.gradeLevel} - ${sec.name} (${sec.strand || 'General'})`]);
    programRows.push([`Room: ${roomMap.get(sec.roomDefaultId)?.name || 'Default'} | Adviser: ${teacherMap.get(sec.adviserTeacherId)?.name || 'Unassigned'}`]);
    
    // Header for timetable
    programRows.push(['Time Period', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);

    const secSlots = slots.filter(s => s.sectionId === sec.id && (!s.term || s.term === activeTerm));

    timePeriods.forEach(tp => {
      const row: (string | number)[] = [`${tp.startTime}-${tp.endTime} (${tp.label})`];

      if (tp.isBreak) {
        row.push(tp.label, tp.label, tp.label, tp.label, tp.label);
      } else {
        DAYS_OF_WEEK.forEach(day => {
          const match = secSlots.filter(s => 
            s.day === day && isTimeOverlap(s.startTime, s.endTime, tp.startTime, tp.endTime)
          );
          if (match.length > 0) {
            const cellText = match.map(s => {
              const sub = subjectMap.get(s.subjectId);
              const tea = teacherMap.get(s.teacherId);
              return `${sub?.code || 'Class'} (${tea?.name ? tea.name.split(' ').pop() : 'TBA'})`;
            }).join(' / ');
            row.push(cellText);
          } else {
            row.push('---');
          }
        });
      }
      programRows.push(row);
    });

    programRows.push([]); // blank row between sections
  });

  const wsPrograms = XLSX.utils.aoa_to_sheet(programRows);
  wsPrograms['!cols'] = [
    { wch: 22 },
    { wch: 24 },
    { wch: 24 },
    { wch: 24 },
    { wch: 24 },
    { wch: 24 }
  ];
  XLSX.utils.book_append_sheet(workbook, wsPrograms, 'Class Programs');

  // 3. SHEET 3: DepEd SF7 Faculty Workload Summary
  const sf7Rows: (string | number)[][] = [
    ['DEPED FORM 7 (SF7) - SCHOOL PERSONNEL ASSIGNMENT LIST & TEACHING LOAD'],
    [`School: ${profile.schoolName} | ID: ${profile.schoolId} | Division: ${profile.division}`],
    [`School Year: ${profile.schoolYear} | Active Term: ${activeTerm}`],
    [],
    [
      'Employee ID',
      'Teacher Name',
      'Position / Title',
      'Advisory Section',
      'Assigned Loads',
      'Weekly Teaching (Mins)',
      'Weekly Teaching (Hours)',
      'Prep / Admin Time (Hours)',
      'Total Duty Hours',
      'Max Hours Allowed',
      'Status'
    ]
  ];

  teachers.forEach(teacher => {
    const summary = computeTeacherWeeklySummary(teacher, slots, activeTerm);
    const advSec = sections.find(s => s.adviserTeacherId === teacher.id);
    const maxHours = (teacher.maxWeeklyMinutes / 60).toFixed(1);
    const isOverloaded = summary.totalMinutes > teacher.maxWeeklyMinutes;

    sf7Rows.push([
      teacher.employeeId,
      teacher.name,
      teacher.title,
      advSec ? `Grade ${advSec.gradeLevel} - ${advSec.name}` : 'None',
      summary.assignedLoadsCount,
      summary.totalMinutes,
      summary.totalHours,
      summary.prepTimeHours,
      summary.totalDutyHours,
      maxHours,
      isOverloaded ? 'OVERLOAD' : 'NORMAL'
    ]);
  });

  const wsSf7 = XLSX.utils.aoa_to_sheet(sf7Rows);
  wsSf7['!cols'] = [
    { wch: 16 },
    { wch: 26 },
    { wch: 22 },
    { wch: 24 },
    { wch: 15 },
    { wch: 22 },
    { wch: 22 },
    { wch: 22 },
    { wch: 18 },
    { wch: 18 },
    { wch: 14 }
  ];
  XLSX.utils.book_append_sheet(workbook, wsSf7, 'SF7 Faculty Loads');

  // 4. SHEET 4: Rooms & Facilities Inventory
  const roomRows: (string | number)[][] = [
    ['ROOMS & LEARNING FACILITIES INVENTORY'],
    [`School: ${profile.schoolName} (${profile.schoolId})`],
    [],
    ['Room ID', 'Room Name', 'Building', 'Room Type', 'Capacity (Students)', 'Assigned Home Section']
  ];

  rooms.forEach(r => {
    const assignedSec = sections.find(s => s.roomDefaultId === r.id);
    roomRows.push([
      r.id,
      r.name,
      r.building,
      r.type,
      r.capacity,
      assignedSec ? `Grade ${assignedSec.gradeLevel} - ${assignedSec.name}` : 'Unassigned'
    ]);
  });

  const wsRooms = XLSX.utils.aoa_to_sheet(roomRows);
  wsRooms['!cols'] = [
    { wch: 14 },
    { wch: 24 },
    { wch: 22 },
    { wch: 18 },
    { wch: 20 },
    { wch: 25 }
  ];
  XLSX.utils.book_append_sheet(workbook, wsRooms, 'Rooms & Facilities');

  // Write and download
  const cleanSchool = profile.schoolName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 25);
  const cleanTerm = activeTerm.replace(/\s+/g, '_');
  const filename = `${cleanSchool}_Schedule_${cleanTerm}.xlsx`;

  XLSX.writeFile(workbook, filename);
}

// -------------------------------------------------------------
// PDF EXPORT (DepEd Official Format)
// -------------------------------------------------------------
export function exportScheduleAsPdf(
  profile: SchoolProfile,
  teachers: Teacher[],
  sections: Section[],
  rooms: Room[],
  subjects: SubjectItem[],
  slots: ScheduleSlot[],
  timePeriods: TimePeriod[],
  activeTerm: string,
  filterSectionId?: string
) {
  const teacherMap = new Map<string, Teacher>(teachers.map(t => [t.id, t]));
  const sectionMap = new Map<string, Section>(sections.map(s => [s.id, s]));
  const roomMap = new Map<string, Room>(rooms.map(r => [r.id, r]));
  const subjectMap = new Map<string, SubjectItem>(subjects.map(sub => [sub.id, sub]));

  // Landscape A4 for wide timetable grid
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const targetSections = filterSectionId
    ? sections.filter(s => s.id === filterSectionId)
    : sections;

  targetSections.forEach((sec, index) => {
    if (index > 0) {
      doc.addPage('a4', 'landscape');
    }

    // DepEd Header
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(80, 80, 80);
    doc.text('Republic of the Philippines', pageWidth / 2, 28, { align: 'center' });
    doc.text('Department of Education', pageWidth / 2, 40, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`${profile.region.toUpperCase()} • ${profile.division.toUpperCase()}`, pageWidth / 2, 53, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(15, 76, 129); // DepEd Classic Navy/Blue
    doc.text(profile.schoolName.toUpperCase(), pageWidth / 2, 70, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(70, 70, 70);
    doc.text(`School ID: ${profile.schoolId} | School Year: ${profile.schoolYear} | Term: ${activeTerm}`, pageWidth / 2, 83, { align: 'center' });

    // Section Banner
    doc.setDrawColor(15, 76, 129);
    doc.setLineWidth(1.5);
    doc.line(40, 92, pageWidth - 40, 92);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(`OFFICIAL CLASS PROGRAM: GRADE ${sec.gradeLevel} - ${sec.name.toUpperCase()}`, 40, 107);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    const adviser = teacherMap.get(sec.adviserTeacherId)?.name || 'Unassigned';
    const roomName = roomMap.get(sec.roomDefaultId)?.name || 'Room 101';
    doc.text(`Curriculum/Track: ${sec.strand || 'General / DepEd MATATAG'}  |  Home Room: ${roomName}  |  Class Adviser: ${adviser}`, 40, 120);

    // Timetable Grid Data for AutoTable
    const secSlots = slots.filter(s => s.sectionId === sec.id && (!s.term || s.term === activeTerm));

    const tableHead = [
      ['Time Period', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    ];

    const tableBody = timePeriods.map(tp => {
      const timeLabel = `${tp.startTime} - ${tp.endTime}\n(${tp.label})`;
      if (tp.isBreak) {
        return [timeLabel, tp.label.toUpperCase(), tp.label.toUpperCase(), tp.label.toUpperCase(), tp.label.toUpperCase(), tp.label.toUpperCase()];
      }

      const row = [timeLabel];
      DAYS_OF_WEEK.forEach(day => {
        const matches = secSlots.filter(s => 
          s.day === day && isTimeOverlap(s.startTime, s.endTime, tp.startTime, tp.endTime)
        );
        if (matches.length > 0) {
          const content = matches.map(s => {
            const sub = subjectMap.get(s.subjectId);
            const tea = teacherMap.get(s.teacherId);
            const roo = roomMap.get(s.roomId);
            const tLastName = tea?.name ? tea.name.split(' ').pop() : 'TBA';
            return `${sub?.code || 'SUBJ'}\n${tLastName} (${roo?.name || ''})`;
          }).join('\n---\n');
          row.push(content);
        } else {
          row.push('-');
        }
      });
      return row;
    });

    autoTable(doc, {
      startY: 128,
      head: tableHead,
      body: tableBody,
      theme: 'grid',
      styles: {
        fontSize: 7.5,
        cellPadding: 4,
        halign: 'center',
        valign: 'middle',
        lineColor: [200, 205, 215],
        lineWidth: 0.6
      },
      headStyles: {
        fillColor: [15, 76, 129],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5
      },
      columnStyles: {
        0: { cellWidth: 90, fontStyle: 'bold', fillColor: [245, 247, 250] },
        1: { cellWidth: (pageWidth - 80 - 90) / 5 },
        2: { cellWidth: (pageWidth - 80 - 90) / 5 },
        3: { cellWidth: (pageWidth - 80 - 90) / 5 },
        4: { cellWidth: (pageWidth - 80 - 90) / 5 },
        5: { cellWidth: (pageWidth - 80 - 90) / 5 }
      },
      didParseCell: (data) => {
        // If it's a break row
        const rowIndex = data.row.index;
        const tp = timePeriods[rowIndex];
        if (tp?.isBreak && data.column.index > 0) {
          data.cell.styles.fillColor = [241, 245, 249];
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.textColor = [100, 116, 139];
        }
      },
      margin: { left: 40, right: 40 }
    });

    // Signatures block at bottom
    const finalY = (doc as any).lastAutoTable?.finalY || 440;
    const signY = Math.min(finalY + 30, pageHeight - 65);

    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);

    // Col 1: Class Adviser
    doc.text('Prepared by:', 50, signY);
    doc.setFont('helvetica', 'bold');
    doc.text(adviser.toUpperCase(), 50, signY + 22);
    doc.setFont('helvetica', 'normal');
    doc.text('Class Adviser', 50, signY + 32);

    // Col 2: Curriculum Coordinator
    doc.text('Checked by:', pageWidth / 2 - 60, signY);
    doc.setFont('helvetica', 'bold');
    doc.text('MRS. CORAZON P. VILLANUEVA', pageWidth / 2 - 60, signY + 22);
    doc.setFont('helvetica', 'normal');
    doc.text('Academic / Curriculum Head', pageWidth / 2 - 60, signY + 32);

    // Col 3: Principal
    doc.text('Approved by:', pageWidth - 220, signY);
    doc.setFont('helvetica', 'bold');
    doc.text(profile.principalName.toUpperCase(), pageWidth - 220, signY + 22);
    doc.setFont('helvetica', 'normal');
    doc.text('Secondary School Principal IV / Vocational Admin', pageWidth - 220, signY + 32);
  });

  // Also add SF7 Faculty Assignment sheet page
  doc.addPage('a4', 'landscape');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  doc.text('Republic of the Philippines • Department of Education', pageWidth / 2, 28, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 76, 129);
  doc.text(profile.schoolName.toUpperCase(), pageWidth / 2, 45, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('DEPED FORM 7 (SF7) - SCHOOL PERSONNEL ASSIGNMENT & TEACHING LOAD', pageWidth / 2, 60, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(70, 70, 70);
  doc.text(`School ID: ${profile.schoolId} | SY: ${profile.schoolYear} | Term: ${activeTerm} | Division: ${profile.division}`, pageWidth / 2, 73, { align: 'center' });

  const sf7Headers = [
    ['Emp. ID', 'Teacher Name', 'Rank / Position', 'Advisory Class', 'Weekly Mins', 'Teaching Hrs', 'Prep Hrs', 'Total Duty', 'Status']
  ];

  const sf7Body = teachers.map(teacher => {
    const summary = computeTeacherWeeklySummary(teacher, slots, activeTerm);
    const advSec = sections.find(s => s.adviserTeacherId === teacher.id);
    const isOverloaded = summary.totalMinutes > teacher.maxWeeklyMinutes;

    return [
      teacher.employeeId,
      teacher.name,
      teacher.title,
      advSec ? `Gr. ${advSec.gradeLevel} - ${advSec.name}` : 'None',
      `${summary.totalMinutes} m`,
      `${summary.totalHours} hrs`,
      `${summary.prepTimeHours} hrs`,
      `${summary.totalDutyHours} hrs`,
      isOverloaded ? 'OVERLOAD' : 'COMPLIANT'
    ];
  });

  autoTable(doc, {
    startY: 85,
    head: sf7Headers,
    body: sf7Body,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 4,
      halign: 'center',
      valign: 'middle',
      lineColor: [200, 205, 215]
    },
    headStyles: {
      fillColor: [15, 76, 129],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    margin: { left: 40, right: 40 }
  });

  const cleanSchool = profile.schoolName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 25);
  const cleanTerm = activeTerm.replace(/\s+/g, '_');
  const filename = `${cleanSchool}_ClassProgram_${cleanTerm}.pdf`;

  doc.save(filename);
}

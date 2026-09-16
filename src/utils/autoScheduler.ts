import { ScheduleSlot, Teacher, Section, Room, SubjectItem, DayOfWeek, ScheduleConflict } from '../types';
import { TIME_PERIODS_DEFAULT, DAYS_OF_WEEK } from '../data/depedCurriculum';
import { isTimeOverlap } from './conflictDetector';

export function generateAutoSchedule(
  sections: Section[],
  teachers: Teacher[],
  rooms: Room[],
  subjects: SubjectItem[],
  activeTerm: string
): ScheduleSlot[] {
  const generatedSlots: ScheduleSlot[] = [];
  const teachingPeriods = TIME_PERIODS_DEFAULT.filter(p => !p.isBreak);

  // Helper to test if a proposed slot causes a collision in already generated slots
  function isAvailable(
    teacherId: string,
    roomId: string,
    sectionId: string,
    day: DayOfWeek,
    startTime: string,
    endTime: string
  ): boolean {
    return !generatedSlots.some(slot => {
      if (slot.day !== day) return false;
      const overlaps = isTimeOverlap(slot.startTime, slot.endTime, startTime, endTime);
      if (!overlaps) return false;

      if (slot.teacherId === teacherId) return true;
      if (slot.roomId === roomId) return true;
      if (slot.sectionId === sectionId) return true;
      return false;
    });
  }

  // Find best room for subject
  function getBestRoom(subject: SubjectItem, defaultRoomId?: string): string {
    if (subject.preferredRoomType && subject.preferredRoomType !== 'Lecture') {
      const specialized = rooms.find(r => r.type === subject.preferredRoomType);
      if (specialized) return specialized.id;
    }
    if (defaultRoomId) return defaultRoomId;
    const lecture = rooms.find(r => r.type === 'Lecture');
    return lecture ? lecture.id : rooms[0]?.id || 'r-default';
  }

  // Find best teacher for subject
  function getBestTeacher(subject: SubjectItem): string {
    // 1. Direct specialization match
    const directMatch = teachers.find(t => t.specializations.includes(subject.code));
    if (directMatch) return directMatch.id;

    // 2. Prefix / level match
    const prefix = subject.code.replace(/[0-9]/g, '');
    const partialMatch = teachers.find(t => t.specializations.some(s => s.startsWith(prefix)));
    if (partialMatch) return partialMatch.id;

    return teachers[0]?.id || 't-1';
  }

  // For each section, plan its weekly curriculum schedule
  sections.forEach(section => {
    // Find matching curriculum subjects for this grade & strand
    const sectionSubjects = subjects.filter(sub => {
      const gradeMatches = sub.gradeLevels.includes(section.gradeLevel);
      const strandMatches = !sub.strand || sub.strand === section.strand;
      return gradeMatches && strandMatches;
    });

    // Determine default room
    const defaultRoomId = section.roomDefaultId || rooms[0]?.id;

    // For each subject, schedule the required number of sessions per week
    sectionSubjects.forEach(subject => {
      const sessionCount = Math.max(1, Math.min(5, Math.round(subject.weeklyMinutesRequired / subject.sessionDurationMinutes)));
      const teacherId = getBestTeacher(subject);
      let scheduledForSubject = 0;

      // Distribute across days
      const daysToTry: DayOfWeek[] = [...DAYS_OF_WEEK];
      // Randomize or spread day order slightly to balance
      for (const day of daysToTry) {
        if (scheduledForSubject >= sessionCount) break;

        // Try available time periods
        for (const period of teachingPeriods) {
          const roomToUse = getBestRoom(subject, defaultRoomId);

          if (isAvailable(teacherId, roomToUse, section.id, day, period.startTime, period.endTime)) {
            generatedSlots.push({
              id: `auto-slot-${section.id}-${subject.id}-${day}-${period.id}`,
              sectionId: section.id,
              subjectId: subject.id,
              teacherId,
              roomId: roomToUse,
              day,
              startTime: period.startTime,
              endTime: period.endTime,
              term: activeTerm
            });
            scheduledForSubject++;
            break; // Move to next day for this subject to prevent back-to-back same subject on same day
          }
        }
      }

      // If still not scheduled due to tight constraints, try fallback rooms
      if (scheduledForSubject < sessionCount) {
        for (const day of daysToTry) {
          if (scheduledForSubject >= sessionCount) break;
          for (const period of teachingPeriods) {
            for (const rm of rooms) {
              if (isAvailable(teacherId, rm.id, section.id, day, period.startTime, period.endTime)) {
                generatedSlots.push({
                  id: `auto-slot-fallback-${section.id}-${subject.id}-${day}-${period.id}-${rm.id}`,
                  sectionId: section.id,
                  subjectId: subject.id,
                  teacherId,
                  roomId: rm.id,
                  day,
                  startTime: period.startTime,
                  endTime: period.endTime,
                  term: activeTerm
                });
                scheduledForSubject++;
                break;
              }
            }
          }
        }
      }
    });
  });

  return generatedSlots;
}

export function autoResolveSingleConflict(
  conflict: ScheduleConflict,
  currentSlots: ScheduleSlot[],
  teachers: Teacher[],
  rooms: Room[],
  teachingPeriods = TIME_PERIODS_DEFAULT.filter(p => !p.isBreak)
): ScheduleSlot[] {
  if (!conflict.affectedSlotIds || conflict.affectedSlotIds.length < 2) {
    return currentSlots;
  }

  // The conflicting slot to adjust (the 2nd one in the clash pair)
  const slotToModifyId = conflict.affectedSlotIds[1];
  const targetSlot = currentSlots.find(s => s.id === slotToModifyId);
  if (!targetSlot) return currentSlots;

  const otherSlots = currentSlots.filter(s => s.id !== slotToModifyId);

  // Helper check
  function slotHasConflict(testSlot: ScheduleSlot): boolean {
    return otherSlots.some(s => {
      if (s.day !== testSlot.day) return false;
      if (!isTimeOverlap(s.startTime, s.endTime, testSlot.startTime, testSlot.endTime)) return false;
      if (s.teacherId === testSlot.teacherId) return true;
      if (s.roomId === testSlot.roomId) return true;
      if (s.sectionId === testSlot.sectionId) return true;
      return false;
    });
  }

  if (conflict.type === 'TEACHER_DOUBLE_BOOKED') {
    // Option A: Find alternative period on same day or another day
    for (const day of DAYS_OF_WEEK) {
      for (const period of teachingPeriods) {
        const candidate: ScheduleSlot = {
          ...targetSlot,
          day,
          startTime: period.startTime,
          endTime: period.endTime
        };
        if (!slotHasConflict(candidate)) {
          return currentSlots.map(s => s.id === slotToModifyId ? candidate : s);
        }
      }
    }

    // Option B: Reassign teacher
    for (const t of teachers) {
      const candidate: ScheduleSlot = {
        ...targetSlot,
        teacherId: t.id
      };
      if (!slotHasConflict(candidate)) {
        return currentSlots.map(s => s.id === slotToModifyId ? candidate : s);
      }
    }
  }

  if (conflict.type === 'ROOM_DOUBLE_BOOKED') {
    // Find another room available at that exact time
    for (const r of rooms) {
      const candidate: ScheduleSlot = {
        ...targetSlot,
        roomId: r.id
      };
      if (!slotHasConflict(candidate)) {
        return currentSlots.map(s => s.id === slotToModifyId ? candidate : s);
      }
    }
  }

  if (conflict.type === 'SECTION_DOUBLE_BOOKED') {
    // Find free time period for this section
    for (const day of DAYS_OF_WEEK) {
      for (const period of teachingPeriods) {
        const candidate: ScheduleSlot = {
          ...targetSlot,
          day,
          startTime: period.startTime,
          endTime: period.endTime
        };
        if (!slotHasConflict(candidate)) {
          return currentSlots.map(s => s.id === slotToModifyId ? candidate : s);
        }
      }
    }
  }

  return currentSlots;
}

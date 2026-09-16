import { ScheduleSlot, Teacher, Section, Room, SubjectItem, ScheduleConflict, DayOfWeek } from '../types';

export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

export function minutesToTime(totalMins: number): string {
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function isTimeOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  const sA = timeToMinutes(startA);
  const eA = timeToMinutes(endA);
  const sB = timeToMinutes(startB);
  const eB = timeToMinutes(endB);

  return Math.max(sA, sB) < Math.min(eA, eB);
}

export function detectAllConflicts(
  slots: ScheduleSlot[],
  teachers: Teacher[],
  sections: Section[],
  rooms: Room[],
  subjects: SubjectItem[],
  activeTerm: string
): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];
  const termSlots = slots.filter(s => !s.term || s.term === activeTerm);

  const teacherMap = new Map(teachers.map(t => [t.id, t]));
  const sectionMap = new Map(sections.map(s => [s.id, s]));
  const roomMap = new Map(rooms.map(r => [r.id, r]));
  const subjectMap = new Map(subjects.map(sub => [sub.id, sub]));

  // Group slots by Day
  const slotsByDay = new Map<DayOfWeek, ScheduleSlot[]>();
  for (const slot of termSlots) {
    if (slot.isBreak) continue;
    const current = slotsByDay.get(slot.day) || [];
    current.push(slot);
    slotsByDay.set(slot.day, current);
  }

  // 1. Check Pairwise Conflicts per Day (Teacher, Room, Section Overlaps)
  slotsByDay.forEach((daySlots, day) => {
    const n = daySlots.length;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const slotA = daySlots[i];
        const slotB = daySlots[j];

        if (isTimeOverlap(slotA.startTime, slotA.endTime, slotB.startTime, slotB.endTime)) {
          const overlapRange = `${slotA.startTime}-${slotA.endTime} & ${slotB.startTime}-${slotB.endTime}`;
          const subA = subjectMap.get(slotA.subjectId);
          const subB = subjectMap.get(slotB.subjectId);
          const secA = sectionMap.get(slotA.sectionId);
          const secB = sectionMap.get(slotB.sectionId);
          const tA = teacherMap.get(slotA.teacherId);
          const tB = teacherMap.get(slotB.teacherId);
          const rA = roomMap.get(slotA.roomId);
          const rB = roomMap.get(slotB.roomId);

          // 1A. Teacher Double-Booking
          if (slotA.teacherId && slotA.teacherId === slotB.teacherId) {
            conflicts.push({
              id: `conf-teacher-${slotA.id}-${slotB.id}`,
              type: 'TEACHER_DOUBLE_BOOKED',
              severity: 'CRITICAL',
              title: `Teacher Double-Booked: ${tA?.name || 'Assigned Teacher'}`,
              description: `${tA?.name || 'Teacher'} is scheduled simultaneously for "${subA?.name || 'Subject A'}" (${secA?.name}) and "${subB?.name || 'Subject B'}" (${secB?.name}) on ${day}.`,
              day,
              timeRange: overlapRange,
              affectedSlotIds: [slotA.id, slotB.id],
              teacherId: slotA.teacherId,
              suggestedFix: `Reassign one of the subjects to another available teacher or move ${secB?.name} to another vacant period.`
            });
          }

          // 1B. Room Double-Booking
          if (slotA.roomId && slotA.roomId === slotB.roomId) {
            conflicts.push({
              id: `conf-room-${slotA.id}-${slotB.id}`,
              type: 'ROOM_DOUBLE_BOOKED',
              severity: 'CRITICAL',
              title: `Room Double-Booked: ${rA?.name || 'Assigned Room'}`,
              description: `${rA?.name || 'Room'} is simultaneously assigned to ${secA?.name} (${subA?.code || 'Sub A'}) and ${secB?.name} (${subB?.code || 'Sub B'}) on ${day}.`,
              day,
              timeRange: overlapRange,
              affectedSlotIds: [slotA.id, slotB.id],
              roomId: slotA.roomId,
              suggestedFix: `Move ${secB?.name}'s class to a vacant classroom or swap room assignments.`
            });
          }

          // 1C. Section Double-Booking
          if (slotA.sectionId && slotA.sectionId === slotB.sectionId) {
            conflicts.push({
              id: `conf-sec-${slotA.id}-${slotB.id}`,
              type: 'SECTION_DOUBLE_BOOKED',
              severity: 'CRITICAL',
              title: `Section Conflict: ${secA?.name || 'Class Section'}`,
              description: `Section ${secA?.name} has two simultaneous subjects scheduled: "${subA?.name}" with ${tA?.name} and "${subB?.name}" with ${tB?.name} on ${day}.`,
              day,
              timeRange: overlapRange,
              affectedSlotIds: [slotA.id, slotB.id],
              sectionId: slotA.sectionId,
              suggestedFix: `Move one of the subjects to an open period on ${day} or another day.`
            });
          }
        }
      }
    }
  });

  // 2. Check Teacher Workload Compliance (DepEd Magna Carta / 6 Hours Per Day & Max Weekly)
  teachers.forEach(teacher => {
    const teacherSlots = termSlots.filter(s => s.teacherId === teacher.id && !s.isBreak);
    let totalWeeklyMinutes = 0;

    // Daily breakdown
    const dailyMinsMap = new Map<DayOfWeek, number>();
    teacherSlots.forEach(slot => {
      const dur = timeToMinutes(slot.endTime) - timeToMinutes(slot.startTime);
      if (dur > 0) {
        totalWeeklyMinutes += dur;
        dailyMinsMap.set(slot.day, (dailyMinsMap.get(slot.day) || 0) + dur);
      }
    });

    // Check Daily Limit (DepEd Standard max 360 mins / 6 teaching hours per day)
    dailyMinsMap.forEach((mins, day) => {
      if (mins > 360) {
        const hours = (mins / 60).toFixed(1);
        conflicts.push({
          id: `conf-load-day-${teacher.id}-${day}`,
          type: 'TEACHER_MAX_LOAD_EXCEEDED',
          severity: 'WARNING',
          title: `Daily Overload: ${teacher.name} (${day})`,
          description: `${teacher.name} has ${hours} teaching hours (${mins} mins) on ${day}, exceeding the DepEd standard maximum of 6 teaching hours/day (360 mins).`,
          day,
          affectedSlotIds: teacherSlots.filter(s => s.day === day).map(s => s.id),
          teacherId: teacher.id,
          suggestedFix: `Distribute at least 1 subject load to an underloaded day (e.g., Friday) or another faculty member.`
        });
      }
    });

    // Check Total Weekly Max Load
    const maxWeekly = teacher.maxWeeklyMinutes || 1800; // 30 hours
    if (totalWeeklyMinutes > maxWeekly) {
      const excessHrs = ((totalWeeklyMinutes - maxWeekly) / 60).toFixed(1);
      conflicts.push({
        id: `conf-load-week-${teacher.id}`,
        type: 'TEACHER_MAX_LOAD_EXCEEDED',
        severity: 'WARNING',
        title: `Weekly Overload: ${teacher.name}`,
        description: `${teacher.name} is assigned ${(totalWeeklyMinutes / 60).toFixed(1)} hours/week (exceeds policy limit of ${(maxWeekly / 60)} hrs by ${excessHrs} hrs).`,
        affectedSlotIds: teacherSlots.map(s => s.id),
        teacherId: teacher.id,
        suggestedFix: `Reassign ${excessHrs} hours of teaching load to co-teachers with matching subject specialization.`
      });
    }

    // Check Consecutive Hours (Teacher burnout > 3 hours straight without break)
    slotsByDay.forEach((daySlots, day) => {
      const tDaySlots = daySlots
        .filter(s => s.teacherId === teacher.id)
        .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

      for (let i = 0; i < tDaySlots.length - 2; i++) {
        const s1 = tDaySlots[i];
        const s2 = tDaySlots[i + 1];
        const s3 = tDaySlots[i + 2];

        const isContinuous =
          timeToMinutes(s1.endTime) === timeToMinutes(s2.startTime) &&
          timeToMinutes(s2.endTime) === timeToMinutes(s3.startTime);

        if (isContinuous) {
          const totalContinuousMins = timeToMinutes(s3.endTime) - timeToMinutes(s1.startTime);
          if (totalContinuousMins >= 180) {
            conflicts.push({
              id: `conf-consecutive-${teacher.id}-${day}-${s1.id}`,
              type: 'TEACHER_CONSECUTIVE_LOAD_HIGH',
              severity: 'INFO',
              title: `Continuous Teaching Load: ${teacher.name}`,
              description: `${teacher.name} teaches 3+ consecutive continuous hours (${s1.startTime} to ${s3.endTime}) on ${day} without a break period.`,
              day,
              timeRange: `${s1.startTime} - ${s3.endTime}`,
              affectedSlotIds: [s1.id, s2.id, s3.id],
              teacherId: teacher.id,
              suggestedFix: `Add a preparation or recess gap between periods to avoid teacher fatigue.`
            });
            break;
          }
        }
      }
    });
  });

  // 3. Room Facility Suitability Check
  termSlots.forEach(slot => {
    if (slot.isBreak) return;
    const sub = subjectMap.get(slot.subjectId);
    const rm = roomMap.get(slot.roomId);

    if (sub && rm && sub.preferredRoomType && sub.preferredRoomType !== 'Lecture') {
      if (sub.preferredRoomType !== rm.type) {
        conflicts.push({
          id: `conf-room-type-${slot.id}`,
          type: 'ROOM_TYPE_MISMATCH',
          severity: 'WARNING',
          title: `Facility Mismatch: ${sub.name}`,
          description: `"${sub.name}" requires a ${sub.preferredRoomType} facility, but is scheduled in "${rm.name}" (${rm.type}).`,
          day: slot.day,
          timeRange: `${slot.startTime}-${slot.endTime}`,
          affectedSlotIds: [slot.id],
          roomId: slot.roomId,
          subjectId: slot.subjectId,
          suggestedFix: `Assign to an appropriate facility (e.g. Science Lab, Computer Lab, or Gym).`
        });
      }
    }
  });

  // 4. Curriculum Contact Time Compliance Check per Section & Subject
  sections.forEach(sec => {
    // Get required subjects for this section's grade level / strand
    const relevantSubjects = subjects.filter(sub => {
      const gradeMatches = sub.gradeLevels.includes(sec.gradeLevel);
      const strandMatches = !sub.strand || sub.strand === sec.strand;
      return gradeMatches && strandMatches;
    });

    relevantSubjects.forEach(sub => {
      const scheduledSlots = termSlots.filter(
        s => s.sectionId === sec.id && s.subjectId === sub.id && !s.isBreak
      );

      const totalScheduledMinutes = scheduledSlots.reduce((acc, curr) => {
        return acc + (timeToMinutes(curr.endTime) - timeToMinutes(curr.startTime));
      }, 0);

      // If scheduled, but insufficient or excessively high
      if (totalScheduledMinutes > 0 && totalScheduledMinutes < sub.weeklyMinutesRequired) {
        const missingMins = sub.weeklyMinutesRequired - totalScheduledMinutes;
        conflicts.push({
          id: `conf-curric-under-${sec.id}-${sub.id}`,
          type: 'CURRICULUM_HOURS_INSUFFICIENT',
          severity: 'INFO',
          title: `Curriculum Deficit: ${sec.name} - ${sub.code}`,
          description: `${sub.name} is scheduled for only ${totalScheduledMinutes} mins/week (DepEd MATATAG/SHS requires ${sub.weeklyMinutesRequired} mins/week; deficit of ${missingMins} mins).`,
          affectedSlotIds: scheduledSlots.map(s => s.id),
          sectionId: sec.id,
          subjectId: sub.id,
          suggestedFix: `Add ${Math.ceil(missingMins / (sub.sessionDurationMinutes || 60))} more session(s) of ${sub.code} to fulfill curriculum requirements.`
        });
      }
    });
  });

  return conflicts;
}

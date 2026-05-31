import type { Subject } from '../types/session.types';
import type { GradeEntry } from '../types/enrollments.types';

export interface GradeResult {
  status: 'pass' | 'conditional' | 'fail' | 'none';
  weightedAvg: number;
  coreAvg: number;
  blocked: boolean;
  details: {
    gradedCount: number;
    totalCount: number;
    missingSubjects: string[];
  };
}

export const STATUS_CONFIG = {
  pass: { label: 'Успешно сдал(а)', color: 'success' },
  conditional: { label: 'Условно сдал(а)', color: 'warning' },
  fail: { label: 'Не сдал(а)', color: 'error' },
  none: { label: 'Нет данных', color: 'default' },
};

export const formatGrade = (val: number | null | undefined): string => {
  if (val === undefined || val === null || isNaN(val)) return '—';
  return val.toFixed(2);
};

export const calculateGradeResultV2 = (
  subjects: Subject[],
  gradeEntries: GradeEntry[]
): GradeResult => {
  const totalCount = subjects.length;
  if (totalCount === 0) {
    return {
      status: 'none',
      weightedAvg: 0,
      coreAvg: 0,
      blocked: false,
      details: {
        gradedCount: 0,
        totalCount: 0,
        missingSubjects: [],
      },
    };
  }

  let gradedCount = 0;
  let gradeSum = 0;
  let weightedSum = 0;
  let totalHours = 0;

  let coreSum = 0;
  let coreCount = 0;

  const missingSubjects: string[] = [];

  subjects.forEach((subject) => {
    const entry = gradeEntries.find((ge) => ge.subjectId === subject.id);
    if (entry && entry.value !== undefined && entry.value !== null) {
      gradedCount++;
      gradeSum += entry.value;

      const hours = subject.hours || 1;
      weightedSum += entry.value * hours;
      totalHours += hours;

      // Assume a subject is "core" if hours are higher than average or if hasClassroom coursework
      // or simply treat any subject with hours > 24 as core, or fallback to all subjects.
      const isCore = (subject.hours && subject.hours > 24) || subject.hasClassroom;
      if (isCore) {
        coreSum += entry.value;
        coreCount++;
      }
    } else {
      missingSubjects.push(subject.title);
    }
  });

  const weightedAvg = totalHours > 0 ? weightedSum / totalHours : (gradedCount > 0 ? gradeSum / gradedCount : 0);
  const coreAvg = coreCount > 0 ? coreSum / coreCount : weightedAvg;

  // Let's check academic block/fail rules
  // E.g., if there's any grade of 1 or 2 (failing), or if coreAvg is less than 3.0
  const hasFailingGrade = gradeEntries.some(
    (ge) => subjects.some((sub) => sub.id === ge.subjectId) && ge.value < 3
  );

  const blocked = coreAvg < 3.0 || hasFailingGrade;

  let status: 'pass' | 'conditional' | 'fail' | 'none' = 'none';
  if (gradedCount > 0) {
    if (blocked || weightedAvg < 3.0) {
      status = 'fail';
    } else if (weightedAvg < 3.8) {
      status = 'conditional';
    } else {
      status = 'pass';
    }
  }

  return {
    status,
    weightedAvg,
    coreAvg,
    blocked,
    details: {
      gradedCount,
      totalCount,
      missingSubjects,
    },
  };
};

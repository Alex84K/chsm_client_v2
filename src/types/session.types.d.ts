export interface AcademicYear {
  id: string;
  organizationId?: string;
  label: string;
  startsAt: string;
  endsAt: string;
  value?: string;
  startAt?: string;
  endAt?: string;
}

export interface CreateAcademicYearDto {
  label: string;
  startsAt: string;
  endsAt: string;
}

export interface SessionLevels {
  id: string;
  organizationId?: string;
  number: string;
  title: string;
  description: string;
}

export type SessionLevel = SessionLevels;

export interface CreateSessionLevelDto {
  number: number;
  title: string;
  description?: string;
}

export type SessionRunStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

export interface SessionRuns {
  id: string;
  organizationId?: string;
  levelId: string;
  academicYearId: string;
  status: SessionRunStatus | string;
  classroomCourseId?: string | null;
  description?: string;
}

export type SessionRun = SessionRuns;

export interface CreateSessionRunDto {
  levelId: string;
  academicYearId: string;
  classroomCourseId?: string;
  status: SessionRunStatus;
}

export interface Subject {
  id: string;
  levelId: string;
  sessionRunId: string;
  title: string;
  teacherName?: string;
  hours?: number;
  classroomCourseworkId?: string;
  hasClassroom: boolean;
}

export interface CreateSubjectDto {
  levelId: string;
  sessionRunId: string;
  title: string;
  teacherName?: string;
  hours?: number;
  classroomCourseworkId?: string;
  hasClassroom: boolean;
}

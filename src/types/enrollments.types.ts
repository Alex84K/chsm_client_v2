export type EnrollmentStatus = 'ENROLLED' | 'COMPLETED' | 'DROPPED';
export type GradebookStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED';

export interface GradeEntry {
  id: string;
  subjectId: string;
  value: number;
  source: string | null;
  recordedAt: string;
}

export interface Gradebook {
  id: string;
  status: GradebookStatus;
  approvedAt: string | null;
  approvedBy: string | null;
}

export interface Enrollment {
  id: string;
  studentId: string;
  sessionRunId: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  approvedAt: string | null;
  approvedBy: string | null;
  teacherName: string | null;
  gradebook: Gradebook;
  grades: GradeEntry[];
}

export interface CreateEnrollmentDto {
  studentId: string;
  sessionRunId: string;
  teacherName?: string;
}

export interface UpdateEnrollmentStatusDto {
  status: EnrollmentStatus;
  approvedBy?: string;
}

export interface CreateGradeEntryDto {
  subjectId: string;
  value: number;
  source?: string;
}

export interface UpdateGradeEntryDto {
  value: number;
}

export interface UpdateGradebookDto {
  status: GradebookStatus;
}

import apiClient from './apiClient';
import type {
  Enrollment,
  CreateEnrollmentDto,
  UpdateEnrollmentStatusDto,
  CreateGradeEntryDto,
  UpdateGradeEntryDto,
  UpdateGradebookDto,
} from '../types/enrollments.types';

// Get student's enrollments
export const getStudentEnrollments = async (
  orgId: string,
  studentId: string
): Promise<Enrollment[]> => {
  const response = await apiClient.get<Enrollment[]>(
    `/organizations/${orgId}/students/${studentId}/enrollments`
  );
  // Mock fallback if backend endpoint isn't fully ready but API is declared,
  // however, we'll try to fetch directly first.
  return response.data;
};

// Create enrollment
export const createEnrollment = async (
  orgId: string,
  payload: CreateEnrollmentDto
): Promise<Enrollment> => {
  const response = await apiClient.post<Enrollment>(
    `/organizations/${orgId}/enrollments`,
    payload
  );
  return response.data;
};

// Get single enrollment by ID
export const getEnrollmentById = async (
  orgId: string,
  id: string
): Promise<Enrollment> => {
  const response = await apiClient.get<Enrollment>(
    `/organizations/${orgId}/enrollments/${id}`
  );
  return response.data;
};

// Update enrollment status (e.g., complete/drop)
export const updateEnrollmentStatus = async (
  orgId: string,
  id: string,
  payload: UpdateEnrollmentStatusDto
): Promise<Enrollment> => {
  const response = await apiClient.patch<Enrollment>(
    `/organizations/${orgId}/enrollments/${id}/status`,
    payload
  );
  return response.data;
};

// Delete enrollment
export const deleteEnrollment = async (
  orgId: string,
  id: string
): Promise<void> => {
  await apiClient.delete(`/organizations/${orgId}/enrollments/${id}`);
};

// --- Grades ---

// Add/update a grade for a subject inside enrollment
export const createGradeEntry = async (
  orgId: string,
  enrollmentId: string,
  payload: CreateGradeEntryDto
): Promise<Enrollment> => {
  const response = await apiClient.post<Enrollment>(
    `/organizations/${orgId}/enrollments/${enrollmentId}/grades`,
    payload
  );
  return response.data;
};

// Update an existing grade
export const updateGradeEntry = async (
  orgId: string,
  enrollmentId: string,
  gradeId: string,
  payload: UpdateGradeEntryDto
): Promise<Enrollment> => {
  const response = await apiClient.patch<Enrollment>(
    `/organizations/${orgId}/enrollments/${enrollmentId}/grades/${gradeId}`,
    payload
  );
  return response.data;
};

// Delete a grade
export const deleteGradeEntry = async (
  orgId: string,
  enrollmentId: string,
  gradeId: string
): Promise<void> => {
  await apiClient.delete(
    `/organizations/${orgId}/enrollments/${enrollmentId}/grades/${gradeId}`
  );
};

// --- Gradebook Life Cycle ---

// Submit gradebook
export const submitGradebook = async (
  orgId: string,
  enrollmentId: string
): Promise<Enrollment> => {
  const response = await apiClient.post<Enrollment>(
    `/organizations/${orgId}/enrollments/${enrollmentId}/gradebook/submit`
  );
  return response.data;
};

// Approve gradebook
export const approveGradebook = async (
  orgId: string,
  enrollmentId: string,
  payload: { approvedBy: string }
): Promise<Enrollment> => {
  const response = await apiClient.post<Enrollment>(
    `/organizations/${orgId}/enrollments/${enrollmentId}/gradebook/approve`,
    payload
  );
  return response.data;
};

// Reject gradebook (optional rollback to DRAFT)
export const updateGradebookStatus = async (
  orgId: string,
  gradebookId: string,
  payload: UpdateGradebookDto
): Promise<void> => {
  // If there's an endpoint to patch/update the gradebook directly:
  await apiClient.patch(
    `/organizations/${orgId}/gradebooks/${gradebookId}`,
    payload
  );
};

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
  getStudentEnrollments,
  createEnrollment,
  getEnrollmentById,
  updateEnrollmentStatus,
  createGradeEntry,
  updateGradeEntry as updateGradeEntryApi,
  deleteGradeEntry,
  submitGradebook,
  approveGradebook,
  updateGradebookStatus,
} from '../api/enrollments.api';
import type {
  Enrollment,
  CreateEnrollmentDto,
  UpdateEnrollmentStatusDto,
  CreateGradeEntryDto,
  UpdateGradeEntryDto,
  UpdateGradebookDto,
} from '../types/enrollments.types';

export const useStudentEnrollments = (orgId: string, studentId: string) =>
  useQuery<Enrollment[], Error>({
    queryKey: ['enrollments', orgId, 'student', studentId],
    queryFn: () => getStudentEnrollments(orgId, studentId),
    enabled: Boolean(orgId) && Boolean(studentId),
  });

export const useEnrollment = (orgId: string, enrollmentId: string) =>
  useQuery<Enrollment, Error>({
    queryKey: ['enrollment', orgId, enrollmentId],
    queryFn: () => getEnrollmentById(orgId, enrollmentId),
    enabled: Boolean(orgId) && Boolean(enrollmentId),
  });

export const useCreateEnrollment = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Enrollment,
    Error,
    { orgId: string; payload: CreateEnrollmentDto }
  >({
    mutationFn: ({ orgId, payload }) => createEnrollment(orgId, payload),
    onSuccess: (data, { orgId }) => {
      void queryClient.invalidateQueries({
        queryKey: ['enrollments', orgId, 'student', data.studentId],
      });
    },
  });
};

export const useUpdateEnrollmentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Enrollment,
    Error,
    { orgId: string; id: string; payload: UpdateEnrollmentStatusDto }
  >({
    mutationFn: ({ orgId, id, payload }) =>
      updateEnrollmentStatus(orgId, id, payload),
    onSuccess: (data, { orgId, id }) => {
      void queryClient.invalidateQueries({
        queryKey: ['enrollment', orgId, id],
      });
      void queryClient.invalidateQueries({
        queryKey: ['enrollments', orgId, 'student', data.studentId],
      });
    },
  });
};

// --- Grades Mutations ---

export const useCreateGradeEntry = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Enrollment,
    Error,
    { orgId: string; enrollmentId: string; payload: CreateGradeEntryDto }
  >({
    mutationFn: ({ orgId, enrollmentId, payload }) =>
      createGradeEntry(orgId, enrollmentId, payload),
    onSuccess: (data, { orgId, enrollmentId }) => {
      void queryClient.invalidateQueries({
        queryKey: ['enrollment', orgId, enrollmentId],
      });
    },
  });
};

export const useUpdateGradeEntry = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Enrollment,
    Error,
    {
      orgId: string;
      enrollmentId: string;
      gradeId: string;
      payload: UpdateGradeEntryDto;
    }
  >({
    mutationFn: ({ orgId, enrollmentId, gradeId, payload }) =>
      updateGradeEntryApi(orgId, enrollmentId, gradeId, payload),
    onSuccess: (data, { orgId, enrollmentId }) => {
      void queryClient.invalidateQueries({
        queryKey: ['enrollment', orgId, enrollmentId],
      });
    },
  });
};

export const useDeleteGradeEntry = () => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { orgId: string; enrollmentId: string; gradeId: string }
  >({
    mutationFn: ({ orgId, enrollmentId, gradeId }) =>
      deleteGradeEntry(orgId, enrollmentId, gradeId),
    onSuccess: (_, { orgId, enrollmentId }) => {
      void queryClient.invalidateQueries({
        queryKey: ['enrollment', orgId, enrollmentId],
      });
    },
  });
};

// --- Gradebook Workflow Mutations ---

export const useSubmitGradebook = () => {
  const queryClient = useQueryClient();

  return useMutation<Enrollment, Error, { orgId: string; enrollmentId: string }>(
    {
      mutationFn: ({ orgId, enrollmentId }) =>
        submitGradebook(orgId, enrollmentId),
      onSuccess: (data, { orgId, enrollmentId }) => {
        void queryClient.invalidateQueries({
          queryKey: ['enrollment', orgId, enrollmentId],
        });
      },
    }
  );
};

export const useApproveGradebook = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Enrollment,
    Error,
    { orgId: string; enrollmentId: string; payload: { approvedBy: string } }
  >({
    mutationFn: ({ orgId, enrollmentId, payload }) =>
      approveGradebook(orgId, enrollmentId, payload),
    onSuccess: (data, { orgId, enrollmentId }) => {
      void queryClient.invalidateQueries({
        queryKey: ['enrollment', orgId, enrollmentId],
      });
      void queryClient.invalidateQueries({
        queryKey: ['enrollments', orgId, 'student', data.studentId],
      });
    },
  });
};

export const useUpdateGradebookStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { orgId: string; enrollmentId: string; gradebookId: string; payload: UpdateGradebookDto }
  >({
    mutationFn: ({ orgId, gradebookId, payload }) =>
      updateGradebookStatus(orgId, gradebookId, payload),
    onSuccess: (_, { orgId, enrollmentId }) => {
      void queryClient.invalidateQueries({
        queryKey: ['enrollment', orgId, enrollmentId],
      });
    },
  });
};

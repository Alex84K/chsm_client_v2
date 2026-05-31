import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import {
  getAcademicYears,
  createAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
  getSessionLevels,
  createSessionLevel,
  updateSessionLevel,
  deleteSessionLevel,
  getSessionRuns,
  getSessionRun,
  createSessionRun,
  updateSessionRun,
  deleteSessionRun,
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from '../api/sessions.api'
import type {
  AcademicYear,
  CreateAcademicYearDto,
  SessionLevel,
  CreateSessionLevelDto,
  SessionRun,
  CreateSessionRunDto,
  Subject,
  CreateSubjectDto,
} from '../types/session.types'
import type { UsersQueryError } from '../types/users.types'

const mapSessionError = (error: unknown, defaultMessage: string): UsersQueryError => {
  if (error instanceof AxiosError) {
    const status = error.response?.status
    const message = error.response?.data?.message

    return {
      status,
      message: typeof message === 'string' ? message : defaultMessage,
    }
  }

  return {
    message: defaultMessage,
  }
}

// ==========================================
// Academic Years Hooks
// ==========================================

export const useAcademicYears = (orgId: string) =>
  useQuery<AcademicYear[], UsersQueryError>({
    queryKey: ['academic-years', orgId],
    queryFn: async () => {
      try {
        return await getAcademicYears(orgId)
      } catch (error) {
        throw mapSessionError(error, 'Не удалось загрузить учебные годы.')
      }
    },
    enabled: Boolean(orgId),
    retry: false,
  })

export const useCreateAcademicYear = () => {
  const queryClient = useQueryClient()

  return useMutation<AcademicYear, UsersQueryError, { orgId: string; payload: CreateAcademicYearDto }>({
    mutationFn: async ({ orgId, payload }) => {
      try {
        return await createAcademicYear(orgId, payload)
      } catch (error) {
        throw mapSessionError(error, 'Не удалось создать учебный год.')
      }
    },
    onSuccess: (_, { orgId }) => {
      void queryClient.invalidateQueries({ queryKey: ['academic-years', orgId] })
    },
  })
}

export const useUpdateAcademicYear = () => {
  const queryClient = useQueryClient()

  return useMutation<AcademicYear, UsersQueryError, { orgId: string; id: string; payload: Partial<CreateAcademicYearDto> }>({
    mutationFn: async ({ orgId, id, payload }) => {
      try {
        return await updateAcademicYear(orgId, id, payload)
      } catch (error) {
        throw mapSessionError(error, 'Не удалось обновить учебный год.')
      }
    },
    onSuccess: (_, { orgId }) => {
      void queryClient.invalidateQueries({ queryKey: ['academic-years', orgId] })
    },
  })
}

export const useDeleteAcademicYear = () => {
  const queryClient = useQueryClient()

  return useMutation<void, UsersQueryError, { orgId: string; id: string }>({
    mutationFn: async ({ orgId, id }) => {
      try {
        await deleteAcademicYear(orgId, id)
      } catch (error) {
        throw mapSessionError(error, 'Не удалось удалить учебный год.')
      }
    },
    onSuccess: (_, { orgId }) => {
      void queryClient.invalidateQueries({ queryKey: ['academic-years', orgId] })
    },
  })
}

// ==========================================
// Session Levels Hooks
// ==========================================

export const useSessionLevels = (orgId: string) =>
  useQuery<SessionLevel[], UsersQueryError>({
    queryKey: ['session-levels', orgId],
    queryFn: async () => {
      try {
        return await getSessionLevels(orgId)
      } catch (error) {
        throw mapSessionError(error, 'Не удалось загрузить уровни сессий.')
      }
    },
    enabled: Boolean(orgId),
    retry: false,
  })

export const useCreateSessionLevel = () => {
  const queryClient = useQueryClient()

  return useMutation<SessionLevel, UsersQueryError, { orgId: string; payload: CreateSessionLevelDto }>({
    mutationFn: async ({ orgId, payload }) => {
      try {
        return await createSessionLevel(orgId, payload)
      } catch (error) {
        throw mapSessionError(error, 'Не удалось создать уровень сессии.')
      }
    },
    onSuccess: (_, { orgId }) => {
      void queryClient.invalidateQueries({ queryKey: ['session-levels', orgId] })
    },
  })
}

export const useUpdateSessionLevel = () => {
  const queryClient = useQueryClient()

  return useMutation<SessionLevel, UsersQueryError, { orgId: string; id: string; payload: Partial<CreateSessionLevelDto> }>({
    mutationFn: async ({ orgId, id, payload }) => {
      try {
        return await updateSessionLevel(orgId, id, payload)
      } catch (error) {
        throw mapSessionError(error, 'Не удалось обновить уровень сессии.')
      }
    },
    onSuccess: (_, { orgId }) => {
      void queryClient.invalidateQueries({ queryKey: ['session-levels', orgId] })
    },
  })
}

export const useDeleteSessionLevel = () => {
  const queryClient = useQueryClient()

  return useMutation<void, UsersQueryError, { orgId: string; id: string }>({
    mutationFn: async ({ orgId, id }) => {
      try {
        await deleteSessionLevel(orgId, id)
      } catch (error) {
        throw mapSessionError(error, 'Не удалось удалить уровень сессии.')
      }
    },
    onSuccess: (_, { orgId }) => {
      void queryClient.invalidateQueries({ queryKey: ['session-levels', orgId] })
    },
  })
}

// ==========================================
// Session Runs Hooks
// ==========================================

export const useSessionRuns = (orgId: string) =>
  useQuery<SessionRun[], UsersQueryError>({
    queryKey: ['session-runs', orgId],
    queryFn: async () => {
      try {
        return await getSessionRuns(orgId)
      } catch (error) {
        throw mapSessionError(error, 'Не удалось загрузить запуски сессий.')
      }
    },
    enabled: Boolean(orgId),
    retry: false,
  })

export const useSessionRun = (orgId: string, id: string) =>
  useQuery<SessionRun, UsersQueryError>({
    queryKey: ['session-run', orgId, id],
    queryFn: async () => {
      try {
        return await getSessionRun(orgId, id)
      } catch (error) {
        throw mapSessionError(error, 'Не удалось загрузить информацию о запуске сессии.')
      }
    },
    enabled: Boolean(orgId) && Boolean(id),
    retry: false,
  })

export const useCreateSessionRun = () => {
  const queryClient = useQueryClient()

  return useMutation<SessionRun, UsersQueryError, { orgId: string; payload: CreateSessionRunDto }>({
    mutationFn: async ({ orgId, payload }) => {
      try {
        return await createSessionRun(orgId, payload)
      } catch (error) {
        throw mapSessionError(error, 'Не удалось создать запуск сессии.')
      }
    },
    onSuccess: (_, { orgId }) => {
      void queryClient.invalidateQueries({ queryKey: ['session-runs', orgId] })
    },
  })
}

export const useUpdateSessionRun = () => {
  const queryClient = useQueryClient()

  return useMutation<SessionRun, UsersQueryError, { orgId: string; id: string; payload: Partial<CreateSessionRunDto> }>({
    mutationFn: async ({ orgId, id, payload }) => {
      try {
        return await updateSessionRun(orgId, id, payload)
      } catch (error) {
        throw mapSessionError(error, 'Не удалось обновить запуск сессии.')
      }
    },
    onSuccess: (_, { orgId }) => {
      void queryClient.invalidateQueries({ queryKey: ['session-runs', orgId] })
      void queryClient.invalidateQueries({ queryKey: ['session-run', orgId] })
    },
  })
}

export const useDeleteSessionRun = () => {
  const queryClient = useQueryClient()

  return useMutation<void, UsersQueryError, { orgId: string; id: string }>({
    mutationFn: async ({ orgId, id }) => {
      try {
        await deleteSessionRun(orgId, id)
      } catch (error) {
        throw mapSessionError(error, 'Не удалось удалить запуск сессии.')
      }
    },
    onSuccess: (_, { orgId }) => {
      void queryClient.invalidateQueries({ queryKey: ['session-runs', orgId] })
    },
  })
}

// ==========================================
// Subjects Hooks
// ==========================================

export const useSubjects = (orgId: string) =>
  useQuery<Subject[], UsersQueryError>({
    queryKey: ['subjects', orgId],
    queryFn: async () => {
      try {
        return await getSubjects(orgId)
      } catch (error) {
        throw mapSessionError(error, 'Не удалось загрузить предметы.')
      }
    },
    enabled: Boolean(orgId),
    retry: false,
  })

export const useCreateSubject = () => {
  const queryClient = useQueryClient()

  return useMutation<Subject, UsersQueryError, { orgId: string; payload: CreateSubjectDto }>({
    mutationFn: async ({ orgId, payload }) => {
      try {
        return await createSubject(orgId, payload)
      } catch (error) {
        throw mapSessionError(error, 'Не удалось создать предмет.')
      }
    },
    onSuccess: (_, { orgId }) => {
      void queryClient.invalidateQueries({ queryKey: ['subjects', orgId] })
    },
  })
}

export const useUpdateSubject = () => {
  const queryClient = useQueryClient()

  return useMutation<Subject, UsersQueryError, { orgId: string; id: string; payload: Partial<CreateSubjectDto> }>({
    mutationFn: async ({ orgId, id, payload }) => {
      try {
        return await updateSubject(orgId, id, payload)
      } catch (error) {
        throw mapSessionError(error, 'Не удалось обновить предмет.')
      }
    },
    onSuccess: (_, { orgId }) => {
      void queryClient.invalidateQueries({ queryKey: ['subjects', orgId] })
    },
  })
}

export const useDeleteSubject = () => {
  const queryClient = useQueryClient()

  return useMutation<void, UsersQueryError, { orgId: string; id: string }>({
    mutationFn: async ({ orgId, id }) => {
      try {
        await deleteSubject(orgId, id)
      } catch (error) {
        throw mapSessionError(error, 'Не удалось удалить предмет.')
      }
    },
    onSuccess: (_, { orgId }) => {
      void queryClient.invalidateQueries({ queryKey: ['subjects', orgId] })
    },
  })
}

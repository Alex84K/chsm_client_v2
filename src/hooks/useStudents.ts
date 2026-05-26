import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import {
  createStudent,
  deleteStudent,
  getStudentListOrganizations,
  updateStudentProfile,
} from '../api/student.api'
import type { NewStudent, Student, UpdateStudent } from '../types/student.types'
import type { UsersQueryError } from '../types/users.types'

type CreateStudentVariables = {
  orgId: string
  payload: Omit<NewStudent, 'organizationId'>
}

type UpdateStudentVariables = {
  orgId: string
  payload: UpdateStudent
}

type DeleteStudentVariables = {
  orgId: string
  studentId: string
}

const getErrorMessage = (status?: number) => {
  if (status === 400) {
    return 'Проверьте данные студента.'
  }

  if (status === 404) {
    return 'Студент не найден.'
  }

  if (status === 409) {
    return 'Студент с такими данными уже существует.'
  }

  return 'Не удалось выполнить действие со студентом.'
}

const mapStudentError = (error: unknown): UsersQueryError => {
  if (error instanceof AxiosError) {
    const status = error.response?.status
    const message = error.response?.data?.message

    return {
      status,
      message: typeof message === 'string' ? message : getErrorMessage(status),
    }
  }

  return {
    message: getErrorMessage(),
  }
}

export const useStudents = (orgId: string) =>
  useQuery<Student[], UsersQueryError>({
    queryKey: ['students', orgId],
    queryFn: async () => {
      try {
        return await getStudentListOrganizations(orgId)
      } catch (error) {
        throw mapStudentError(error)
      }
    },
    enabled: Boolean(orgId),
    retry: false,
    select: (students) =>
      [...students].sort(
        (firstStudent, secondStudent) =>
          Date.parse(String(secondStudent.enrolledAt)) -
          Date.parse(String(firstStudent.enrolledAt)),
      ),
  })

export const useCreateStudent = () => {
  const queryClient = useQueryClient()

  return useMutation<Student, UsersQueryError, CreateStudentVariables>({
    mutationFn: async ({ orgId, payload }) => {
      try {
        return await createStudent(orgId, payload)
      } catch (error) {
        throw mapStudentError(error)
      }
    },
    onSuccess: (_, { orgId }) => {
      void queryClient.invalidateQueries({ queryKey: ['students', orgId] })
    },
  })
}

export const useUpdateStudent = () => {
  const queryClient = useQueryClient()

  return useMutation<Student, UsersQueryError, UpdateStudentVariables>({
    mutationFn: async ({ orgId, payload }) => {
      try {
        return await updateStudentProfile(orgId, payload)
      } catch (error) {
        throw mapStudentError(error)
      }
    },
    onSuccess: (_, { orgId }) => {
      void queryClient.invalidateQueries({ queryKey: ['students', orgId] })
    },
  })
}

export const useDeleteStudent = () => {
  const queryClient = useQueryClient()

  return useMutation<void, UsersQueryError, DeleteStudentVariables>({
    mutationFn: async ({ orgId, studentId }) => {
      try {
        await deleteStudent(orgId, studentId)
      } catch (error) {
        throw mapStudentError(error)
      }
    },
    onSuccess: (_, { orgId }) => {
      void queryClient.invalidateQueries({ queryKey: ['students', orgId] })
    },
  })
}

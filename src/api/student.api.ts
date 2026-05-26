import type { NewStudent, Student, UpdateStudent } from '../types/student.types'
import apiClient from './apiClient'

export const createStudent = async (
  orgId: string,
  payload: Omit<NewStudent, 'organizationId'>,
): Promise<Student> => {
  const response = await apiClient.post<Student>(
    `/organizations/${orgId}/students`,
    payload,
  )
  return response.data
}

export const getStudentListOrganizations = async (
  orgId: string,
): Promise<Student[]> => {
  const response = await apiClient.get<Student[]>(
    `/organizations/${orgId}/students`,
  )
  return response.data
}

export const findStudentByExternalId = async (
  orgId: string,
  provider: string,
  externalId: string,
): Promise<Student | null> => {
  const response = await apiClient.get<Student | null>(
    `/organizations/${orgId}/students/by-external-id`,
    {
      params: {
        provider,
        externalId,
      },
    },
  )
  return response.data
}

export const getStudentById = async (
  orgId: string,
  studentId: string,
): Promise<Student> => {
  const response = await apiClient.get<Student>(
    `/organizations/${orgId}/students/${studentId}`,
  )
  return response.data
}

export const updateStudentProfile = async (
  orgId: string,
  payload: UpdateStudent,
): Promise<Student> => {
  const { studentId, ...studentProfile } = payload
  const response = await apiClient.patch<Student>(
    `/organizations/${orgId}/students/${studentId}`,
    studentProfile,
  )
  return response.data
}

export const deleteStudent = async (
  orgId: string,
  studentId: string,
): Promise<void> => {
  await apiClient.delete(`/organizations/${orgId}/students/${studentId}`)
}

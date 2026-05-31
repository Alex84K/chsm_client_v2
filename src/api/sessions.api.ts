import apiClient from './apiClient'
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

// Academic Years API
export const getAcademicYears = async (orgId: string): Promise<AcademicYear[]> => {
  const response = await apiClient.get<AcademicYear[]>(
    `/organizations/${orgId}/academic-years`
  )
  return response.data
}

export const createAcademicYear = async (
  orgId: string,
  payload: CreateAcademicYearDto
): Promise<AcademicYear> => {
  const response = await apiClient.post<AcademicYear>(
    `/organizations/${orgId}/academic-years`,
    payload
  )
  return response.data
}

export const updateAcademicYear = async (
  orgId: string,
  id: string,
  payload: Partial<CreateAcademicYearDto>
): Promise<AcademicYear> => {
  const response = await apiClient.patch<AcademicYear>(
    `/organizations/${orgId}/academic-years/${id}`,
    payload
  )
  return response.data
}

export const deleteAcademicYear = async (
  orgId: string,
  id: string
): Promise<void> => {
  await apiClient.delete(`/organizations/${orgId}/academic-years/${id}`)
}

// Session Levels API
export const getSessionLevels = async (orgId: string): Promise<SessionLevel[]> => {
  const response = await apiClient.get<SessionLevel[]>(
    `/organizations/${orgId}/session-levels`
  )
  return response.data
}

export const createSessionLevel = async (
  orgId: string,
  payload: CreateSessionLevelDto
): Promise<SessionLevel> => {
  const response = await apiClient.post<SessionLevel>(
    `/organizations/${orgId}/session-levels`,
    payload
  )
  return response.data
}

export const updateSessionLevel = async (
  orgId: string,
  id: string,
  payload: Partial<CreateSessionLevelDto>
): Promise<SessionLevel> => {
  const response = await apiClient.patch<SessionLevel>(
    `/organizations/${orgId}/session-levels/${id}`,
    payload
  )
  return response.data
}

export const deleteSessionLevel = async (
  orgId: string,
  id: string
): Promise<void> => {
  await apiClient.delete(`/organizations/${orgId}/session-levels/${id}`)
}

// Session Runs API
export const getSessionRuns = async (orgId: string): Promise<SessionRun[]> => {
  const response = await apiClient.get<SessionRun[]>(
    `/organizations/${orgId}/session-runs`
  )
  return response.data
}

export const getSessionRun = async (
  orgId: string,
  id: string
): Promise<SessionRun> => {
  const response = await apiClient.get<SessionRun>(
    `/organizations/${orgId}/session-runs/${id}`
  )
  return response.data
}

export const createSessionRun = async (
  orgId: string,
  payload: CreateSessionRunDto
): Promise<SessionRun> => {
  const response = await apiClient.post<SessionRun>(
    `/organizations/${orgId}/session-runs`,
    payload
  )
  return response.data
}

export const updateSessionRun = async (
  orgId: string,
  id: string,
  payload: Partial<CreateSessionRunDto>
): Promise<SessionRun> => {
  const response = await apiClient.patch<SessionRun>(
    `/organizations/${orgId}/session-runs/${id}`,
    payload
  )
  return response.data
}

export const deleteSessionRun = async (
  orgId: string,
  id: string
): Promise<void> => {
  await apiClient.delete(`/organizations/${orgId}/session-runs/${id}`)
}

// Subjects API
export const getSubjects = async (orgId: string): Promise<Subject[]> => {
  const response = await apiClient.get<Subject[]>(
    `/organizations/${orgId}/subjects`
  )
  return response.data
}

export const createSubject = async (
  orgId: string,
  payload: CreateSubjectDto
): Promise<Subject> => {
  const response = await apiClient.post<Subject>(
    `/organizations/${orgId}/subjects`,
    payload
  )
  return response.data
}

export const updateSubject = async (
  orgId: string,
  id: string,
  payload: Partial<CreateSubjectDto>
): Promise<Subject> => {
  const response = await apiClient.patch<Subject>(
    `/organizations/${orgId}/subjects/${id}`,
    payload
  )
  return response.data
}

export const deleteSubject = async (
  orgId: string,
  id: string
): Promise<void> => {
  await apiClient.delete(`/organizations/${orgId}/subjects/${id}`)
}

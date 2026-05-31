import * as React from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import type { AcademicYear, SessionLevel, SessionRunStatus } from '../types/session.types'

export interface SessionRunFormData {
  levelId: string
  academicYearId: string
  status: SessionRunStatus
  classroomCourseId: string
}

interface SessionRunModalProps {
  open: boolean
  editMode: boolean
  initialData: SessionRunFormData
  currentStatus?: SessionRunStatus
  levels: SessionLevel[]
  years: AcademicYear[]
  onClose: () => void
  onSubmit: (data: SessionRunFormData) => void
  errorMessage?: string | null
}

const getAllowedStatuses = (currentStatus: SessionRunStatus): SessionRunStatus[] => {
  const list: SessionRunStatus[] = [currentStatus]
  if (currentStatus === 'PLANNED') {
    list.push('ACTIVE', 'ARCHIVED')
  } else if (currentStatus === 'ACTIVE') {
    list.push('COMPLETED', 'ARCHIVED')
  } else if (currentStatus === 'COMPLETED') {
    list.push('ARCHIVED')
  }
  return list
}

const SessionRunModal = ({
  open,
  editMode,
  initialData,
  currentStatus,
  levels,
  years,
  onClose,
  onSubmit,
  errorMessage,
}: SessionRunModalProps) => {
  const [form, setForm] = React.useState<SessionRunFormData>(initialData)
  const [localError, setLocalError] = React.useState<string | null>(null)

  React.useEffect(() => {
    setForm(initialData)
    setLocalError(null)
  }, [initialData, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (!form.levelId || !form.academicYearId) {
      setLocalError('Пожалуйста, выберите уровень и учебный год.')
      return
    }

    onSubmit(form)
  }

  const displayError = localError ?? errorMessage

  const statusOptions =
    editMode && currentStatus ? getAllowedStatuses(currentStatus) : (['PLANNED', 'ACTIVE', 'COMPLETED', 'ARCHIVED'] as SessionRunStatus[])

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{editMode ? 'Редактировать запуск сессии' : 'Добавить запуск сессии'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {displayError && (
              <Box sx={{ color: 'error.main', fontSize: 14 }}>{displayError}</Box>
            )}

            <FormControl fullWidth required>
              <InputLabel>Уровень обучения</InputLabel>
              <Select
                value={form.levelId}
                label="Уровень обучения"
                onChange={e => setForm({ ...form, levelId: e.target.value })}
              >
                {levels.map(l => (
                  <MenuItem key={l.id} value={l.id}>
                    {l.title} (Level {l.number})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Учебный год</InputLabel>
              <Select
                value={form.academicYearId}
                label="Учебный год"
                onChange={e => setForm({ ...form, academicYearId: e.target.value })}
              >
                {years.map(y => (
                  <MenuItem key={y.id} value={y.id}>
                    {y.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Course ID в Google Classroom"
              fullWidth
              value={form.classroomCourseId}
              onChange={e => setForm({ ...form, classroomCourseId: e.target.value })}
            />

            <FormControl fullWidth>
              <InputLabel>Статус</InputLabel>
              <Select
                value={form.status}
                label="Статус"
                onChange={e => setForm({ ...form, status: e.target.value as SessionRunStatus })}
              >
                {statusOptions.map(st => (
                  <MenuItem key={st} value={st}>
                    {st}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Отмена</Button>
          <Button type="submit" variant="contained">
            Сохранить
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default SessionRunModal

import * as React from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import type { AcademicYear, SessionLevel, SessionRun } from '../types/session.types'

export interface SubjectFormData {
  title: string
  levelId: string
  sessionRunId: string
  teacherName: string
  hours: string
  hasClassroom: boolean
  classroomCourseworkId: string
}

interface SubjectModalProps {
  open: boolean
  editMode: boolean
  initialData: SubjectFormData
  levels: SessionLevel[]
  runs: SessionRun[]
  years: AcademicYear[]
  onClose: () => void
  onSubmit: (data: SubjectFormData) => void
  errorMessage?: string | null
}

const SubjectModal = ({
  open,
  editMode,
  initialData,
  levels,
  runs,
  years,
  onClose,
  onSubmit,
  errorMessage,
}: SubjectModalProps) => {
  const [form, setForm] = React.useState<SubjectFormData>(initialData)
  const [localError, setLocalError] = React.useState<string | null>(null)

  React.useEffect(() => {
    setForm(initialData)
    setLocalError(null)
  }, [initialData, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (!form.title || !form.levelId || !form.sessionRunId) {
      setLocalError('Пожалуйста, заполните все обязательные поля.')
      return
    }

    onSubmit(form)
  }

  const displayError = localError ?? errorMessage

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{editMode ? 'Редактировать предмет' : 'Добавить предмет'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {displayError && (
              <Box sx={{ color: 'error.main', fontSize: 14 }}>{displayError}</Box>
            )}

            <TextField
              label="Название предмета"
              fullWidth
              required
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />

            <TextField
              label="Преподаватель"
              fullWidth
              value={form.teacherName}
              onChange={e => setForm({ ...form, teacherName: e.target.value })}
            />

            <TextField
              label="Часы"
              type="number"
              fullWidth
              value={form.hours}
              onChange={e => setForm({ ...form, hours: e.target.value })}
            />

            <FormControl fullWidth required>
              <InputLabel>Уровень обучения</InputLabel>
              <Select
                value={form.levelId}
                label="Уровень обучения"
                onChange={e => setForm({ ...form, levelId: e.target.value })}
              >
                {levels.map(l => (
                  <MenuItem key={l.id} value={l.id}>
                    {l.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Запуск сессии</InputLabel>
              <Select
                value={form.sessionRunId}
                label="Запуск сессии"
                onChange={e => setForm({ ...form, sessionRunId: e.target.value })}
              >
                {runs.map(r => {
                  const l = levels.find(lvl => lvl.id === r.levelId)
                  const y = years.find(yr => yr.id === r.academicYearId)
                  return (
                    <MenuItem key={r.id} value={r.id}>
                      {l?.title ?? `Run ${r.id}`} — {y?.label ?? `Year ${r.academicYearId}`}
                    </MenuItem>
                  )
                })}
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={form.hasClassroom}
                  onChange={e => setForm({ ...form, hasClassroom: e.target.checked })}
                />
              }
              label="Связать с Google Classroom"
            />

            {form.hasClassroom && (
              <TextField
                label="Classroom Coursework ID"
                fullWidth
                value={form.classroomCourseworkId}
                onChange={e => setForm({ ...form, classroomCourseworkId: e.target.value })}
              />
            )}
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

export default SubjectModal

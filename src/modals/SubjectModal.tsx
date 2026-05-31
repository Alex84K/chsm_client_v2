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
import type { SessionRun } from '../types/session.types'

export interface SubjectFormData {
  title: string
  sessionRunId: string
  scale: string
  hours: string
  isCore: boolean
  hasClassroom: boolean
}

interface SubjectModalProps {
  open: boolean
  editMode: boolean
  initialData: SubjectFormData
  runs: SessionRun[]
  onClose: () => void
  onSubmit: (data: SubjectFormData) => void
  errorMessage?: string | null
}

const SubjectModal = ({
  open,
  editMode,
  initialData,
  runs,
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

    if (!form.title || !form.sessionRunId || !form.scale) {
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
              label="Масштаб"
              type="number"
              fullWidth
              required
              value={form.scale}
              onChange={e => setForm({ ...form, scale: e.target.value })}
            />

            <TextField
              label="Часы"
              type="number"
              fullWidth
              value={form.hours}
              onChange={e => setForm({ ...form, hours: e.target.value })}
            />

            <FormControl fullWidth required>
              <InputLabel>Запуск сессии</InputLabel>
              <Select
                value={form.sessionRunId}
                label="Запуск сессии"
                onChange={e => setForm({ ...form, sessionRunId: e.target.value })}
              >
                {runs.map(r => (
                  <MenuItem key={r.id} value={r.id}>
                    Run {r.id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={form.isCore}
                  onChange={e => setForm({ ...form, isCore: e.target.checked })}
                />
              }
              label="Основной предмет"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={form.hasClassroom}
                  onChange={e => setForm({ ...form, hasClassroom: e.target.checked })}
                />
              }
              label="Связать с Google Classroom"
            />
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

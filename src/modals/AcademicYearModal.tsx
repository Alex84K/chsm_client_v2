import * as React from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'

export interface AcademicYearFormData {
  label: string
  startsAt: string
  endsAt: string
}

interface AcademicYearModalProps {
  open: boolean
  editMode: boolean
  initialData: AcademicYearFormData
  onClose: () => void
  onSubmit: (data: AcademicYearFormData) => void
  errorMessage?: string | null
}

const AcademicYearModal = ({
  open,
  editMode,
  initialData,
  onClose,
  onSubmit,
  errorMessage,
}: AcademicYearModalProps) => {
  const [form, setForm] = React.useState<AcademicYearFormData>(initialData)
  const [localError, setLocalError] = React.useState<string | null>(null)

  React.useEffect(() => {
    setForm(initialData)
    setLocalError(null)
  }, [initialData, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (!form.label || !form.startsAt || !form.endsAt) {
      setLocalError('Пожалуйста, заполните все обязательные поля.')
      return
    }
    if (new Date(form.startsAt) >= new Date(form.endsAt)) {
      setLocalError('Ошибка: Дата окончания должна быть строго позже даты начала.')
      return
    }

    onSubmit(form)
  }

  const displayError = localError ?? errorMessage

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{editMode ? 'Редактировать учебный год' : 'Добавить учебный год'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {displayError && (
              <Box sx={{ color: 'error.main', fontSize: 14 }}>{displayError}</Box>
            )}
            <TextField
              label="Название учебного года"
              placeholder="2026/2027 Singerei Noi"
              fullWidth
              required
              value={form.label}
              onChange={e => setForm({ ...form, label: e.target.value })}
            />
            <TextField
              label="Дата начала"
              type="date"
              fullWidth
              required
              slotProps={{ inputLabel: { shrink: true } }}
              value={form.startsAt}
              onChange={e => setForm({ ...form, startsAt: e.target.value })}
            />
            <TextField
              label="Дата окончания"
              type="date"
              fullWidth
              required
              slotProps={{ inputLabel: { shrink: true } }}
              value={form.endsAt}
              onChange={e => setForm({ ...form, endsAt: e.target.value })}
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

export default AcademicYearModal

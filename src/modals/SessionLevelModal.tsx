import * as React from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'

export interface SessionLevelFormData {
  number: string
  title: string
  description: string
}

interface SessionLevelModalProps {
  open: boolean
  editMode: boolean
  initialData: SessionLevelFormData
  onClose: () => void
  onSubmit: (data: SessionLevelFormData) => void
  errorMessage?: string | null
}

const SessionLevelModal = ({
  open,
  editMode,
  initialData,
  onClose,
  onSubmit,
  errorMessage,
}: SessionLevelModalProps) => {
  const [form, setForm] = React.useState<SessionLevelFormData>(initialData)
  const [localError, setLocalError] = React.useState<string | null>(null)

  React.useEffect(() => {
    setForm(initialData)
    setLocalError(null)
  }, [initialData, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (!form.number || !form.title) {
      setLocalError('Пожалуйста, заполните все обязательные поля.')
      return
    }
    const numVal = parseInt(form.number, 10)
    if (isNaN(numVal) || numVal < 1) {
      setLocalError('Ошибка: Номер уровня должен быть целым положительным числом (>= 1).')
      return
    }

    onSubmit({ ...form, number: String(numVal) })
  }

  const displayError = localError ?? errorMessage

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{editMode ? 'Редактировать уровень сессии' : 'Добавить уровень сессии'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {displayError && (
              <Box sx={{ color: 'error.main', fontSize: 14 }}>{displayError}</Box>
            )}
            <TextField
              label="Номер уровня"
              type="number"
              fullWidth
              required
              placeholder="Например: 1"
              slotProps={{ htmlInput: { min: 1 } }}
              value={form.number}
              onChange={e => setForm({ ...form, number: e.target.value })}
            />
            <TextField
              label="Название"
              placeholder="Например: 1 session"
              fullWidth
              required
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />
            <TextField
              label="Описание"
              placeholder="Дополнительное описание..."
              fullWidth
              multiline
              rows={3}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
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

export default SessionLevelModal

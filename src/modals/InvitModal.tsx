import { type FormEvent, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material'
import { useSendInvitation } from '../hooks/useSendInvitation'
import type {
  InvitationResponse,
  InvitationRole,
} from '../types/users.types'

type InvitModalProps = {
  currentOrgId: string
  open: boolean
  onClose: () => void
  onSuccess: (invitation: InvitationResponse) => void
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const InvitModal = ({
  currentOrgId,
  open,
  onClose,
  onSuccess,
}: InvitModalProps) => {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<InvitationRole>('STUDENT')
  const [clientError, setClientError] = useState('')
  const { error, isPending, mutate, reset } = useSendInvitation()

  const resetForm = () => {
    setEmail('')
    setRole('STUDENT')
    setClientError('')
    reset()
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setClientError('')

    const normalizedEmail = email.trim()

    if (!emailPattern.test(normalizedEmail)) {
      setClientError('Введите корректный email.')
      return
    }

    if (!currentOrgId) {
      setClientError('Не выбрана организация для отправки приглашения.')
      return
    }

    mutate(
      {
        organizationId: currentOrgId,
        payload: {
          email: normalizedEmail,
          role,
        },
      },
      {
        onSuccess: (invitation) => {
          onSuccess(invitation)
          handleClose()
        },
      },
    )
  }

  return (
    <Dialog fullWidth maxWidth="sm" onClose={handleClose} open={open}>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>Пригласить участника</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {clientError ? <Alert severity="error">{clientError}</Alert> : null}
            {error ? <Alert severity="error">{error.message}</Alert> : null}

            <TextField
              autoComplete="email"
              autoFocus
              disabled={isPending}
              fullWidth
              label="Email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />

            <FormControl fullWidth>
              <InputLabel id="invitation-role-label">Роль</InputLabel>
              <Select
                disabled={isPending}
                label="Роль"
                labelId="invitation-role-label"
                onChange={(event) =>
                  setRole(event.target.value as InvitationRole)
                }
                value={role}
              >
                <MenuItem value="STUDENT">STUDENT</MenuItem>
                <MenuItem value="USER">USER</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button disabled={isPending} onClick={handleClose}>
            Отмена
          </Button>
          <Button disabled={isPending} type="submit" variant="contained">
            {isPending ? (
              <CircularProgress color="inherit" size={22} />
            ) : (
              'Отправить'
            )}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

export default InvitModal

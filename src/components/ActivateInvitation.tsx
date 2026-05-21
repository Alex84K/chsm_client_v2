import { type FormEvent, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined'
import type { AuthUser } from '../types/users.types'
import { apiUrl } from '../api/apiConfig'

type ActivateInvitationProps = {
  onActivateSuccess: (accessToken: string, user: AuthUser) => void
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const ActivateInvitation = ({ onActivateSuccess }: ActivateInvitationProps) => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isAcceptPending, setIsAcceptPending] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()

    if (!token) {
      setError('В ссылке отсутствует токен приглашения.')
      return
    }

    if (!emailPattern.test(trimmedEmail)) {
      setError('Введите корректный email.')
      return
    }

    if (trimmedPassword.length < 8) {
      setError('Пароль должен содержать минимум 8 символов.')
      return
    }

    setIsAcceptPending(true)

    try {
      const response = await fetch(`${apiUrl}/auth/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: trimmedPassword,
        }),
      })

      if (!response.ok) {
        if (response.status === 400 || response.status === 404) {
          throw new Error('Ссылка недействительна или срок её действия истек. Запросите новое приглашение.')
        }
        throw new Error('Не удалось завершить регистрацию. Попробуйте позже.')
      }

      const result = (await response.json()) as { accessToken: string; user: AuthUser }
      
      onActivateSuccess(result.accessToken, result.user)
      navigate('/cabinet', { replace: true })
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Неизвестная ошибка при регистрации.')
    } finally {
      setIsAcceptPending(false)
    }
  }

  if (!token) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Alert severity="error">В ссылке отсутствует токен приглашения.</Alert>
      </Container>
    )
  }

  return (
    <Box className="login-screen">
      <Container maxWidth="sm" className="login-container">
        <Paper elevation={0} className="login-card">
          <Box className="login-icon" aria-hidden="true">
            <MarkEmailReadOutlinedIcon />
          </Box>

          <Box className="login-heading">
            <Typography component="h1" variant="h5">
              Подтверждение приглашения
            </Typography>
            <Typography color="text.secondary">
              Введите email и пароль, чтобы завершить регистрацию.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" className="login-form" onSubmit={handleSubmit}>
            <TextField
              autoComplete="email"
              autoFocus
              disabled={isAcceptPending}
              fullWidth
              label="Email"
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
              value={email}
            />

            <TextField
              autoComplete="new-password"
              disabled={isAcceptPending}
              fullWidth
              label="Пароль"
              onChange={(e) => setPassword(e.target.value)}
              required
              type="password"
              value={password}
            />

            <Button
              disabled={isAcceptPending}
              fullWidth
              size="large"
              type="submit"
              variant="contained"
            >
              {isAcceptPending ? (
                <CircularProgress color="inherit" size={22} />
              ) : (
                'Подтвердить приглашение'
              )}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default ActivateInvitation
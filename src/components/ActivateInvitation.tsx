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
import { useAcceptInvitation, useVerifyInvitation } from '../hooks/useInvitationActivation'
import type { AuthUser } from '../types/users.types'

type ActivateInvitationProps = {
  onActivateSuccess: (accessToken: string, user: AuthUser) => void
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const ActivateInvitation = ({ onActivateSuccess }: ActivateInvitationProps) => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [email, setEmail] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [clientError, setClientError] = useState('')
  const {
    data: invitation,
    error: verifyError,
    isError: isVerifyError,
    isLoading: isVerifyLoading,
  } = useVerifyInvitation(token)
  const {
    error: acceptError,
    isPending: isAcceptPending,
    mutate,
  } = useAcceptInvitation()

  const emailValue = email ?? invitation?.email ?? ''

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setClientError('')

    const normalizedEmail = emailValue.trim()

    if (!token) {
      setClientError('В ссылке отсутствует токен приглашения.')
      return
    }

    if (!emailPattern.test(normalizedEmail)) {
      setClientError('Введите корректный email.')
      return
    }

    if (invitation?.email && normalizedEmail !== invitation.email) {
      setClientError('Email должен совпадать с адресом из приглашения.')
      return
    }

    if (password.length < 8) {
      setClientError('Пароль должен содержать минимум 8 символов.')
      return
    }

    mutate(
      {
        token,
        password,
      },
      {
        onSuccess: (response) => {
          onActivateSuccess(response.accessToken, response.user)
          navigate('/cabinet', { replace: true })
        },
      },
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

          {!token ? (
            <Alert severity="error">В ссылке отсутствует токен приглашения.</Alert>
          ) : null}

          {isVerifyLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress />
            </Box>
          ) : null}

          {isVerifyError ? (
            <Alert severity="error">{verifyError.message}</Alert>
          ) : null}

          {invitation ? (
            <Alert severity="info">
              Вы приглашены в организацию {invitation.organizationName} в
              качестве {invitation.role}.
            </Alert>
          ) : null}

          <Box component="form" className="login-form" onSubmit={handleSubmit}>
            {clientError ? <Alert severity="error">{clientError}</Alert> : null}
            {acceptError ? (
              <Alert severity="error">{acceptError.message}</Alert>
            ) : null}

            <TextField
              autoComplete="email"
              autoFocus
              disabled={isVerifyLoading || isAcceptPending || isVerifyError}
              fullWidth
              label="Email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={emailValue}
            />

            <TextField
              autoComplete="new-password"
              disabled={isVerifyLoading || isAcceptPending || isVerifyError}
              fullWidth
              label="Пароль"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />

            <Button
              disabled={
                !token || isVerifyLoading || isAcceptPending || isVerifyError
              }
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

import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  Alert,
  AppBar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined'
import TelegramIcon from '@mui/icons-material/Telegram'
import RefreshIcon from '@mui/icons-material/Refresh'
import LinkOffIcon from '@mui/icons-material/LinkOff'
import { getTelegramIdentity } from '../api/integrations.api'
import {
  useDeleteExternalIdentity,
  useTelegramLink,
} from '../hooks/useIntegrations'
import { useUserOrganizations } from '../hooks/useUserOrganizations'

type CabinetProps = {
  currentOrgId: string
  onLogout: () => void
}

const formatDateTime = (date: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))

const Cabinet = ({ currentOrgId, onLogout }: CabinetProps) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [successMessage, setSuccessMessage] = React.useState('')
  const [linkError, setLinkError] = React.useState('')
  const [pendingLinkExpiresAt, setPendingLinkExpiresAt] = React.useState('')
  const {
    data: organizations = [],
    error: organizationsError,
    isError: isOrganizationsError,
    isLoading: isOrganizationsLoading,
  } = useUserOrganizations()
  const {
    error: telegramLinkError,
    isPending: isTelegramLinkPending,
    mutate: createTelegramLink,
  } = useTelegramLink()
  const {
    error: deleteIdentityError,
    isPending: isDeleteIdentityPending,
    mutate: deleteIdentity,
  } = useDeleteExternalIdentity()

  const currentOrganization = organizations.find(
    (organization) => organization.id === currentOrgId,
  )
  const telegramIdentity = getTelegramIdentity(
    currentOrganization?.externalIdentities,
  )
  const isWaitingForTelegram = Boolean(pendingLinkExpiresAt && !telegramIdentity)
  const isLinkExpired = pendingLinkExpiresAt
    ? Date.parse(pendingLinkExpiresAt) <= Date.now()
    : false

  React.useEffect(() => {
    if (!isWaitingForTelegram || isLinkExpired) {
      return
    }

    const intervalId = window.setInterval(() => {
      void queryClient.invalidateQueries({ queryKey: ['user-organizations'] })
    }, 5000)

    return () => window.clearInterval(intervalId)
  }, [isLinkExpired, isWaitingForTelegram, queryClient])

  React.useEffect(() => {
    if (telegramIdentity && pendingLinkExpiresAt) {
      setPendingLinkExpiresAt('')
      setSuccessMessage('Telegram подключен.')
    }
  }, [pendingLinkExpiresAt, telegramIdentity])

  const handleLogout = () => {
    onLogout()
    navigate('/login', { replace: true })
  }

  const handleCreateTelegramLink = () => {
    setSuccessMessage('')
    setLinkError('')
    createTelegramLink(undefined, {
      onSuccess: (link) => {
        setPendingLinkExpiresAt(link.expiresAt)
        window.open(link.url, '_blank', 'noopener,noreferrer')
      },
      onError: (error) => {
        setLinkError(error.message)
      },
    })
  }

  const handleRefreshStatus = () => {
    void queryClient.invalidateQueries({ queryKey: ['user-organizations'] })
  }

  const handleDeleteIdentity = () => {
    if (!telegramIdentity) {
      return
    }

    setSuccessMessage('')
    deleteIdentity(telegramIdentity.id, {
      onSuccess: () => {
        setSuccessMessage('Telegram отключен.')
      },
    })
  }

  return (
    <Box className="admin-screen">
      <AppBar color="inherit" elevation={0} position="static">
        <Toolbar className="admin-toolbar">
          <Box className="admin-brand">
            <SpaceDashboardOutlinedIcon color="primary" />
            <Typography component="div" variant="h6">
              Cabinet
            </Typography>
          </Box>

          <Button
            color="inherit"
            onClick={handleLogout}
            startIcon={<LogoutOutlinedIcon />}
            variant="outlined"
          >
            Выйти
          </Button>
        </Toolbar>
      </AppBar>

      <Container className="admin-container" maxWidth="md">
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: 3 }}>
          <Stack spacing={3}>
            <Box>
              <Typography component="h1" variant="h5">
                Личный кабинет
              </Typography>
              <Typography color="text.secondary">
                Управление личными подключениями и уведомлениями.
              </Typography>
            </Box>

            {successMessage ? (
              <Alert onClose={() => setSuccessMessage('')} severity="success">
                {successMessage}
              </Alert>
            ) : null}
            {linkError ? <Alert severity="error">{linkError}</Alert> : null}
            {telegramLinkError ? (
              <Alert severity="error">{telegramLinkError.message}</Alert>
            ) : null}
            {deleteIdentityError ? (
              <Alert severity="error">{deleteIdentityError.message}</Alert>
            ) : null}
            {isOrganizationsError ? (
              <Alert severity="error">{organizationsError.message}</Alert>
            ) : null}

            <Paper variant="outlined" sx={{ p: 2.5 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Box
                  sx={{
                    alignItems: 'center',
                    bgcolor: 'primary.main',
                    borderRadius: 1,
                    color: 'primary.contrastText',
                    display: 'flex',
                    height: 48,
                    justifyContent: 'center',
                    width: 48,
                  }}
                >
                  <TelegramIcon />
                </Box>

                <Box sx={{ flexGrow: 1 }}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1}
                    sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, mb: 1 }}
                  >
                    <Typography component="h2" variant="h6">
                      Telegram-уведомления
                    </Typography>
                    <Chip
                      color={telegramIdentity ? 'success' : 'default'}
                      label={telegramIdentity ? 'Подключено' : 'Не подключено'}
                      size="small"
                    />
                  </Stack>

                  {isOrganizationsLoading ? (
                    <Box sx={{ py: 2 }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : telegramIdentity ? (
                    <Typography color="text.secondary" variant="body2">
                      Подключен аккаунт{' '}
                      {telegramIdentity.meta?.username
                        ? `@${telegramIdentity.meta.username}`
                        : telegramIdentity.externalId}
                      . Дата привязки: {formatDateTime(telegramIdentity.createdAt)}.
                    </Typography>
                  ) : (
                    <Typography color="text.secondary" variant="body2">
                      Подключите Telegram, чтобы получать уведомления от школы.
                    </Typography>
                  )}

                  {isWaitingForTelegram && !isLinkExpired ? (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Ожидаем подтверждения в Telegram. Ссылка действует до{' '}
                      {formatDateTime(pendingLinkExpiresAt)}.
                    </Alert>
                  ) : null}

                  {isLinkExpired && !telegramIdentity ? (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      Срок действия ссылки истек. Сгенерируйте новую ссылку.
                    </Alert>
                  ) : null}
                </Box>
              </Stack>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                sx={{ justifyContent: 'flex-end', mt: 2 }}
              >
                <Button
                  onClick={handleRefreshStatus}
                  startIcon={<RefreshIcon />}
                  variant="outlined"
                >
                  Проверить подключение
                </Button>
                {telegramIdentity ? (
                  <Button
                    color="error"
                    disabled={isDeleteIdentityPending}
                    onClick={handleDeleteIdentity}
                    startIcon={<LinkOffIcon />}
                    variant="outlined"
                  >
                    Отключить
                  </Button>
                ) : (
                  <Button
                    disabled={isTelegramLinkPending}
                    onClick={handleCreateTelegramLink}
                    startIcon={<TelegramIcon />}
                    variant="contained"
                  >
                    {isTelegramLinkPending ? 'Готовим ссылку...' : 'Подключить Telegram'}
                  </Button>
                )}
              </Stack>
            </Paper>
          </Stack>
        </Paper>
      </Container>
    </Box>
  )
}

export default Cabinet

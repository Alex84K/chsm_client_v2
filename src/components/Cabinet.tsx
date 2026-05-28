import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
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

// Импортируем сервисы
import { 
  getStudentIdentities, // Новый метод API
  getTelegramIdentity 
} from '../api/integrations.api'
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

  // 1. Загружаем данные организаций (только ради названия школы)
  const { data: organizations = [] } = useUserOrganizations()
  const currentOrganization = organizations.find((org) => org.id === currentOrgId)

  // 2. ЗАГРУЗКА ПРИВЯЗОК (Новый эндпоинт: /students/me/identities)
  const {
    data: identities = [],
    isLoading: isIdentitiesLoading,
    refetch: refetchIdentities
  } = useQuery({
    queryKey: ['student-identities', currentOrgId],
    queryFn: () => getStudentIdentities(currentOrgId),
    enabled: !!currentOrgId,
  })

  // 3. Хуки мутаций
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

  // 4. Определяем наличие Telegram в новом формате данных
  // Теперь бэкенд возвращает плоский список, ищем по провайдеру
  const telegramIdentity = identities.find(id => id.provider === 'TELEGRAM')

  const isWaitingForTelegram = Boolean(pendingLinkExpiresAt && !telegramIdentity)
  const isLinkExpired = pendingLinkExpiresAt
    ? Date.parse(pendingLinkExpiresAt) <= Date.now()
    : false

  // 5. Polling: Обновляем только привязки раз в 5 секунд, если ждем активации
  React.useEffect(() => {
    if (!isWaitingForTelegram || isLinkExpired) {
      return
    }

    const intervalId = window.setInterval(() => {
      void refetchIdentities()
    }, 5000)

    return () => window.clearInterval(intervalId)
  }, [isLinkExpired, isWaitingForTelegram, refetchIdentities])

  // 6. Сброс состояния ожидания при успехе
  React.useEffect(() => {
    if (telegramIdentity && pendingLinkExpiresAt) {
      setPendingLinkExpiresAt('')
      setSuccessMessage('Telegram успешно подключен!')
    }
  }, [pendingLinkExpiresAt, telegramIdentity])

  const handleLogout = () => {
    onLogout()
    navigate('/login', { replace: true })
  }

  const handleCreateTelegramLink = () => {
    if (!currentOrgId) return
    setSuccessMessage('')
    setLinkError('')
    
    createTelegramLink(currentOrgId, {
      onSuccess: (link) => {
        setPendingLinkExpiresAt(link.expiresAt)
        window.open(link.url, '_blank', 'noopener,noreferrer')
      },
      onError: (error: any) => {
        setLinkError(error.message || 'Ошибка при генерации ссылки')
      },
    })
  }

  const handleRefreshStatus = () => {
    void refetchIdentities()
  }

  const handleDeleteIdentity = () => {
    if (!telegramIdentity) return
    setSuccessMessage('')
    if (window.confirm('Вы уверены, что хотите отключить Telegram-уведомления?')) {
      deleteIdentity(telegramIdentity.id, {
        onSuccess: () => {
          setSuccessMessage('Telegram-аккаунт отвязан.')
          void refetchIdentities()
        },
      })
    }
  }

  return (
    <Box className="admin-screen">
      <AppBar color="inherit" elevation={0} position="static">
        <Toolbar className="admin-toolbar">
          <Box className="admin-brand">
            <SpaceDashboardOutlinedIcon color="primary" />
            <Typography component="div" variant="h6">
              Кабинет студента
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

      <Container className="admin-container" maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: 3 }}>
          <Stack spacing={3}>
            <Box>
              <Typography component="h1" variant="h5">
                Личный кабинет
              </Typography>
              <Typography color="text.secondary">
                Управление уведомлениями организации: <strong>{currentOrganization?.name || '...'}</strong>
              </Typography>
            </Box>

            {successMessage && <Alert onClose={() => setSuccessMessage('')} severity="success">{successMessage}</Alert>}
            {linkError && <Alert severity="error">{linkError}</Alert>}
            {(telegramLinkError || deleteIdentityError) && (
              <Alert severity="error">
                {telegramLinkError?.message || deleteIdentityError?.message}
              </Alert>
            )}

            <Paper variant="outlined" sx={{ p: 2.5 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Box
                  sx={{
                    alignItems: 'center',
                    bgcolor: telegramIdentity ? 'success.main' : 'primary.main',
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
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                    <Typography component="h2" variant="h6">
                      Telegram-уведомления
                    </Typography>
                    <Chip
                      color={telegramIdentity ? 'success' : 'default'}
                      label={telegramIdentity ? 'Подключено' : 'Не подключено'}
                      size="small"
                    />
                  </Stack>

                  {isIdentitiesLoading ? (
                    <CircularProgress size={20} />
                  ) : telegramIdentity ? (
                    <Typography color="text.secondary" variant="body2">
                      Подключен аккаунт: <strong>@{telegramIdentity.username || telegramIdentity.firstName}</strong>
                      <br />
                      Дата подключения: {formatDateTime(telegramIdentity.connectedAt)}
                    </Typography>
                  ) : (
                    <Typography color="text.secondary" variant="body2">
                      Подключите бота, чтобы получать расписание и важные новости школы.
                    </Typography>
                  )}

                  {isWaitingForTelegram && !isLinkExpired && (
                    <Alert severity="info" sx={{ mt: 2 }} icon={<CircularProgress size={16} />}>
                      Ожидаем подтверждения в Telegram... 
                      (до {new Date(pendingLinkExpiresAt).toLocaleTimeString()})
                    </Alert>
                  )}

                  {isLinkExpired && !telegramIdentity && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      Срок ссылки истек. Пожалуйста, создайте новую.
                    </Alert>
                  )}
                </Box>
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  onClick={handleRefreshStatus}
                  startIcon={<RefreshIcon />}
                  variant="text"
                >
                  Обновить
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
                    {isTelegramLinkPending ? 'Загрузка...' : isWaitingForTelegram ? 'Открыть Telegram' : 'Подключить Telegram'}
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
import * as React from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import TelegramIcon from '@mui/icons-material/Telegram'
import SettingsIcon from '@mui/icons-material/Settings'
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew'
import DeleteIcon from '@mui/icons-material/Delete'
import {
  getTelegramIntegration,
} from '../api/integrations.api'
import {
  useDeleteIntegration,
  useIntegrations,
  useSaveTelegramIntegration,
} from '../hooks/useIntegrations'
import IntegrationSettingsModal from '../modals/IntegrationSettingsModal'
import type { SaveTelegramIntegrationRequest } from '../types/integrations.types'

type IntegrationsProps = {
  currentOrgId: string
}

const formatDate = (date?: string) => {
  if (!date) {
    return 'Не обновлялась'
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

const Integrations = ({ currentOrgId }: IntegrationsProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)
  const [successMessage, setSuccessMessage] = React.useState('')
  const {
    data: integrations = [],
    error,
    isError,
    isLoading,
  } = useIntegrations(currentOrgId)
  const {
    error: saveError,
    isPending: isSavePending,
    mutate: saveTelegram,
    reset: resetSaveTelegram,
  } = useSaveTelegramIntegration()
  const {
    error: deleteError,
    isPending: isDeletePending,
    mutate: deleteIntegration,
  } = useDeleteIntegration()
  const telegramIntegration = getTelegramIntegration(integrations)
  const isTelegramConfigured = Boolean(telegramIntegration)
  const isTelegramActive = Boolean(telegramIntegration?.isActive)

  const handleSaveTelegram = (payload: SaveTelegramIntegrationRequest) => {
    setSuccessMessage('')
    saveTelegram(
      {
        orgId: currentOrgId,
        payload,
      },
      {
        onSuccess: () => {
          setIsSettingsOpen(false)
          setSuccessMessage('Настройки Telegram сохранены. Бот будет перезапущен сервером.')
        },
      },
    )
  }

  const handleToggleActive = () => {
    if (!telegramIntegration?.config) {
      return
    }

    handleSaveTelegram({
      provider: 'TELEGRAM',
      config: telegramIntegration.config,
      isActive: !telegramIntegration.isActive,
    })
  }

  const handleDelete = () => {
    if (!telegramIntegration) {
      return
    }

    setSuccessMessage('')
    deleteIntegration(
      {
        orgId: currentOrgId,
        integrationId: telegramIntegration.id,
      },
      {
        onSuccess: () => {
          setSuccessMessage('Telegram-интеграция удалена.')
        },
      },
    )
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Stack spacing={2}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography component="h2" variant="h6">
          Интеграции организации
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Подключения внешних сервисов для уведомлений и синхронизации.
        </Typography>
      </Box>

      {successMessage ? (
        <Alert onClose={() => setSuccessMessage('')} severity="success">
          {successMessage}
        </Alert>
      ) : null}
      {isError ? <Alert severity="error">{error.message}</Alert> : null}
      {deleteError ? <Alert severity="error">{deleteError.message}</Alert> : null}

      <Card variant="outlined">
        <CardContent>
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
                <Typography component="h3" variant="h6">
                  Telegram
                </Typography>
                <Chip
                  color={
                    isTelegramActive
                      ? 'success'
                      : isTelegramConfigured
                        ? 'warning'
                        : 'default'
                  }
                  label={
                    isTelegramActive
                      ? 'Активно'
                      : isTelegramConfigured
                        ? 'Отключено'
                        : 'Не настроено'
                  }
                  size="small"
                />
              </Stack>

              <Typography color="text.secondary" sx={{ mb: 1 }} variant="body2">
                Бот организации для Telegram-уведомлений и привязки аккаунтов студентов.
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Typography variant="body2">
                  <strong>Bot username:</strong>{' '}
                  {telegramIntegration?.config?.botUsername
                    ? `@${telegramIntegration.config.botUsername}`
                    : 'Не указан'}
                </Typography>
                <Typography variant="body2">
                  <strong>Обновлено:</strong> {formatDate(telegramIntegration?.updatedAt)}
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
          <Button
            disabled={!isTelegramConfigured || isSavePending}
            onClick={handleToggleActive}
            startIcon={<PowerSettingsNewIcon />}
            variant="outlined"
          >
            {isTelegramActive ? 'Отключить' : 'Включить'}
          </Button>
          <Button
            onClick={() => {
              resetSaveTelegram()
              setIsSettingsOpen(true)
            }}
            startIcon={<SettingsIcon />}
            variant="contained"
          >
            {isTelegramConfigured ? 'Настроить' : 'Подключить'}
          </Button>
          <Button
            color="error"
            disabled={!isTelegramConfigured || isDeletePending}
            onClick={handleDelete}
            startIcon={<DeleteIcon />}
            variant="outlined"
          >
            Удалить
          </Button>
        </CardActions>
      </Card>

      <IntegrationSettingsModal
        integration={telegramIntegration}
        isSaving={isSavePending}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveTelegram}
        open={isSettingsOpen}
        saveError={saveError?.message}
      />
    </Stack>
  )
}

export default Integrations

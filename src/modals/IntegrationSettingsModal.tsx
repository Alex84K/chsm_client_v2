import * as React from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import RefreshIcon from '@mui/icons-material/Refresh'
import type {
  SaveTelegramIntegrationRequest,
  TelegramOrgIntegrationConfigDto,
} from '../types/integrations.types'

type IntegrationSettingsModalProps = {
  integration?: TelegramOrgIntegrationConfigDto
  isSaving: boolean
  onClose: () => void
  onSave: (payload: SaveTelegramIntegrationRequest) => void
  open: boolean
  saveError?: string
}

const MASKED_SECRET = '********'

const generateWebhookSecret = () => {
  const bytes = new Uint8Array(24)
  window.crypto.getRandomValues(bytes)

  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

const IntegrationSettingsModal = ({
  integration,
  isSaving,
  onClose,
  onSave,
  open,
  saveError,
}: IntegrationSettingsModalProps) => {
  const [botToken, setBotToken] = React.useState('')
  const [botUsername, setBotUsername] = React.useState('')
  const [webhookSecret, setWebhookSecret] = React.useState('')
  const [groupChatId, setGroupChatId] = React.useState('')
  const [isActive, setIsActive] = React.useState(true)
  const [formError, setFormError] = React.useState('')
  const [copyMessage, setCopyMessage] = React.useState('')

  React.useEffect(() => {
    if (!open) {
      return
    }

    setBotToken(integration?.secrets ?? '')
    setBotUsername(integration?.config?.botUsername ?? '')
    setWebhookSecret(integration?.config?.webhookSecret ?? generateWebhookSecret())
    setGroupChatId(integration?.config?.groupChatId ?? '')
    setIsActive(integration?.isActive ?? true)
    setFormError('')
    setCopyMessage('')
  }, [integration, open])

  const handleCopyWebhookSecret = async () => {
    try {
      await navigator.clipboard.writeText(webhookSecret)
      setCopyMessage('Webhook secret скопирован.')
      window.setTimeout(() => setCopyMessage(''), 1800)
    } catch {
      setFormError('Не удалось скопировать webhook secret.')
    }
  }

  const handleSave = () => {
    const normalizedUsername = botUsername.trim().replace(/^@/, '')
    const normalizedGroupChatId = groupChatId.trim()
    const normalizedToken = botToken.trim()

    if (!normalizedUsername) {
      setFormError('Укажите username бота.')
      return
    }

    if (!webhookSecret.trim()) {
      setFormError('Сгенерируйте webhook secret.')
      return
    }

    if (!integration && !normalizedToken) {
      setFormError('Укажите bot token.')
      return
    }

    const payload: SaveTelegramIntegrationRequest = {
      provider: 'TELEGRAM',
      config: {
        botUsername: normalizedUsername,
        webhookSecret: webhookSecret.trim(),
        ...(normalizedGroupChatId ? { groupChatId: normalizedGroupChatId } : {}),
      },
      isActive,
    }

    if (normalizedToken && normalizedToken !== MASKED_SECRET) {
      payload.secrets = normalizedToken
    }

    setFormError('')
    onSave(payload)
  }

  return (
    <Dialog fullWidth maxWidth="sm" onClose={onClose} open={open}>
      <DialogTitle>Telegram</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <Typography color="text.secondary" variant="body2">
            Настройте бота организации для уведомлений и привязки Telegram-аккаунтов.
          </Typography>

          {formError ? <Alert severity="error">{formError}</Alert> : null}
          {saveError ? <Alert severity="error">{saveError}</Alert> : null}
          {copyMessage ? <Alert severity="success">{copyMessage}</Alert> : null}

          <TextField
            autoComplete="off"
            fullWidth
            label="Bot Token"
            onChange={(event) => setBotToken(event.target.value)}
            placeholder="123456789:ABCdef..."
            type="password"
            value={botToken}
          />

          <TextField
            autoComplete="off"
            fullWidth
            label="Bot Username"
            onChange={(event) => setBotUsername(event.target.value)}
            placeholder="MozartSchoolBot"
            value={botUsername}
          />

          <TextField
            fullWidth
            label="Webhook Secret"
            slotProps={{
              input: {
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Скопировать">
                      <IconButton
                        aria-label="Скопировать webhook secret"
                        edge="end"
                        onClick={() => void handleCopyWebhookSecret()}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Сгенерировать новый">
                      <IconButton
                        aria-label="Сгенерировать webhook secret"
                        edge="end"
                        onClick={() => setWebhookSecret(generateWebhookSecret())}
                      >
                        <RefreshIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              },
            }}
            value={webhookSecret}
          />

          <TextField
            autoComplete="off"
            fullWidth
            label="Group Chat ID"
            onChange={(event) => setGroupChatId(event.target.value)}
            placeholder="-100123456789"
            value={groupChatId}
          />

          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={isActive}
                  onChange={(event) => setIsActive(event.target.checked)}
                />
              }
              label="Интеграция активна"
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button disabled={isSaving} onClick={onClose}>
          Отмена
        </Button>
        <Button disabled={isSaving} onClick={handleSave} variant="contained">
          {isSaving ? 'Сохраняем...' : 'Сохранить'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default IntegrationSettingsModal

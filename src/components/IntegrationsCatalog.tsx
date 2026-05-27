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
import SettingsIcon from '@mui/icons-material/Settings'
import {
  getIntegrationsCatalog,
  getTelegramIntegration,
} from '../api/integrations.api'
import {
  useIntegrations,
  useSaveTelegramIntegration,
} from '../hooks/useIntegrations'
import IntegrationSettingsModal from '../modals/IntegrationSettingsModal'
import type {
  IntegrationProvider,
  IntegrationUnitCatalog,
  SaveTelegramIntegrationRequest,
} from '../types/integrations.types'

type IntegrationsCatalogProps = {
  currentOrgId: string
}

const providerLabels: Record<IntegrationProvider, string> = {
  TELEGRAM: 'Telegram',
  GOOGLE_CLASSROOM: 'Google Classroom',
  MOODLE: 'Moodle',
  DISCORD: 'Discord',
  WHATSAPP: 'WhatsApp',
  ONE_C: '1C',
}

const IntegrationsCatalog = ({ currentOrgId }: IntegrationsCatalogProps) => {
  const [catalog, setCatalog] = React.useState<IntegrationUnitCatalog[]>([])
  const [isCatalogLoading, setIsCatalogLoading] = React.useState(true)
  const [catalogError, setCatalogError] = React.useState('')
  const [selectedProvider, setSelectedProvider] =
    React.useState<IntegrationProvider | null>(null)
  const [successMessage, setSuccessMessage] = React.useState('')
  const {
    data: integrations = [],
    error: integrationsError,
    isError: isIntegrationsError,
  } = useIntegrations(currentOrgId)
  const {
    error: saveError,
    isPending: isSavePending,
    mutate: saveTelegram,
    reset: resetSaveTelegram,
  } = useSaveTelegramIntegration()
  const telegramIntegration = getTelegramIntegration(integrations)
  const isTelegramModalOpen = selectedProvider === 'TELEGRAM'

  React.useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setIsCatalogLoading(true)
        setCatalogError('')
        const data = await getIntegrationsCatalog()
        setCatalog(data)
      } catch (error) {
        setCatalogError('Не удалось загрузить каталог интеграций.')
        console.error(error)
      } finally {
        setIsCatalogLoading(false)
      }
    }

    void fetchCatalog()
  }, [])

  const handleOpenSettings = (provider: IntegrationProvider) => {
    setSuccessMessage('')
    resetSaveTelegram()
    setSelectedProvider(provider)
  }

  const handleSaveTelegram = (payload: SaveTelegramIntegrationRequest) => {
    setSuccessMessage('')
    saveTelegram(
      {
        orgId: currentOrgId,
        payload,
      },
      {
        onSuccess: () => {
          setSelectedProvider(null)
          setSuccessMessage('Telegram-интеграция подключена.')
        },
      },
    )
  }

  if (isCatalogLoading) {
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
          Каталог интеграций
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Доступные сервисы, которые можно подключить к организации.
        </Typography>
      </Box>

      {successMessage ? (
        <Alert onClose={() => setSuccessMessage('')} severity="success">
          {successMessage}
        </Alert>
      ) : null}
      {catalogError ? <Alert severity="error">{catalogError}</Alert> : null}
      {isIntegrationsError ? (
        <Alert severity="error">{integrationsError.message}</Alert>
      ) : null}

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(3, minmax(0, 1fr))',
          },
        }}
      >
        {catalog.map((integration) => {
          const isTelegram = integration.provider === 'TELEGRAM'
          const isConnected =
            isTelegram && Boolean(telegramIntegration)

          return (
            <Card
              key={integration.provider}
              sx={{ display: 'flex', flexDirection: 'column' }}
              variant="outlined"
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}
                >
                  <Typography color="text.secondary" variant="body2">
                    {integration.category}
                  </Typography>
                  {isConnected ? (
                    <Chip color="success" label="Подключено" size="small" />
                  ) : null}
                </Stack>

                <Typography component="h3" variant="h6">
                  {integration.title || providerLabels[integration.provider]}
                </Typography>

                <Typography color="text.secondary" sx={{ mb: 1.5 }} variant="body2">
                  <strong>Provider:</strong> {integration.provider}
                </Typography>

                <Box>
                  <Typography component="div" variant="body2">
                    <strong>Capabilities:</strong>
                  </Typography>

                  <Box component="ul" sx={{ mb: 0, pl: 2.5 }}>
                    {integration.capabilities.map((capability) => (
                      <li key={capability}>
                        <Typography variant="body2">{capability}</Typography>
                      </li>
                    ))}
                  </Box>
                </Box>
              </CardContent>

              <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                <Button
                  disabled={!isTelegram}
                  onClick={() => handleOpenSettings(integration.provider)}
                  startIcon={<SettingsIcon />}
                  variant={isTelegram ? 'contained' : 'outlined'}
                >
                  settings
                </Button>
              </CardActions>
            </Card>
          )
        })}
      </Box>

      <IntegrationSettingsModal
        integration={telegramIntegration}
        isSaving={isSavePending}
        onClose={() => setSelectedProvider(null)}
        onSave={handleSaveTelegram}
        open={isTelegramModalOpen}
        saveError={saveError?.message}
      />
    </Stack>
  )
}

export default IntegrationsCatalog

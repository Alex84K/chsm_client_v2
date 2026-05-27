import { useState, type SyntheticEvent } from 'react'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Integrations from './Integrations'
import IntegrationsCatalog from './IntegrationsCatalog'

type SettingsCompProps = {
  currentOrgId: string
}

type TabPanelProps = {
  children?: React.ReactNode
  index: number
  value: number
}

function CustomTabPanel({ children, index, value }: TabPanelProps) {
  return (
    <Box
      aria-labelledby={`settings-tab-${index}`}
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      role="tabpanel"
    >
      {value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null}
    </Box>
  )
}

function a11yProps(index: number) {
  return {
    id: `settings-tab-${index}`,
    'aria-controls': `settings-tabpanel-${index}`,
  }
}

const SettingsComp = ({ currentOrgId }: SettingsCompProps) => {
  const [value, setValue] = useState(0)

  const handleChange = (_event: SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          aria-label="Настройки интеграций"
          onChange={handleChange}
          value={value}
        >
          <Tab label="Подключенные интеграции" {...a11yProps(0)} />
          <Tab label="Каталог интеграций" {...a11yProps(1)} />
        </Tabs>
      </Box>

      <CustomTabPanel index={0} value={value}>
        <Integrations currentOrgId={currentOrgId} />
      </CustomTabPanel>

      <CustomTabPanel index={1} value={value}>
        <IntegrationsCatalog currentOrgId={currentOrgId} />
      </CustomTabPanel>
    </Box>
  )
}

export default SettingsComp

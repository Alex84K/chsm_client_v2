import * as React from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  styled,
  useTheme,
  type CSSObject,
  type Theme,
} from '@mui/material/styles'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import CssBaseline from '@mui/material/CssBaseline'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import MuiAppBar, {
  type AppBarProps as MuiAppBarProps,
} from '@mui/material/AppBar'
import MuiDrawer from '@mui/material/Drawer'
import Paper from '@mui/material/Paper'
import Tab from '@mui/material/Tab'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Tabs from '@mui/material/Tabs'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import AddIcon from '@mui/icons-material/Add'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import HomeIcon from '@mui/icons-material/Home'
import MenuIcon from '@mui/icons-material/Menu'
import PeopleIcon from '@mui/icons-material/People'
import SchoolIcon from '@mui/icons-material/School'
import SettingsIcon from '@mui/icons-material/Settings'
import { useOrganizationMembers } from '../hooks/useOrganizationMembers'
import InvitModal from '../modals/InvitModal'
import type {
  InvitationResponse,
  OrganizationMember,
} from '../types/users.types'

const drawerWidth = 240

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
})

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
})

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}))

interface AppBarProps extends MuiAppBarProps {
  open?: boolean
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  variants: [
    {
      props: ({ open }) => open,
      style: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
  ],
}))

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  variants: [
    {
      props: ({ open }) => open,
      style: {
        ...openedMixin(theme),
        '& .MuiDrawer-paper': openedMixin(theme),
      },
    },
    {
      props: ({ open }) => !open,
      style: {
        ...closedMixin(theme),
        '& .MuiDrawer-paper': closedMixin(theme),
      },
    },
  ],
}))

type AdminPanelProps = {
  currentOrgId: string
  onLogout: () => void
}

type TabPanelProps = {
  children: React.ReactNode
  index: number
  value: number
}

const TabPanel = ({ children, index, value }: TabPanelProps) => (
  <Box hidden={value !== index} role="tabpanel">
    {value === index ? children : null}
  </Box>
)

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))

const getMemberName = (member: OrganizationMember) =>
  member.user.name || 'Без имени'

const AdminPanel = ({ currentOrgId, onLogout }: AdminPanelProps) => {
  const theme = useTheme()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [open, setOpen] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState(0)
  const [isInvitationModalOpen, setIsInvitationModalOpen] =
    React.useState(false)
  const [successMessage, setSuccessMessage] = React.useState('')
  const {
    data: members = [],
    error,
    isError,
    isLoading,
  } = useOrganizationMembers(currentOrgId)

  const handleLogout = () => {
    onLogout()
    navigate('/login', { replace: true })
  }

  const handleInvitationSuccess = (invitation: InvitationResponse) => {
    setSuccessMessage(
      `Приглашение успешно отправлено на ${invitation.email}. Ссылка действительна 48 часов.`,
    )
    void queryClient.invalidateQueries({
      queryKey: ['organization-members', currentOrgId],
    })
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            aria-label="open drawer"
            color="inherit"
            edge="start"
            onClick={() => setOpen(true)}
            sx={[{ marginRight: 5 }, open && { display: 'none' }]}
          >
            <MenuIcon />
          </IconButton>
          <Typography component="div" noWrap sx={{ flexGrow: 1 }} variant="h6">
            Admin Panel
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <HomeIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer open={open} variant="permanent">
        <DrawerHeader>
          <IconButton onClick={() => setOpen(false)}>
            {theme.direction === 'rtl' ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <Box sx={{ display: 'flex', flexDirection: 'column', py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2, py: 1.5 }}>
            <PeopleIcon color="primary" />
            {open ? <Typography>Users</Typography> : null}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2, py: 1.5 }}>
            <SchoolIcon color="disabled" />
            {open ? <Typography color="text.secondary">Students</Typography> : null}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2, py: 1.5 }}>
            <CalendarMonthIcon color="disabled" />
            {open ? <Typography color="text.secondary">Sessions</Typography> : null}
          </Box>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />

        <Paper
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 3 }}>
            <Typography component="h1" variant="h5">
              Панель администратора организации
            </Typography>
            <Typography color="text.secondary">
              Временные разделы панели. Данные участников загружаются из API.
            </Typography>
          </Box>

          <Divider />

          <Tabs
            onChange={(_, nextTab) => setActiveTab(nextTab)}
            value={activeTab}
            variant="scrollable"
          >
            <Tab icon={<PeopleIcon />} iconPosition="start" label="Пользователи" />
            <Tab icon={<SchoolIcon />} iconPosition="start" label="Обучение" />
            <Tab icon={<SettingsIcon />} iconPosition="start" label="Настройки" />
          </Tabs>

          <Divider />

          <Box sx={{ p: 3 }}>
            <TabPanel index={0} value={activeTab}>
              <Box
                sx={{
                  alignItems: { xs: 'stretch', sm: 'center' },
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2,
                  justifyContent: 'space-between',
                  mb: 2,
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography component="h2" variant="h6">
                    Участники организации
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Управление доступом пользователей через приглашения.
                  </Typography>
                </Box>

                <Button
                  disabled={!currentOrgId}
                  onClick={() => {
                    setSuccessMessage('')
                    setIsInvitationModalOpen(true)
                  }}
                  startIcon={<AddIcon />}
                  variant="contained"
                >
                  Пригласить
                </Button>
              </Box>

              {successMessage ? (
                <Alert
                  onClose={() => setSuccessMessage('')}
                  severity="success"
                  sx={{ mb: 2 }}
                >
                  {successMessage}
                </Alert>
              ) : null}

              {!currentOrgId ? (
                <Alert severity="warning">
                  Не задан идентификатор организации. Выберите организацию для
                  продолжения.
                </Alert>
              ) : null}

              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <CircularProgress />
                </Box>
              ) : null}

              {isError ? <Alert severity="error">{error.message}</Alert> : null}

              {!isLoading && !isError && currentOrgId ? (
                <TableContainer component={Paper} elevation={0} variant="outlined">
                  <Table aria-label="Список участников организации">
                    <TableHead>
                      <TableRow>
                        <TableCell>Имя</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Локальная роль</TableCell>
                        <TableCell>Дата добавления</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {members.map((member) => (
                        <TableRow hover key={member.id}>
                          <TableCell>{getMemberName(member)}</TableCell>
                          <TableCell>{member.user.email}</TableCell>
                          <TableCell>
                            <Chip label={member.role} size="small" />
                          </TableCell>
                          <TableCell>{formatDate(member.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                      {!members.length ? (
                        <TableRow>
                          <TableCell colSpan={4}>
                            <Typography
                              color="text.secondary"
                              sx={{ py: 3, textAlign: 'center' }}
                            >
                              Участники организации пока не найдены.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : null}
            </TabPanel>

            <TabPanel index={1} value={activeTab}>
              <Alert severity="info">Раздел обучения будет добавлен позже.</Alert>
            </TabPanel>

            <TabPanel index={2} value={activeTab}>
              <Alert severity="info">Настройки организации будут добавлены позже.</Alert>
            </TabPanel>
          </Box>
        </Paper>
      </Box>

      <InvitModal
        currentOrgId={currentOrgId}
        onClose={() => setIsInvitationModalOpen(false)}
        onSuccess={handleInvitationSuccess}
        open={isInvitationModalOpen}
      />
    </Box>
  )
}

export default AdminPanel

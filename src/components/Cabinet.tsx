import { useNavigate } from 'react-router-dom'
import {
  AppBar,
  Box,
  Button,
  Container,
  Paper,
  Toolbar,
  Typography,
} from '@mui/material'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined'

type CabinetProps = {
  onLogout: () => void
}

const Cabinet = ({ onLogout }: CabinetProps) => {
  const navigate = useNavigate()

  const handleLogout = () => {
    onLogout()
    navigate('/login', { replace: true })
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

      <Container className="admin-container" maxWidth="lg">
        <Paper className="admin-placeholder" elevation={0}>
          <Box className="admin-placeholder-icon" aria-hidden="true">
            <SpaceDashboardOutlinedIcon />
          </Box>

          <Box className="admin-placeholder-copy">
            <Typography component="h1" variant="h4">
              Кабинет пользователя
            </Typography>
            <Typography color="text.secondary">
              Это временная страница. Здесь позже появится личный кабинет.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default Cabinet

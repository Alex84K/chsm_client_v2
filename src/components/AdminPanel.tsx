import * as React from "react";
import {
  useNavigate,
  useLocation,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import {
  styled,
  useTheme,
  type CSSObject,
  type Theme,
} from "@mui/material/styles";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MuiAppBar, {
  type AppBarProps as MuiAppBarProps,
} from "@mui/material/AppBar";
import MuiDrawer from "@mui/material/Drawer";
import Paper from "@mui/material/Paper";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import HomeIcon from "@mui/icons-material/Home";
import MenuIcon from "@mui/icons-material/Menu";
import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";
import SettingsIcon from "@mui/icons-material/Settings";
import StudentList from "./StudentList";
import UserList from "./UserList";
import SettingsComp from "./SettingsComp";
import SessionsList from "./SessionsList";
import StudentProfilePage from "./StudentProfilePage";
import EnrollmentDetailPage from "./EnrollmentDetailPage";

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  variants: [
    {
      props: ({ open }) => open,
      style: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(["width", "margin"], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
  ],
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  variants: [
    {
      props: ({ open }) => open,
      style: {
        ...openedMixin(theme),
        "& .MuiDrawer-paper": openedMixin(theme),
      },
    },
    {
      props: ({ open }) => !open,
      style: {
        ...closedMixin(theme),
        "& .MuiDrawer-paper": closedMixin(theme),
      },
    },
  ],
}));

type AdminPanelProps = {
  currentOrgId: string;
  onLogout: () => void;
};

type AdminSection = "users" | "students" | "sessions" | "settings";

const AdminPanel = ({ currentOrgId, onLogout }: AdminPanelProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = React.useState(false);

  const getActiveSection = (): AdminSection => {
    const path = location.pathname;
    if (
      path.startsWith("/admin/students") ||
      path.startsWith("/admin/enrollments")
    ) {
      return "students";
    }
    if (path.startsWith("/admin/sessions")) {
      return "sessions";
    }
    if (path.startsWith("/admin/settings")) {
      return "settings";
    }
    return "users";
  };

  const activeSection = getActiveSection();

  const handleLogout = () => {
    onLogout();
    navigate("/login", { replace: true });
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            aria-label="open drawer"
            color="inherit"
            edge="start"
            onClick={() => setOpen(true)}
            sx={[{ marginRight: 5 }, open && { display: "none" }]}
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
            {theme.direction === "rtl" ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <Box sx={{ display: "flex", flexDirection: "column", py: 1 }}>
          <ListItemButton
            onClick={() => navigate("/admin")}
            selected={activeSection === "users"}
          >
            <ListItemIcon>
              <PeopleIcon
                color={activeSection === "users" ? "primary" : "inherit"}
              />
            </ListItemIcon>
            {open ? <ListItemText primary="Users" /> : null}
          </ListItemButton>
          <ListItemButton
            onClick={() => navigate("/admin/students")}
            selected={activeSection === "students"}
          >
            <ListItemIcon>
              <SchoolIcon
                color={activeSection === "students" ? "primary" : "inherit"}
              />
            </ListItemIcon>
            {open ? <ListItemText primary="Students" /> : null}
          </ListItemButton>
          <ListItemButton
            onClick={() => navigate("/admin/sessions")}
            selected={activeSection === "sessions"}
          >
            <ListItemIcon>
              <CalendarMonthIcon
                color={activeSection === "sessions" ? "primary" : "inherit"}
              />
            </ListItemIcon>
            {open ? <ListItemText primary="Sessions" /> : null}
          </ListItemButton>
          <ListItemButton
            onClick={() => navigate("/admin/settings")}
            selected={activeSection === "settings"}
          >
            <ListItemIcon>
              <SettingsIcon
                color={activeSection === "settings" ? "primary" : "inherit"}
              />
            </ListItemIcon>
            {open ? <ListItemText primary="Settings" /> : null}
          </ListItemButton>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />

        <Paper
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, p: 3 }}>
            <Typography component="h1" variant="h5">
              Панель администратора организации
            </Typography>
            <Typography color="text.secondary">
              Временные разделы панели. Данные участников загружаются из API.
            </Typography>
          </Box>

          <Divider />

          <Box sx={{ p: 3 }}>
            {!currentOrgId ? (
              <Alert severity="warning">
                Не задан идентификатор организации. Выберите организацию для
                продолжения.
              </Alert>
            ) : (
              <Routes>
                <Route
                  path="/"
                  element={<UserList currentOrgId={currentOrgId} />}
                />
                <Route
                  path="/students"
                  element={<StudentList currentOrgId={currentOrgId} />}
                />
                <Route path="/students/:id" element={<StudentProfilePage />} />
                <Route
                  path="/enrollments/:id"
                  element={<EnrollmentDetailPage />}
                />
                <Route
                  path="/sessions"
                  element={<SessionsList currentOrgId={currentOrgId} />}
                />
                <Route
                  path="/settings"
                  element={<SettingsComp currentOrgId={currentOrgId} />}
                />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Routes>
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default AdminPanel;

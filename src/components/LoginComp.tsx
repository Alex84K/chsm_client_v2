import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Link,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import type { AuthUser } from "../types/users.types";
import { apiUrl } from "../api/apiConfig";

type LoginResponse = {
  accessToken: string;
  user: AuthUser;
};

type LoginCompProps = {
  onLoginSuccess: (accessToken: string, user: AuthUser) => void;
};

const API_BASE_URL = apiUrl;

const LoginComp = ({ onLoginSuccess }: LoginCompProps) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Введите email и пароль.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      if (response.status === 401) {
        setError("Неверный email или пароль.");
        return;
      }

      if (!response.ok) {
        setError("Не удалось выполнить вход. Попробуйте позже.");
        return;
      }

      const data = (await response.json()) as LoginResponse;

      if (!data.accessToken) {
        setError("Сервер не вернул токен доступа.");
        return;
      }

      onLoginSuccess(data.accessToken, data.user);
    } catch {
      setError("Сервер недоступен. Проверьте подключение и попробуйте снова.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="">
      <Container maxWidth="sm" className="login-container pt-5 pb-5">
        <Paper elevation={0} className="login-card">
          <Box className="login-icon" aria-hidden="true">
            <LockOutlinedIcon />
          </Box>

          <Box className="login-heading">
            <Typography variant="h5" component="h1">
              Login
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Используйте учетную запись организации.
            </Typography>
          </Box>

          <Box component="form" className="login-form" onSubmit={handleSubmit}>
            {error ? <Alert severity="error">{error}</Alert> : null}

            <TextField
              autoComplete="email"
              autoFocus
              disabled={isLoading}
              fullWidth
              label="Email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />

            <TextField
              autoComplete="current-password"
              disabled={isLoading}
              fullWidth
              label="Пароль"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
            <Box sx={{ mt: 1, textAlign: "right" }}>
              <Link
                component={"a"}
                href="/auth/forgot-password"
                variant="body2"
              >
                Забыли пароль?
              </Link>
            </Box>

            <Button
              disabled={isLoading}
              fullWidth
              size="large"
              type="submit"
              variant="contained"
            >
              {isLoading ? (
                <CircularProgress color="inherit" size={22} />
              ) : (
                "Войти"
              )}
            </Button>
          </Box>
        </Paper>
      </Container>

      <Container maxWidth="sm" className="">
        <Paper elevation={0} className="">
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Нет аккаунта?{" "}
            </Typography>
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate("/create-organization-request")}
            >
              Создать организацию
            </Link>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginComp;

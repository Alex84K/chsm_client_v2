import { type FormEvent, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import type { AuthUser } from "../types/users.types";
import { apiUrl } from "../api/apiConfig";

type ConfirmOrganizationProps = {
  onActivateSuccess: (accessToken: string, user: AuthUser) => void;
};

const ConfirmOrganization = ({
  onActivateSuccess,
}: ConfirmOrganizationProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("В ссылке отсутствует токен активации.");
      return;
    }

    if (password.length < 8) {
      setError("Пароль должен содержать минимум 8 символов.");
      return;
    }

    setIsPending(true);

    try {
      const response = await fetch(`${apiUrl}/auth/activate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      if (!response.ok) {
        if (response.status === 400 || response.status === 404) {
          throw new Error(
            "Ссылка недействительна или срок её действия истек. Запросите новое письмо активации.",
          );
        }
        throw new Error(
          "Не удалось активировать организацию. Попробуйте позже.",
        );
      }

      const result = (await response.json()) as {
        accessToken: string;
        user: AuthUser;
      };

      onActivateSuccess(result.accessToken, result.user);
      // После активации организации пользователь обычно переходит к выбору или в админку
      navigate("/organizations", { replace: true });
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "Неизвестная ошибка при активации.",
      );
    } finally {
      setIsPending(false);
    }
  };

  if (!token) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Alert severity="error">В ссылке отсутствует токен активации.</Alert>
      </Container>
    );
  }

  return (
    <Box className="login-screen">
      <Container maxWidth="sm" className="login-container">
        <Paper elevation={0} className="login-card">
          <Box className="login-icon" aria-hidden="true">
            <MarkEmailReadOutlinedIcon />
          </Box>

          <Box className="login-heading">
            <Typography component="h1" variant="h5">
              Активация организации
            </Typography>
            <Typography color="text.secondary">
              Придумайте пароль для входа в панель управления вашей
              организацией.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" className="login-form" onSubmit={handleSubmit}>
            <TextField
              autoComplete="new-password"
              autoFocus
              disabled={isPending}
              fullWidth
              label="Придумайте пароль"
              onChange={(e) => setPassword(e.target.value)}
              required
              type="password"
              value={password}
            />

            <Button
              disabled={isPending}
              fullWidth
              size="large"
              type="submit"
              variant="contained"
            >
              {isPending ? (
                <CircularProgress color="inherit" size={22} />
              ) : (
                "Активировать и войти"
              )}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ConfirmOrganization;

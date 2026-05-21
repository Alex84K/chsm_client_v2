import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Alert, Box, Button, CircularProgress, Container, Paper, TextField, Typography } from "@mui/material";
import LockResetIcon from "@mui/icons-material/LockReset";
import { resetPassword } from "../api/users.api";


const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState<string>("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Extract token from query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get("token") ?? "";
    setToken(t);
  }, [location.search]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!token) {
      setError("Неверная ссылка для сброса пароля.");
      return;
    }
    if (password.length < 6) {
      setError("Пароль должен быть минимум 6 символов.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Пароли не совпадают.");
      return;
    }
    setIsLoading(true);
    try {
      await resetPassword(token, password);
      setMessage("Пароль успешно изменён. Перенаправляем на страницу входа...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setError(err?.message ?? "Ошибка при сбросе пароля.");
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => navigate("/login");

  return (
    <Box className="reset-password-screen pt-4">
      <Container maxWidth="sm" className="reset-password-container  border rounded">
        <Paper elevation={0} className="reset-password-card" sx={{ p: 3 }}>
          <Box className="reset-password-icon" aria-hidden="true" sx={{ textAlign: "center", mb: 1 }}>
            <LockResetIcon sx={{ fontSize: 48 }} color="primary"/>
          </Box>
          <Box className="reset-password-heading" sx={{ textAlign: "center", mb: 3 }}>
            <Typography variant="h5" component="h1">
              Сброс пароля
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Придумайте новый пароль.
            </Typography>
          </Box>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {error && <Alert severity="error">{error}</Alert>}
            {message && <Alert severity="success">{message}</Alert>}
            <TextField
              autoFocus
              disabled={isLoading}
              fullWidth
              label="Новый пароль"
              name="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <TextField
              disabled={isLoading}
              fullWidth
              label="Подтвердить пароль"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
            <Box>
            <Button variant="outlined" onClick={goBack} disabled={isLoading} className="w-100 mb-3">
                Назад к входу
              </Button>
              <Button type="submit" variant="contained" disabled={isLoading} fullWidth>
                {isLoading ? <CircularProgress size={22} color="inherit" /> : "Сохранить"}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ResetPassword;

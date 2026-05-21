import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import LockResetIcon from "@mui/icons-material/LockReset";
import { forgotPassword } from "../api/users.api";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!email.trim()) {
      setError("Введите email");
      return;
    }
    setIsLoading(true);
    try {
      await forgotPassword(email.trim());
      setMessage(
        "Если указанный email зарегистирован, на него отправлены инструкции по восстановлению пароля.",
      );
    } catch (err: any) {
      setError(err?.message ?? "Ошибка при отправке запроса.");
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => navigate("/login");

  return (
    <Box className="forgot-password-screen pt-5">
      <Container maxWidth="sm" className="forgot-password-container border rounded">
        <Paper elevation={0} className="forgot-password-card" sx={{ p: 3 }}>
          <Box
            className="forgot-password-icon"
            aria-hidden="true"
            sx={{ textAlign: "center", mb: 1 }}
          >
           <LockResetIcon sx={{ fontSize: 48 }} color="primary"/>
          </Box>
          <Box
            className="forgot-password-heading"
            sx={{ textAlign: "center", mb: 3 }}
          >
            <Typography variant="h5" component="h1">
              Восстановление пароля
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Введите ваш email, и мы пришлём инструкции.
            </Typography>
          </Box>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            {error && <Alert severity="error">{error}</Alert>}
            {message && <Alert severity="success">{message}</Alert>}
            <TextField
              autoComplete="email"
              autoFocus
              disabled={isLoading}
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Box>
              <Button variant="outlined" onClick={goBack} disabled={isLoading} className="w-100 mb-3">
                Назад к входу
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
                fullWidth
              >
                {isLoading ? (
                  <CircularProgress size={22} color="inherit" />
                ) : (
                  "Отправить"
                )}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ForgotPassword;

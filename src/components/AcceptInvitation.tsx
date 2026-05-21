import { type FormEvent, useEffect, useState } from "react";
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
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import type { AuthUser, VerifyInvitationResponse } from "../types/users.types";
import { apiUrl } from "../api/apiConfig";

type AcceptInvitationProps = {
  onAcceptSuccess: (accessToken: string, user: AuthUser) => void;
};

const AcceptInvitation = ({ onAcceptSuccess }: AcceptInvitationProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [verificationData, setVerificationData] = useState<VerifyInvitationResponse | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [verifyError, setVerifyError] = useState("");

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setVerifyError("Токен приглашения отсутствует.");
        setIsVerifying(false);
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/auth/invitations/verify?token=${token}`);
        if (!response.ok) {
          if (response.status === 400 || response.status === 404) {
            throw new Error("Ссылка недействительна или срок её действия истек.");
          }
          throw new Error("Ошибка при проверке приглашения.");
        }
        const data = (await response.json()) as VerifyInvitationResponse;
        setVerificationData(data);
      } catch (err) {
        setVerifyError(err instanceof Error ? err.message : "Неизвестная ошибка");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError("");

    if (password.length < 8) {
      setSubmitError("Пароль должен содержать минимум 8 символов.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiUrl}/auth/invitations/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
          name: name.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Не удалось принять приглашение. Попробйте позже.");
      }

      const result = (await response.json()) as {
        accessToken: string;
        user: AuthUser;
      };

      onAcceptSuccess(result.accessToken, result.user);
      navigate("/organizations", { replace: true });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Ошибка при регистрации");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isVerifying) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (verifyError || !verificationData) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Alert severity="error">
          {verifyError || "Ошибка загрузки данных приглашения."}
          <Box sx={{ mt: 2 }}>
            <Button onClick={() => navigate("/login")} variant="outlined" size="small">
              Вернуться на главную
            </Button>
          </Box>
        </Alert>
      </Container>
    );
  }

  return (
    <Box className="login-screen">
      <Container maxWidth="sm" className="login-container">
        <Paper elevation={0} className="login-card">
          <Box className="login-icon" aria-hidden="true">
            <PersonAddOutlinedIcon />
          </Box>

          <Box className="login-heading">
            <Typography component="h1" variant="h5">
              Принятие приглашения
            </Typography>
            <Typography color="text.secondary">
              Вы приглашены в организацию <strong>{verificationData.organizationName}</strong> в качестве <strong>{verificationData.role}</strong>.
            </Typography>
          </Box>

          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          <Box component="form" className="login-form" onSubmit={handleSubmit}>
            <TextField
              disabled
              fullWidth
              label="Email"
              value={verificationData.email}
              variant="filled"
            />

            <TextField
              autoComplete="name"
              disabled={isSubmitting}
              fullWidth
              label="Ваше имя (необязательно)"
              onChange={(e) => setName(e.target.value)}
              value={name}
            />

            <TextField
              autoComplete="new-password"
              autoFocus
              disabled={isSubmitting}
              fullWidth
              label="Придумайте пароль"
              onChange={(e) => setPassword(e.target.value)}
              required
              type="password"
              value={password}
            />

            <Button
              disabled={isSubmitting}
              fullWidth
              size="large"
              type="submit"
              variant="contained"
            >
              {isSubmitting ? (
                <CircularProgress color="inherit" size={22} />
              ) : (
                "Завершить регистрацию"
              )}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default AcceptInvitation;

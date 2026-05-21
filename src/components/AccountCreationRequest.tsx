import { type FormEvent, useState } from "react";
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
  Link,
} from "@mui/material";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import type { AccountCreationRequest as AccountCreationRequestType } from "../types/users.types";
import { accountCreationRequest } from "../api/auth.api";

const AccountCreationRequest = () => {
  const navigate = useNavigate();
  const [applicantName, setApplicantName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess(false);

    if (
      !applicantName.trim() ||
      !applicantEmail.trim() ||
      !organizationName.trim()
    ) {
      setError("Пожалуйста, заполните все поля.");
      return;
    }

    // Простая валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(applicantEmail)) {
      setError("Введите корректный email адрес.");
      return;
    }

    setIsLoading(true);

    try {
      const requestData: AccountCreationRequestType = {
        applicantName: applicantName.trim(),
        applicantEmail: applicantEmail.trim(),
        organizationName: organizationName.trim(),
      };

      await accountCreationRequest(requestData);

      alert("Спасибо! Ваша заявка будет рассмотрена.");

      // Очищаем форму после успешной отправки
      setApplicantName("");
      setApplicantEmail("");
      setOrganizationName("");
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("Не авторизован. Пожалуйста, войдите в систему.");
      } else if (err.response?.status === 409) {
        setError(
          "Заявка с таким email или названием организации уже существует.",
        );
      } else if (err.response?.status === 400) {
        setError("Неверные данные. Проверьте правильность заполнения.");
      } else {
        setError("Не удалось отправить заявку. Попробуйте позже.");
      }
      console.error("Error creating account request:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="pt-5">
      <Container maxWidth="sm" className="account-creation-container">
        <Paper elevation={0} className="border p-4">
          <Box className="account-creation-icon" aria-hidden="true">
            <PersonAddOutlinedIcon />
          </Box>

          <Box className="account-creation-heading mb-3">
            <Typography variant="h5" component="h1" className="mb-2">
              Заявка на создание организации
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Заполните форму для регистрации новой организации в системе.
            </Typography>
          </Box>

          <Box
            component="form"
            className="account-creation-form"
            onSubmit={handleSubmit}
          >
            {error && (
              <Alert severity="error" onClose={() => setError("")}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success">
                Заявка успешно отправлена! Перенаправление на страницу входа...
              </Alert>
            )}

            <TextField
              autoComplete="name"
              autoFocus
              disabled={isLoading || success}
              fullWidth
              label="ФИО заявителя"
              name="applicantName"
              onChange={(event) => setApplicantName(event.target.value)}
              required
              type="text"
              value={applicantName}
              helperText="Укажите ваше полное имя"
              className="mb-3"
            />

            <TextField
              autoComplete="email"
              disabled={isLoading || success}
              fullWidth
              label="Email заявителя"
              name="applicantEmail"
              onChange={(event) => setApplicantEmail(event.target.value)}
              required
              type="email"
              value={applicantEmail}
              helperText="На этот email придет уведомление о решении"
              className="mb-3"
            />

            <TextField
              autoComplete="organization"
              disabled={isLoading || success}
              fullWidth
              label="Название организации"
              name="organizationName"
              onChange={(event) => setOrganizationName(event.target.value)}
              required
              type="text"
              value={organizationName}
              helperText="Укажите официальное название организации"
              className="mb-3"
            />

            <Box sx={{ mt: 2, textAlign: "right" }}>
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate("/login")}
                disabled={isLoading}
              >
                Вернуться ко входу
              </Link>
            </Box>

            <Button
              disabled={isLoading || success}
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              sx={{ mt: 2 }}
            >
              {isLoading ? (
                <CircularProgress color="inherit" size={22} />
              ) : (
                "Отправить заявку"
              )}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default AccountCreationRequest;

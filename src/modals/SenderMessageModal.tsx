import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Box,
  TextField,
  LinearProgress,
  Typography,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Divider,
} from "@mui/material";
import { Mail, Send } from "lucide-react";
import { sendTelegramBroadcast } from "../api/tg.api";
import type { Student } from "../types/student.types";
import type { OrganizationMember } from "../types/users.types";

interface Props {
  open: boolean;
  users: Student[];
  members: OrganizationMember[];
  currentOrgId: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export default function SenderMessageModal({
  open,
  users,
  members,
  currentOrgId,
  onClose,
  onSuccess,
}: Props) {
  // Состояния для выбора каналов
  const [sendTg, setSendTg] = useState(true);
  const [sendEmail, setSendEmail] = useState(false);

  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("Важное уведомление");
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState("");

  const resetState = () => {
    setMessage("");
    setSubject("Важное уведомление");
    setIsSending(false);
    setSendTg(true);
    setSendEmail(false);
    setStatus("");
  };

  const handleClose = () => {
    if (isSending) return;
    resetState();
    onClose();
  };

  const getStudentEmail = (student: Student) => {
    const member = members.find((m) => m.userId === student.userId);
    return member?.user?.email || "";
  };

  const handleMessageChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const val = e.target.value;
    if (val.length <= 4000) {
      setMessage(val);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    if (!sendTg && !sendEmail) {
      alert("Выберите хотя бы один канал отправки (Telegram или Email)");
      return;
    }

    setIsSending(true);
    const successMessageParts: string[] = [];

    try {
      // 1. Отправка в Telegram
      if (sendTg) {
        setStatus("Отправка в Telegram...");
        const payload = {
          userIds: users.map((u) => u.userId),
          text: message,
        };
        const res = await sendTelegramBroadcast(currentOrgId, payload);

        if (res.sentCount === 0) {
          alert(
            "Ни один из выбранных студентов не подключил Telegram-уведомления. Рассылка отменена.",
          );
          setIsSending(false);
          setStatus("");
          return;
        }

        let tgSuccess = `Рассылка успешно запущена на Bot Server! Сообщение будет доставлено ${res.sentCount} из ${res.totalRequested} выбранных студентов.`;
        const diff = res.totalRequested - res.sentCount;
        if (diff > 0) {
          tgSuccess += ` Примечание: ${diff} студент(ов) не привязали свои Telegram-аккаунты в личном кабинете.`;
        }
        successMessageParts.push(tgSuccess);
      }

      // 2. Отправка по Email (Заглушка)
      if (sendEmail) {
        setStatus("Отправка Email (заглушка)...");
        // Имитируем небольшую задержку для реалистичности заглушки
        await new Promise((resolve) => setTimeout(resolve, 800));

        const countWithEmail = users.filter((u) => getStudentEmail(u)).length;
        successMessageParts.push(
          `[Email Заглушка] Письма отправлены ${countWithEmail} из ${users.length} студентов с темой "${subject}".`,
        );
      }

      onSuccess(successMessageParts.join("\n\n"));
      handleClose();
    } catch (error: unknown) {
      const err = error as {
        response?: {
          status?: number;
          data?: {
            message?: string;
          };
        };
        message?: string;
      };

      if (err.response?.status === 400) {
        alert(
          `Ошибка 400: ${err.response?.data?.message || "Неверный формат данных или пустое сообщение."}`,
        );
      } else if (err.response?.status === 401) {
        alert(
          "Ошибка 401: Истек сеанс администратора. Пожалуйста, авторизуйтесь заново.",
        );
      } else {
        alert(`Ошибка при отправке: ${err.message || String(error)}`);
      }
    } finally {
      setIsSending(false);
      setStatus("");
    }
  };

  // Считаем сколько реально получат сообщение
  const countTg = users.length; // На фронте нет прямой информации о привязке ТГ, поэтому ориентируемся на полное количество выбранных
  const countEmail = users.filter((u) => getStudentEmail(u)).length;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Массовая рассылка</DialogTitle>

      <DialogContent dividers>
        {/* Выбор каналов */}
        <Typography variant="subtitle2" gutterBottom>
          Выберите каналы отправки:
        </Typography>
        <FormGroup sx={{ mb: 2, flexDirection: "row", gap: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={sendTg}
                onChange={(e) => setSendTg(e.target.checked)}
                disabled={isSending}
              />
            }
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Send size={16} /> Telegram ({countTg})
              </Box>
            }
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                disabled={isSending}
              />
            }
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Mail size={16} /> Email ({countEmail})
              </Box>
            }
          />
        </FormGroup>

        <Divider sx={{ mb: 2 }} />

        {/* Список пользователей (превью) */}
        <Typography variant="subtitle2" gutterBottom>
          Получатели ({users.length}):
        </Typography>
        <Box
          sx={{
            mb: 2,
            display: "flex",
            flexWrap: "wrap",
            gap: 0.5,
            maxHeight: "80px",
            overflowY: "auto",
            p: 1,
            border: "1px solid #eee",
            borderRadius: 1,
          }}
        >
          {users.map((u) => {
            const hasEmail = !!getStudentEmail(u);
            const isWarning = sendEmail && !hasEmail;
            return (
              <Chip
                key={u.id}
                label={u.name || "Студент"}
                size="small"
                color={isWarning ? "error" : "default"}
                variant="outlined"
              />
            );
          })}
        </Box>

        {/* Поля ввода */}
        {sendEmail && (
          <TextField
            fullWidth
            label="Тема письма"
            variant="outlined"
            size="small"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={isSending}
            sx={{ mb: 2 }}
          />
        )}

        <TextField
          multiline
          rows={6}
          fullWidth
          variant="outlined"
          label="Текст сообщения"
          placeholder="Введите общий текст для всех выбранных каналов..."
          value={message}
          onChange={handleMessageChange}
          disabled={isSending}
        />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 0.5,
            mb: 1,
          }}
        >
          <Box>
            {sendTg && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block" }}
              >
                Поддерживается HTML-разметка Telegram:
                <br />
                <code>&lt;b&gt;текст&lt;/b&gt;</code> — <b>жирный</b>, &nbsp;
                <code>&lt;i&gt;текст&lt;/i&gt;</code> — <i>курсив</i>, &nbsp;
                <code>&lt;code&gt;текст&lt;/code&gt;</code> — моноширинный
              </Typography>
            )}
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ minWidth: "100px", textAlign: "right" }}
          >
            {message.length} / 4000 символов
          </Typography>
        </Box>

        {isSending && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="primary">
              {status}
            </Typography>
            <LinearProgress sx={{ mt: 1 }} />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={isSending}>
          Отмена
        </Button>
        <Button
          onClick={handleSend}
          variant="contained"
          disabled={isSending || !message.trim() || (!sendTg && !sendEmail)}
        >
          {isSending ? "Отправка..." : "Запустить рассылку"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

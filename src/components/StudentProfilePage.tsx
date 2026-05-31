import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  Stack,
  Chip,
  Breadcrumbs,
  Link,
  CircularProgress,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TelegramIcon from "@mui/icons-material/Telegram";
import AddIcon from "@mui/icons-material/Add";
import { useStudent } from "../hooks/useStudents";
import { useStudentEnrollments } from "../hooks/useEnrollments";
import SessionsRunsModal from "../modals/SessionsRunsModal";
import { getCurrentOrgId } from "../utils/getOrganisationsUtils";

const StudentProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const orgId = getCurrentOrgId() || "";
  const [isSessionsModalOpen, setIsSessionsModalOpen] = React.useState(false);

  const {
    data: student,
    isLoading: isLoadingStudent,
    error: errorStudent,
  } = useStudent(orgId, id!);
  const { data: enrollments = [], isLoading: isLoadingEnrollments } =
    useStudentEnrollments(orgId, id!);

  if (isLoadingStudent) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (errorStudent || !student) {
    return <Alert severity="error">Студент не найден</Alert>;
  }

  const averageGrade = 4.6; // Placeholder
  const sessionsCount = enrollments.length;
  const enrollmentYear = student.enrolledAt
    ? new Date(student.enrolledAt).getFullYear()
    : "—";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ENROLLED":
        return "success";
      case "DROPPED":
        return "error";
      case "COMPLETED":
        return "primary";
      default:
        return "default";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Box sx={{ p: 1 }}>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            underline="hover"
            color="inherit"
            onClick={() => navigate("/admin")}
            sx={{ cursor: "pointer", display: "flex", alignItems: "center" }}
          >
            <ArrowBackIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Студенты
          </Link>
          <Typography color="text.primary">{student.name}</Typography>
        </Breadcrumbs>
        {student.userId && (
          <Button
            variant="outlined"
            startIcon={<TelegramIcon />}
            href={`https://t.me/${student.userId}`}
            target="_blank"
            sx={{ borderRadius: 2 }}
          >
            Telegram
          </Button>
        )}
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
          mb: 4,
        }}
      >
        <Box sx={{ flex: 2 }}>
          <Card sx={{ borderRadius: 4, p: 1 }}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  flexWrap: "wrap",
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: "primary.light",
                    width: 80,
                    height: 80,
                    fontSize: "2rem",
                  }}
                >
                  {getInitials(student.name)}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                    {student.name}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {student.instrument} • {student.specialization}
                  </Typography>
                  {student.city && (
                    <Typography variant="body2" color="text.secondary">
                      {student.city}, {student.country}
                    </Typography>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", gap: 2, height: "100%" }}>
            <Card
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                p: 1,
                borderRadius: 3,
                bgcolor: "#fdfcf9",
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                {sessionsCount}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ textAlign: "center" }}
              >
                сессий пройдено
              </Typography>
            </Card>
            <Card
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                p: 1,
                borderRadius: 3,
                bgcolor: "#fdfcf9",
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                {averageGrade}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ textAlign: "center" }}
              >
                средний балл
              </Typography>
            </Card>
            <Card
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                p: 1,
                borderRadius: 3,
                bgcolor: "#fdfcf9",
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                {enrollmentYear}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ textAlign: "center" }}
              >
                год поступления
              </Typography>
            </Card>
          </Box>
        </Box>
      </Box>

      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
        Учебные сессии (Потоки)
      </Typography>

      <Stack spacing={2}>
        {isLoadingEnrollments ? (
          <CircularProgress size={24} />
        ) : enrollments.length === 0 ? (
          <Typography color="text.secondary">
            Нет активных зачислений
          </Typography>
        ) : (
          enrollments.map((enrollment) => (
            <Card
              key={enrollment.id}
              sx={{
                borderRadius: 3,
                borderLeft: "5px solid",
                borderLeftColor: `${getStatusColor(enrollment.status)}.main`,
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        bgcolor: `${getStatusColor(enrollment.status)}.main`,
                      }}
                    />
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "bold" }}
                      >
                        Поток {enrollment.sessionRunId.substring(0, 8)}...
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Зачислен{" "}
                        {enrollment.enrolledAt
                          ? new Date(enrollment.enrolledAt).toLocaleDateString(
                              "ru-RU",
                            )
                          : "—"}{" "}
                        • Ведомость: {enrollment.gradebook?.status || "DRAFT"}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Chip
                      label={enrollment.status}
                      size="small"
                      color={
                        getStatusColor(enrollment.status) as
                          | "success"
                          | "error"
                          | "primary"
                          | "default"
                      }
                      sx={{ borderRadius: 1 }}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() =>
                        navigate(`/admin/enrollments/${enrollment.id}`)
                      }
                      sx={{ borderRadius: 2 }}
                    >
                      Зачётка
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))
        )}

        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          sx={{ py: 1.5, borderRadius: 3, borderStyle: "dashed" }}
          fullWidth
          onClick={() => setIsSessionsModalOpen(true)}
        >
          Зачислить в сессию
        </Button>
      </Stack>

      <SessionsRunsModal
        open={isSessionsModalOpen}
        onClose={() => setIsSessionsModalOpen(false)}
        studentId={id!}
      />
    </Box>
  );
};

export default StudentProfilePage;

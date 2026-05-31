import * as React from "react";
import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Chip,
  Divider,
  Breadcrumbs,
  Link,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Paper,
  LinearProgress,
  Grid,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  CloudDone as CloudDoneIcon,
  Edit as EditIcon,
  InfoOutlined as InfoIcon,
  WarningAmber as WarningIcon,
  CheckCircleOutlined as SuccessIcon,
  ErrorOutlined as ErrorIcon,
  Send as SendIcon,
  PictureAsPdf as PdfIcon,
} from "@mui/icons-material";

import {
  useEnrollment,
  useCreateGradeEntry,
  useUpdateGradeEntry,
  useSubmitGradebook,
  useApproveGradebook,
  useUpdateGradebookStatus,
} from "../hooks/useEnrollments";
import { useStudent } from "../hooks/useStudents";
import { useSessionRun, useSubjects } from "../hooks/useSessions";
import ManualGradesModal from "../modals/ManualGradesModal";
import {
  calculateGradeResultV2,
  STATUS_CONFIG,
  formatGrade,
} from "../utils/gradeCalculations";
import { getCurrentOrgId } from "../utils/getOrganisationsUtils";

const EnrollmentDetailPage = () => {
  const { id: enrollmentId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const orgId = getCurrentOrgId() || "";
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // 1. Fetch main data
  const { data: enrollment, isLoading: isLoadingEnrollment } = useEnrollment(
    orgId,
    enrollmentId!,
  );
  const { data: student } = useStudent(orgId, enrollment?.studentId || "");
  const { data: sessionRun } = useSessionRun(
    orgId,
    enrollment?.sessionRunId || "",
  );
  const { data: allSubjects = [], isLoading: isLoadingSubjects } =
    useSubjects(orgId);

  // Mutations
  const createGradeEntryMutation = useCreateGradeEntry();
  const updateGradeEntryMutation = useUpdateGradeEntry();
  const submitGradebookMutation = useSubmitGradebook();
  const approveGradebookMutation = useApproveGradebook();
  const updateGradebookStatusMutation = useUpdateGradebookStatus();

  // 2. Filter subjects
  const subjects = useMemo(() => {
    if (!allSubjects || !enrollment?.sessionRunId) return [];
    return allSubjects.filter(
      (subject) => subject.sessionRunId === enrollment.sessionRunId,
    );
  }, [allSubjects, enrollment]);

  // 3. Dynamic results calculation
  const gradeResult = useMemo(() => {
    return calculateGradeResultV2(subjects, enrollment?.grades || []);
  }, [subjects, enrollment]);

  if (isLoadingEnrollment || isLoadingSubjects) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const gradebook = enrollment?.gradebook;
  const steps = ["Черновик", "На проверке", "Утверждено"];

  const getActiveStep = () => {
    if (gradebook?.status === "APPROVED") return 2;
    if (gradebook?.status === "SUBMITTED") return 1;
    return 0;
  };

  const handleSaveGrade = async (
    subjectId: string,
    value: number,
    existingEntryId?: string,
  ) => {
    try {
      if (existingEntryId) {
        await updateGradeEntryMutation.mutateAsync({
          orgId,
          enrollmentId: enrollmentId!,
          gradeId: existingEntryId,
          payload: { value },
        });
      } else {
        await createGradeEntryMutation.mutateAsync({
          orgId,
          enrollmentId: enrollmentId!,
          payload: {
            subjectId,
            value,
            source: "manual",
          },
        });
      }
    } catch {
      alert("Ошибка при сохранении оценки");
    }
  };

  const handleUpdateStatus = async (
    status: "SUBMITTED" | "APPROVED" | "REJECTED",
  ) => {
    try {
      if (status === "SUBMITTED") {
        await submitGradebookMutation.mutateAsync({
          orgId,
          enrollmentId: enrollmentId!,
        });
      } else if (status === "APPROVED") {
        await approveGradebookMutation.mutateAsync({
          orgId,
          enrollmentId: enrollmentId!,
          payload: {
            approvedBy: "admin@school.local",
          },
        });
      } else {
        if (!gradebook) return;
        await updateGradebookStatusMutation.mutateAsync({
          orgId,
          enrollmentId: enrollmentId!,
          gradebookId: gradebook.id,
          payload: { status: "DRAFT" },
        });
      }
    } catch {
      alert("Ошибка при обновлении статуса ведомости");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return <SuccessIcon color="success" sx={{ fontSize: 20 }} />;
      case "conditional":
        return <WarningIcon color="warning" sx={{ fontSize: 20 }} />;
      case "fail":
        return <ErrorIcon color="error" sx={{ fontSize: 20 }} />;
      default:
        return <InfoIcon color="info" sx={{ fontSize: 20 }} />;
    }
  };

  const isApproved = gradebook?.status === "APPROVED";

  return (
    <Box sx={{ p: 1 }}>
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Breadcrumbs aria-label="breadcrumb">
            <Link
              underline="hover"
              color="inherit"
              onClick={() => navigate(`/admin/students/${student?.id}`)}
              sx={{ cursor: "pointer", display: "flex", alignItems: "center" }}
            >
              <ArrowBackIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              {student?.name || "Студент"}
            </Link>
            <Typography color="text.primary">Зачётка</Typography>
          </Breadcrumbs>
          <Typography variant="h5" sx={{ fontWeight: "bold", mt: 1 }}>
            {sessionRun?.description || "Текущая сессия"}
          </Typography>
        </Box>
        <Box>
          <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
            <Chip
              label={gradebook?.status || "DRAFT"}
              color={
                isApproved
                  ? "success"
                  : gradebook?.status === "SUBMITTED"
                    ? "warning"
                    : "default"
              }
              variant="outlined"
            />
            {gradebook?.status === "DRAFT" && (
              <Button
                variant="contained"
                onClick={() => handleUpdateStatus("SUBMITTED")}
                disabled={submitGradebookMutation.isPending}
              >
                Отправить ведомость
              </Button>
            )}
            {gradebook?.status === "SUBMITTED" && (
              <Button
                variant="contained"
                color="success"
                onClick={() => handleUpdateStatus("APPROVED")}
                disabled={approveGradebookMutation.isPending}
              >
                Утвердить ведомость
              </Button>
            )}
          </Stack>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* LEFT COLUMN: SUBJECTS GRID */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Предметы и оценки
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {subjects?.map((subject) => {
              const entry = enrollment?.grades?.find(
                (ge) => ge.subjectId === subject.id,
              );
              const isClassroom = entry?.source === "google_classroom";

              return (
                <Grid size={{ xs: 12, sm: 6 }} key={subject.id}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      boxShadow: "none",
                      border: "1px solid",
                      borderColor: isClassroom ? "primary.light" : "divider",
                      bgcolor: isClassroom ? "#f0f7ff" : "#fdfcf9",
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontWeight: 600 }}
                        >
                          {subject.title}
                        </Typography>
                        {isClassroom && (
                          <CloudDoneIcon
                            sx={{ fontSize: 14, color: "primary.main" }}
                          />
                        )}
                      </Box>
                      <Typography
                        variant="h4"
                        sx={{ fontWeight: "bold", mt: 1 }}
                      >
                        {entry?.value ?? "—"}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Grid>

        {/* RIGHT COLUMN: SUMMARY & ACTIONS */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
            Итоги успеваемости
          </Typography>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              mb: 4,
              bgcolor: "background.paper",
              borderColor:
                gradeResult.status === "fail" ? "error.light" : "divider",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {getStatusIcon(gradeResult.status)}
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    {STATUS_CONFIG[gradeResult.status]?.label || "Черновик"}
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  variant="outlined"
                  label={`${gradeResult.details.gradedCount}/${gradeResult.details.totalCount}`}
                />
              </Box>

              <Stack spacing={2}>
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Средний балл
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      {formatGrade(gradeResult.weightedAvg)}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min((gradeResult.weightedAvg || 0) * 10, 100)}
                    color={
                      (gradeResult.weightedAvg || 0) >= 7
                        ? "success"
                        : "warning"
                    }
                    sx={{ height: 6, borderRadius: 3, bgcolor: "divider" }}
                  />
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">
                    Профильный балл
                  </Typography>
                  <Typography
                    variant="body2"
                    color={gradeResult.blocked ? "error.main" : "success.main"}
                    sx={{ fontWeight: "bold" }}
                  >
                    {formatGrade(gradeResult.coreAvg)}
                  </Typography>
                </Box>

                {gradeResult.details.missingSubjects.length > 0 && (
                  <Box sx={{ bgcolor: "#fff5f5", p: 1.5, borderRadius: 2 }}>
                    <Typography
                      variant="caption"
                      color="error.dark"
                      sx={{ fontWeight: "bold", display: "block" }}
                    >
                      Нужны оценки:
                    </Typography>
                    <Typography
                      variant="caption"
                      color="error.dark"
                      sx={{ display: "block", lineHeight: 1.2 }}
                    >
                      {gradeResult.details.missingSubjects.join(", ")}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>

          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
            Управление
          </Typography>
          <Stack spacing={1.5} sx={{ mb: 4 }}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              fullWidth
              disabled={isApproved}
              sx={{ borderRadius: 2, justifyContent: "flex-start" }}
              onClick={() => setIsManualModalOpen(true)}
            >
              Установить оценки вручную
            </Button>
            <Button
              variant="outlined"
              startIcon={<SendIcon />}
              fullWidth
              sx={{ borderRadius: 2, justifyContent: "flex-start" }}
            >
              Уведомить студента
            </Button>
            <Button
              variant="outlined"
              startIcon={<PdfIcon />}
              fullWidth
              sx={{ borderRadius: 2, justifyContent: "flex-start" }}
            >
              Скачать PDF
            </Button>

            {gradebook?.status === "SUBMITTED" && (
              <>
                <Divider sx={{ my: 1 }} />
                <Button
                  variant="text"
                  color="error"
                  fullWidth
                  onClick={() => handleUpdateStatus("REJECTED")}
                  disabled={updateGradebookStatusMutation.isPending}
                >
                  Отклонить / На доработку
                </Button>
              </>
            )}
          </Stack>

          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
            Жизненный цикл
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
            <Paper elevation={0}>
              <Stepper
                activeStep={getActiveStep()}
                orientation="vertical"
                sx={{ "& .MuiStepLabel-label": { fontSize: "0.875rem" } }}
              >
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Paper>
          </Paper>
        </Grid>
      </Grid>

      <ManualGradesModal
        open={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        subjects={subjects}
        gradeEntries={enrollment?.grades}
        onSave={handleSaveGrade}
        isApproved={isApproved}
      />
    </Box>
  );
};

export default EnrollmentDetailPage;

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import { useStudents } from "../hooks/useStudents";
import {
  useCreateEnrollment,
  useAllOrganizationEnrollments,
} from "../hooks/useEnrollments";
import { useSessionRuns } from "../hooks/useSessions";
import { getCurrentOrgId } from "../utils/getOrganisationsUtils";
import type { EnrollmentStatus } from "../types/enrollments.types";

interface EnrollStudentToRunModalProps {
  open: boolean;
  onClose: () => void;
  defaultSessionRunId: string;
}

const EnrollStudentToRunModal: React.FC<EnrollStudentToRunModalProps> = ({
  open,
  onClose,
  defaultSessionRunId,
}) => {
  const orgId = getCurrentOrgId() || "";
  const [studentId, setStudentId] = useState("");
  const [enrolledAt, setEnrolledAt] = useState("");
  const [status, setStatus] = useState<EnrollmentStatus>("ENROLLED");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const { data: students = [] } = useStudents(orgId);
  const { data: allEnrollments = [] } = useAllOrganizationEnrollments(orgId);
  const { data: runs = [] } = useSessionRuns(orgId);
  const createMutation = useCreateEnrollment();

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        setStudentId("");
        setEnrolledAt(new Date().toISOString().split("T")[0]);
        setStatus("ENROLLED");
        setError(null);
        setSubmitted(false);
      }, 0);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setError(null);

    if (!studentId) {
      return;
    }

    // Validation: Check if student is already in another session run in the same academic year
    const currentRun = runs.find((r) => r.id === defaultSessionRunId);
    if (currentRun) {
      const studentEnrollments = allEnrollments.filter(
        (e) => e.studentId === studentId,
      );
      const isAlreadyEnrolledInSameYear = studentEnrollments.some((e) => {
        const otherRun = runs.find((r) => r.id === e.sessionRunId);
        return (
          otherRun?.academicYearId === currentRun.academicYearId &&
          e.sessionRunId !== defaultSessionRunId &&
          e.status !== "DROPPED"
        );
      });

      if (isAlreadyEnrolledInSameYear) {
        setError("Студент уже зачислен на сессию в этом учебном году");
        return;
      }
    }

    try {
      await createMutation.mutateAsync({
        orgId,
        payload: {
          studentId,
          sessionRunId: defaultSessionRunId,
          teacherName: undefined, // default can be empty
        },
      });
      onClose();
    } catch (err: unknown) {
      const errorResponse = err as Record<string, unknown> & {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setError(
        errorResponse?.response?.data?.message ||
          errorResponse?.message ||
          "Произошла ошибка при зачислении.",
      );
    }
  };

  const isLoading = createMutation.isPending;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Зачислить студента</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <FormControl fullWidth required error={submitted && !studentId}>
              <InputLabel id="enroll-student-select-label">Студент</InputLabel>
              <Select
                labelId="enroll-student-select-label"
                value={studentId}
                label="Студент"
                onChange={(e) => setStudentId(e.target.value)}
              >
                {students.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name}
                  </MenuItem>
                ))}
              </Select>
              {submitted && !studentId && (
                <FormHelperText>Выберите студента</FormHelperText>
              )}
            </FormControl>

            <TextField
              label="Дата зачисления"
              type="date"
              value={enrolledAt}
              onChange={(e) => setEnrolledAt(e.target.value)}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <FormControl fullWidth required>
              <InputLabel id="enroll-status-select-label">Статус</InputLabel>
              <Select
                labelId="enroll-status-select-label"
                value={status}
                label="Статус"
                onChange={(e) => setStatus(e.target.value as EnrollmentStatus)}
              >
                <MenuItem value="ENROLLED">Зачислен</MenuItem>
                <MenuItem value="DROPPED">Отчислен</MenuItem>
                <MenuItem value="COMPLETED">Завершил</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isLoading}>
            Отмена
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? "Зачисление..." : "Зачислить"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EnrollStudentToRunModal;

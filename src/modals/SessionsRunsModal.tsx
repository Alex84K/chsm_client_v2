import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import {
  useSessionRuns,
  useSessionLevels,
  useAcademicYears,
} from "../hooks/useSessions";
import { useCreateEnrollment } from "../hooks/useEnrollments";
import { getCurrentOrgId } from "../utils/getOrganisationsUtils";
import type { SessionRun } from "../types/session.types";

interface SessionsRunsModalProps {
  open: boolean;
  onClose: () => void;
  studentId: string;
}

const SessionsRunsModal = ({
  open,
  onClose,
  studentId,
}: SessionsRunsModalProps) => {
  const orgId = getCurrentOrgId() || "";
  const [selectedSessionRunId, setSelectedSessionRunId] = React.useState("");
  const [teacherName, setTeacherName] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const { data: sessionRuns = [], isLoading: isLoadingRuns } =
    useSessionRuns(orgId);
  const { data: levels = [] } = useSessionLevels(orgId);
  const { data: academicYears = [] } = useAcademicYears(orgId);

  const enrollMutation = useCreateEnrollment();

  React.useEffect(() => {
    if (open) {
      setTimeout(() => {
        setSelectedSessionRunId("");
        setTeacherName("");
        setErrorMsg(null);
      }, 0);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionRunId) {
      setErrorMsg("Пожалуйста, выберите учебный поток.");
      return;
    }

    try {
      await enrollMutation.mutateAsync({
        orgId,
        payload: {
          studentId,
          sessionRunId: selectedSessionRunId,
          teacherName: teacherName.trim() || undefined,
        },
      });
      onClose();
    } catch (err: unknown) {
      const errorResponse = err as Record<string, unknown> & {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setErrorMsg(
        errorResponse?.response?.data?.message ||
          errorResponse?.message ||
          "Не удалось зачислить студента на поток.",
      );
    }
  };

  const getSessionRunLabel = (run: SessionRun) => {
    const level = levels.find((l) => l.id === run.levelId);
    const year = academicYears.find((y) => y.id === run.academicYearId);
    const levelLabel = level ? `${level.title} (${level.number})` : run.levelId;
    const yearLabel = year ? year.label : run.academicYearId;
    const desc = run.description ? ` - ${run.description}` : "";
    return `${levelLabel} [${yearLabel}]${desc}`;
  };

  const isLoading = isLoadingRuns;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Зачислить студента на поток</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
            {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

            {isLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : sessionRuns.length === 0 ? (
              <Alert severity="info">Нет доступных учебных потоков.</Alert>
            ) : (
              <>
                <FormControl fullWidth required>
                  <InputLabel id="session-run-select-label">
                    Учебный поток
                  </InputLabel>
                  <Select
                    labelId="session-run-select-label"
                    value={selectedSessionRunId}
                    label="Учебный поток"
                    onChange={(e) => setSelectedSessionRunId(e.target.value)}
                  >
                    {sessionRuns.map((run) => (
                      <MenuItem key={run.id} value={run.id}>
                        {getSessionRunLabel(run)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box>
                  <InputLabel
                    shrink
                    htmlFor="teacher-name-input"
                    sx={{ mb: 1, color: "text.primary" }}
                  >
                    Имя куратора / преподавателя (опционально)
                  </InputLabel>
                  <input
                    id="teacher-name-input"
                    type="text"
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                      fontSize: "16px",
                    }}
                    placeholder="Иван Иванов"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                  />
                </Box>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Отмена</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!selectedSessionRunId || enrollMutation.isPending}
          >
            {enrollMutation.isPending ? "Зачисление..." : "Зачислить"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SessionsRunsModal;

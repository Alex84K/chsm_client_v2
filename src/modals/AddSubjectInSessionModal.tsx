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
  FormControlLabel,
  Switch,
  Autocomplete,
} from "@mui/material";
import {
  useCreateSubject,
  useSubjects,
  useSessionRun,
} from "../hooks/useSessions";
import { getCurrentOrgId } from "../utils/getOrganisationsUtils";

interface AddSubjectInSessionModalProps {
  open: boolean;
  onClose: () => void;
  defaultSessionRunId: string;
}

const AddSubjectInSessionModal: React.FC<AddSubjectInSessionModalProps> = ({
  open,
  onClose,
  defaultSessionRunId,
}) => {
  const orgId = getCurrentOrgId() || "";
  const [title, setTitle] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [hours, setHours] = useState<number | string>("");
  const [hasClassroom, setHasClassroom] = useState(true);
  const [classroomCourseworkId, setClassroomCourseworkId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [scale, setScale] = useState<number>(1);
  const [isCore, setIsCore] = useState(false);

  const { data: allSubjects = [] } = useSubjects(orgId);
  const { data: currentRun } = useSessionRun(orgId, defaultSessionRunId);

  const createMutation = useCreateSubject();

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        setTitle("");
        setTeacherName("");
        setHours("");
        setHasClassroom(true);
        setClassroomCourseworkId("");
        setScale(1);
        setIsCore(false);
        setError(null);
        setSubmitted(false);
      }, 0);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setError(null);

    if (!title || !defaultSessionRunId) {
      return;
    }

    if (!currentRun) {
      setError("Выбранный запуск сессии не найден");
      return;
    }

    const payload = {
      sessionRunId: defaultSessionRunId,
      levelId: currentRun.levelId,
      title,
      teacherName: teacherName.trim() || undefined,
      hours: hours ? Number(hours) : undefined,
      hasClassroom,
      classroomCourseworkId: hasClassroom
        ? classroomCourseworkId.trim() || undefined
        : undefined,
      scale: scale || 1,
      isCore,
    };

    try {
      await createMutation.mutateAsync({
        orgId,
        payload,
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
          "Произошла ошибка при создании предмета",
      );
    }
  };

  const isLoading = createMutation.isPending;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Добавить предмет в сессию</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <Autocomplete
              freeSolo
              options={Array.from(
                new Set(allSubjects.map((s) => s.title)),
              ).sort()}
              value={title}
              onInputChange={(_, newValue) => {
                setTitle(newValue);
                // Auto-fill details if matches existing subject title
                const existing = allSubjects.find((s) => s.title === newValue);
                if (existing) {
                  setHours(existing.hours || "");
                  setHasClassroom(existing.hasClassroom);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Название предмета"
                  required
                  error={submitted && !title}
                  helperText={submitted && !title ? "Название обязательно" : ""}
                />
              )}
            />

            <TextField
              label="Преподаватель"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              fullWidth
            />

            <TextField
              label="Часов"
              type="number"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel id="add-subject-scale-select-label">
                Вес предмета (1-3)
              </InputLabel>
              <Select
                labelId="add-subject-scale-select-label"
                value={scale}
                label="Вес предмета (1-3)"
                onChange={(e) => setScale(Number(e.target.value))}
              >
                <MenuItem value={1}>1</MenuItem>
                <MenuItem value={2}>2</MenuItem>
                <MenuItem value={3}>3</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={isCore}
                  onChange={(e) => setIsCore(e.target.checked)}
                />
              }
              label="Блокирующий предмет"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={hasClassroom}
                  onChange={(e) => setHasClassroom(e.target.checked)}
                />
              }
              label="Есть в Classroom"
            />

            {hasClassroom && (
              <TextField
                label="ID задания в Classroom"
                value={classroomCourseworkId}
                onChange={(e) => setClassroomCourseworkId(e.target.value)}
                fullWidth
                helperText="coursework_id из Google Classroom"
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isLoading}>
            Отмена
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? "Добавление..." : "Добавить"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddSubjectInSessionModal;

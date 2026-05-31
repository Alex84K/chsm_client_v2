import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import type { Subject } from "../types/session.types";
import type { GradeEntry } from "../types/enrollments.types";

interface ManualGradesModalProps {
  open: boolean;
  onClose: () => void;
  subjects: Subject[];
  gradeEntries?: GradeEntry[];
  onSave: (
    subjectId: string,
    value: number,
    existingEntryId?: string,
  ) => Promise<void>;
  isApproved: boolean;
}

const ManualGradesModal = ({
  open,
  onClose,
  subjects,
  gradeEntries = [],
  onSave,
  isApproved,
}: ManualGradesModalProps) => {
  const [grades, setGrades] = React.useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      const initialGrades: Record<string, string> = {};
      subjects.forEach((subject) => {
        const entry = gradeEntries.find((ge) => ge.subjectId === subject.id);
        initialGrades[subject.id] = entry ? String(entry.value) : "";
      });
      setTimeout(() => {
        setGrades(initialGrades);
        setErrorMsg(null);
      }, 0);
    }
  }, [open, subjects, gradeEntries]);

  const handleGradeChange = (subjectId: string, value: string) => {
    // Basic filter to allow only integers or numbers (or we can validate on submit)
    setGrades((prev) => ({
      ...prev,
      [subjectId]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);

    try {
      // Loop over subjects and save if changed or added
      for (const subject of subjects) {
        const valStr = grades[subject.id];
        const existingEntry = gradeEntries.find(
          (ge) => ge.subjectId === subject.id,
        );

        if (!valStr || valStr.trim() === "") {
          // If empty and existed before, maybe we could delete, but let's just skip
          // or only save if value is a valid number.
          continue;
        }

        const value = Number(valStr);
        if (isNaN(value) || value < 0) {
          throw new Error(
            `Недопустимая оценка для предмета "${subject.title}". Должно быть числом >= 0.`,
          );
        }

        // Check if value actually changed
        if (!existingEntry || existingEntry.value !== value) {
          await onSave(subject.id, value, existingEntry?.id);
        }
      }
      onClose();
    } catch (err: unknown) {
      setErrorMsg((err as Error)?.message || "Ошибка сохранения оценок.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Выставить оценки вручную</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
            {isApproved && (
              <Alert severity="warning">
                Ведомость утверждена. Оценки заблокированы для редактирования.
              </Alert>
            )}

            {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

            <Grid container spacing={2}>
              {subjects.map((subject) => {
                const isClassroom =
                  gradeEntries.find((ge) => ge.subjectId === subject.id)
                    ?.source === "google_classroom";

                return (
                  <Grid size={12} key={subject.id}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box sx={{ flexGrow: 1, pr: 2 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: "medium" }}
                        >
                          {subject.title}
                        </Typography>
                        {isClassroom && (
                          <Typography variant="caption" color="primary">
                            Импортировано из Classroom
                          </Typography>
                        )}
                      </Box>
                      <TextField
                        size="small"
                        type="number"
                        disabled={isApproved || isSaving}
                        slotProps={{ htmlInput: { min: 0, max: 10, step: 1 } }}
                        sx={{ width: 80 }}
                        value={grades[subject.id] || ""}
                        onChange={(e) =>
                          handleGradeChange(subject.id, e.target.value)
                        }
                      />
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSaving}>
            Отмена
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isApproved || isSaving}
          >
            {isSaving ? "Сохранение..." : "Сохранить"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ManualGradesModal;

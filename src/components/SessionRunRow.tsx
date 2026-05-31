import * as React from "react";
import { useState, useMemo } from "react";
import {
  TableRow,
  TableCell,
  IconButton,
  Collapse,
  Box,
  Tabs,
  Tab,
  Typography,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow as MuiTableRow,
  TableCell as MuiTableCell,
  FormControl,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import type {
  SessionRun,
  SessionLevel,
  AcademicYear,
  SessionRunStatus,
} from "../types/session.types";
import { useStudents } from "../hooks/useStudents";
import {
  useAllOrganizationEnrollments,
  useDeleteEnrollment,
} from "../hooks/useEnrollments";
import {
  useSubjects,
  useDeleteSubject,
  useUpdateSessionRun,
} from "../hooks/useSessions";
import EnrollStudentToRunModal from "../modals/EnrollStudentToRunModal";
import AddSubjectInSessionModal from "../modals/AddSubjectInSessionModal";

interface SessionRunRowProps {
  run: SessionRun;
  levelObj: SessionLevel | undefined;
  yearObj: AcademicYear | undefined;
  allowedStatuses: string[];
  orgId: string;
  onEdit: () => void;
  onDelete: () => void;
}

const SessionRunRow = ({
  run,
  levelObj,
  yearObj,
  allowedStatuses,
  orgId,
  onEdit,
  onDelete,
}: SessionRunRowProps) => {
  const [open, setOpen] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);

  // Queries
  const { data: students = [] } = useStudents(orgId);
  const { data: allEnrollments = [], refetch: refetchEnrollments } =
    useAllOrganizationEnrollments(orgId);
  const { data: allSubjects = [], refetch: refetchSubjects } =
    useSubjects(orgId);

  // Mutations
  const updateRunMutation = useUpdateSessionRun();
  const deleteEnrollmentMutation = useDeleteEnrollment();
  const deleteSubjectMutation = useDeleteSubject();

  // Filters (Client-side JOIN)
  const sessionEnrollments = useMemo(() => {
    return allEnrollments.filter((e) => e.sessionRunId === run.id);
  }, [allEnrollments, run.id]);

  const enrolledStudents = useMemo(() => {
    return students.filter((s) =>
      sessionEnrollments.some(
        (e) => e.studentId === s.id && e.status !== "DROPPED",
      ),
    );
  }, [students, sessionEnrollments]);

  const sessionSubjects = useMemo(() => {
    return allSubjects.filter((s) => s.sessionRunId === run.id);
  }, [allSubjects, run.id]);

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateRunMutation.mutateAsync({
        orgId,
        id: run.id,
        payload: { status: newStatus as SessionRunStatus },
      });
    } catch {
      alert("Ошибка при изменении статуса запуска сессии");
    }
  };

  const handleDropStudent = async (studentId: string) => {
    const enrollment = sessionEnrollments.find(
      (e) => e.studentId === studentId,
    );
    if (!enrollment) return;

    if (
      window.confirm(
        "Вы уверены, что хотите удалить зачисление этого студента?",
      )
    ) {
      try {
        await deleteEnrollmentMutation.mutateAsync({
          orgId,
          id: enrollment.id,
          studentId,
        });
        await refetchEnrollments();
      } catch {
        alert("Ошибка при удалении студента из сессии");
      }
    }
  };

  const handleDeleteSub = async (subjectId: string) => {
    if (window.confirm("Вы уверены, что хотите удалить этот предмет?")) {
      try {
        await deleteSubjectMutation.mutateAsync({
          orgId,
          id: subjectId,
        });
        await refetchSubjects();
      } catch {
        alert("Ошибка при удалении предмета");
      }
    }
  };

  return (
    <>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{levelObj?.title ?? run.levelId}</TableCell>
        <TableCell>{yearObj?.label ?? run.academicYearId}</TableCell>
        <TableCell>{run.classroomCourseId || "0"}</TableCell>
        <TableCell>
          <FormControl
            size="small"
            variant="standard"
            sx={{ m: 0, minWidth: 120 }}
          >
            <Select
              value={run.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disableUnderline
              sx={{
                fontWeight: "bold",
                color:
                  run.status === "ACTIVE"
                    ? "success.main"
                    : run.status === "COMPLETED"
                      ? "error.main"
                      : run.status === "ARCHIVED"
                        ? "text.secondary"
                        : "info.main",
              }}
            >
              {allowedStatuses.map((st) => (
                <MenuItem key={st} value={st}>
                  {st}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </TableCell>
        <TableCell align="right">
          <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
            <Button size="small" onClick={onEdit}>
              Редактировать
            </Button>
            <Button size="small" color="error" onClick={onDelete}>
              Удалить
            </Button>
          </Box>
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              <Box
                sx={{
                  borderBottom: 1,
                  borderColor: "divider",
                  mb: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Tabs
                  value={tabIndex}
                  onChange={(_, newValue) => setTabIndex(newValue)}
                >
                  <Tab label="Студенты" />
                  <Tab label="Предметы" />
                </Tabs>
                {tabIndex === 0 ? (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setEnrollModalOpen(true)}
                  >
                    Добавить студента
                  </Button>
                ) : (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setSubjectModalOpen(true)}
                  >
                    Добавить предмет
                  </Button>
                )}
              </Box>

              {/* Students Tab */}
              {tabIndex === 0 && (
                <Box sx={{ minHeight: 100 }}>
                  {enrolledStudents.length === 0 ? (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ py: 2, textAlign: "center" }}
                    >
                      Нет зачисленных студентов в этом потоке.
                    </Typography>
                  ) : (
                    <Table size="small">
                      <TableHead>
                        <MuiTableRow>
                          <MuiTableCell>Имя</MuiTableCell>
                          <MuiTableCell>Инструмент</MuiTableCell>
                          <MuiTableCell>Специализация</MuiTableCell>
                          <MuiTableCell align="right">Действия</MuiTableCell>
                        </MuiTableRow>
                      </TableHead>
                      <TableBody>
                        {enrolledStudents.map((student) => (
                          <MuiTableRow key={student.id}>
                            <MuiTableCell>{student.name}</MuiTableCell>
                            <MuiTableCell>{student.instrument}</MuiTableCell>
                            <MuiTableCell>
                              {student.specialization}
                            </MuiTableCell>
                            <MuiTableCell align="right">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDropStudent(student.id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </MuiTableCell>
                          </MuiTableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </Box>
              )}

              {/* Subjects Tab */}
              {tabIndex === 1 && (
                <Box sx={{ minHeight: 100 }}>
                  {sessionSubjects.length === 0 ? (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ py: 2, textAlign: "center" }}
                    >
                      Нет предметов, привязанных к этому потоку.
                    </Typography>
                  ) : (
                    <Table size="small">
                      <TableHead>
                        <MuiTableRow>
                          <MuiTableCell>Название</MuiTableCell>
                          <MuiTableCell>Преподаватель</MuiTableCell>
                          <MuiTableCell>Часов</MuiTableCell>
                          <MuiTableCell>Оценки</MuiTableCell>
                          <MuiTableCell align="right">Действия</MuiTableCell>
                        </MuiTableRow>
                      </TableHead>
                      <TableBody>
                        {sessionSubjects.map((sub) => (
                          <MuiTableRow key={sub.id}>
                            <MuiTableCell>{sub.title}</MuiTableCell>
                            <MuiTableCell>
                              {sub.teacherName || "—"}
                            </MuiTableCell>
                            <MuiTableCell>{sub.hours || "—"}</MuiTableCell>
                            <MuiTableCell>
                              <Chip
                                size="small"
                                label={
                                  sub.hasClassroom ? "Classroom" : "вручную"
                                }
                                color={sub.hasClassroom ? "primary" : "default"}
                                variant="outlined"
                              />
                            </MuiTableCell>
                            <MuiTableCell align="right">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteSub(sub.id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </MuiTableCell>
                          </MuiTableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </Box>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>

      <EnrollStudentToRunModal
        open={enrollModalOpen}
        onClose={async () => {
          setEnrollModalOpen(false);
          await refetchEnrollments();
        }}
        defaultSessionRunId={run.id}
      />

      <AddSubjectInSessionModal
        open={subjectModalOpen}
        onClose={async () => {
          setSubjectModalOpen(false);
          await refetchSubjects();
        }}
        defaultSessionRunId={run.id}
      />
    </>
  );
};

export default SessionRunRow;

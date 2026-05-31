import * as React from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Tab from "@mui/material/Tab";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { styled } from "@mui/material/styles";
import AcademicYearModal, {
  type AcademicYearFormData,
} from "../modals/AcademicYearModal";
import SessionLevelModal, {
  type SessionLevelFormData,
} from "../modals/SessionLevelModal";
import SessionRunModal, {
  type SessionRunFormData,
} from "../modals/SessionRunModal";
import SubjectModal, { type SubjectFormData } from "../modals/SubjectModal";
import DeleteConfirmModal from "../modals/DeleteConfirmModal";
import type {
  AcademicYear,
  SessionLevel,
  SessionRun,
  SessionRunStatus,
  Subject,
} from "../types/session.types";
import {
  useAcademicYears,
  useCreateAcademicYear,
  useUpdateAcademicYear,
  useDeleteAcademicYear,
  useSessionLevels,
  useCreateSessionLevel,
  useUpdateSessionLevel,
  useDeleteSessionLevel,
  useSessionRuns,
  useCreateSessionRun,
  useUpdateSessionRun,
  useDeleteSessionRun,
  useSubjects,
  useCreateSubject,
  useUpdateSubject,
  useDeleteSubject,
} from "../hooks/useSessions";
import SessionRunRow from "./SessionRunRow";

// --------------- Styled components ---------------

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

// --------------- Helpers ---------------

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(d);
  } catch {
    return dateStr;
  }
};

// --------------- Local types ---------------

type TabType = "runs" | "levels" | "subjects" | "years";

// --------------- Status helpers ---------------

const validateStatusTransition = (
  oldStatus: SessionRunStatus,
  newStatus: SessionRunStatus,
): boolean => {
  if (oldStatus === newStatus) return true;
  if (oldStatus === "PLANNED" && newStatus === "ACTIVE") return true;
  if (oldStatus === "ACTIVE" && newStatus === "COMPLETED") return true;
  if (newStatus === "ARCHIVED") return true;
  return false;
};

const getAllowedStatuses = (
  currentStatus: SessionRunStatus,
): SessionRunStatus[] => {
  const list: SessionRunStatus[] = [currentStatus];
  if (currentStatus === "PLANNED") list.push("ACTIVE", "ARCHIVED");
  else if (currentStatus === "ACTIVE") list.push("COMPLETED", "ARCHIVED");
  else if (currentStatus === "COMPLETED") list.push("ARCHIVED");
  return list;
};

// --------------- Empty initial form data ---------------

const emptyYear = (): AcademicYearFormData => ({
  label: "",
  startsAt: "",
  endsAt: "",
});
const emptyLevel = (): SessionLevelFormData => ({
  number: "",
  title: "",
  description: "",
});
const emptyRun = (
  levels: SessionLevel[],
  years: AcademicYear[],
): SessionRunFormData => ({
  levelId: levels[0]?.id ?? "",
  academicYearId: years[0]?.id ?? "",
  status: "PLANNED",
  classroomCourseId: "0",
});
const emptySubject = (
  runs: SessionRun[],
): SubjectFormData => ({
  title: "",
  sessionRunId: runs[0]?.id ?? "",
  scale: "",
  hours: "",
  isCore: false,
  hasClassroom: false,
});

// --------------- Main Component ---------------

export default function SessionsList({
  currentOrgId,
}: {
  currentOrgId: string;
}) {
  React.useEffect(() => {
    console.log("Sessions org ID:", currentOrgId);
  }, [currentOrgId]);

  const [activeTab, setActiveTab] = React.useState<TabType>("runs");
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // React Query Hooks
  const { data: years = [], error: yearsError } =
    useAcademicYears(currentOrgId);
  const { data: levels = [], error: levelsError } =
    useSessionLevels(currentOrgId);
  const { data: runs = [], error: runsError } = useSessionRuns(currentOrgId);
  const { data: subjects = [], error: subjectsError } =
    useSubjects(currentOrgId);

  const createAcademicYearMutation = useCreateAcademicYear();
  const updateAcademicYearMutation = useUpdateAcademicYear();
  const deleteAcademicYearMutation = useDeleteAcademicYear();

  const createSessionLevelMutation = useCreateSessionLevel();
  const updateSessionLevelMutation = useUpdateSessionLevel();
  const deleteSessionLevelMutation = useDeleteSessionLevel();

  const createSessionRunMutation = useCreateSessionRun();
  const updateSessionRunMutation = useUpdateSessionRun();
  const deleteSessionRunMutation = useDeleteSessionRun();

  const createSubjectMutation = useCreateSubject();
  const updateSubjectMutation = useUpdateSubject();
  const deleteSubjectMutation = useDeleteSubject();

  // Sync/show API loading errors
  React.useEffect(() => {
    const err = yearsError || levelsError || runsError || subjectsError;
    if (err) {
      setTimeout(() => {
        setErrorMsg(err.message || "Ошибка при загрузке данных.");
      }, 0);
    }
  }, [yearsError, levelsError, runsError, subjectsError]);

  // Modal visibility
  const [yearModalOpen, setYearModalOpen] = React.useState(false);
  const [levelModalOpen, setLevelModalOpen] = React.useState(false);
  const [runModalOpen, setRunModalOpen] = React.useState(false);
  const [subjectModalOpen, setSubjectModalOpen] = React.useState(false);

  // Edit mode + initial form data per modal
  const [editMode, setEditMode] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [yearForm, setYearForm] =
    React.useState<AcademicYearFormData>(emptyYear());
  const [levelForm, setLevelForm] =
    React.useState<SessionLevelFormData>(emptyLevel());
  const [runForm, setRunForm] = React.useState<SessionRunFormData>(
    emptyRun([], []),
  );
  const [subjectForm, setSubjectForm] = React.useState<SubjectFormData>(
    emptySubject([]),
  );

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<{
    type: TabType;
    id: string;
  } | null>(null);
  const [conflictMsg, setConflictMsg] = React.useState<string | null>(null);

  // --------------- Open helpers ---------------

  const openAdd = () => {
    setSuccessMsg(null);
    setErrorMsg(null);
    setEditMode(false);
    setSelectedId(null);
    setYearForm(emptyYear());
    setLevelForm(emptyLevel());
    setRunForm(emptyRun(levels, years));
    setSubjectForm(emptySubject(runs));
    if (activeTab === "years") setYearModalOpen(true);
    else if (activeTab === "levels") setLevelModalOpen(true);
    else if (activeTab === "runs") setRunModalOpen(true);
    else setSubjectModalOpen(true);
  };

  const openEdit = (
    type: TabType,
    item: AcademicYear | SessionLevel | SessionRun | Subject,
  ) => {
    setSuccessMsg(null);
    setErrorMsg(null);
    setEditMode(true);
    setSelectedId(item.id);
    if (type === "years") {
      const y = item as AcademicYear;
      setYearForm({ label: y.label, startsAt: y.startsAt, endsAt: y.endsAt });
      setYearModalOpen(true);
    } else if (type === "levels") {
      const l = item as SessionLevel;
      setLevelForm({
        number: String(l.number),
        title: l.title,
        description: l.description,
      });
      setLevelModalOpen(true);
    } else if (type === "runs") {
      const r = item as SessionRun;
      setRunForm({
        levelId: r.levelId,
        academicYearId: r.academicYearId,
        status: r.status as SessionRunStatus,
        classroomCourseId: r.classroomCourseId || "",
      });
      setRunModalOpen(true);
    } else {
      const s = item as Subject;
      setSubjectForm({
        title: s.title,
        sessionRunId: s.sessionRunId,
        scale: String(s.scale),
        hours: s.hours ? String(s.hours) : "",
        isCore: s.isCore || false,
        hasClassroom: s.hasClassroom || false,
      });
      setSubjectModalOpen(true);
    }
  };

  // --------------- Submit handlers ---------------

  const handleYearSubmit = async (data: AcademicYearFormData) => {
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      if (editMode && selectedId) {
        await updateAcademicYearMutation.mutateAsync({
          orgId: currentOrgId,
          id: selectedId,
          payload: data,
        });
        setSuccessMsg("Учебный год успешно обновлён.");
      } else {
        await createAcademicYearMutation.mutateAsync({
          orgId: currentOrgId,
          payload: data,
        });
        setSuccessMsg("Учебный год успешно добавлен.");
      }
      setYearModalOpen(false);
    } catch (err: unknown) {
      setErrorMsg(
        (err as Error).message || "Ошибка при сохранении учебного года.",
      );
    }
  };

  const handleLevelSubmit = async (data: SessionLevelFormData) => {
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const parsedNumber = parseInt(data.number, 10) || 1;
      if (editMode && selectedId) {
        await updateSessionLevelMutation.mutateAsync({
          orgId: currentOrgId,
          id: selectedId,
          payload: {
            number: parsedNumber,
            title: data.title,
            description: data.description,
          },
        });
        setSuccessMsg("Уровень обучения успешно обновлён.");
      } else {
        await createSessionLevelMutation.mutateAsync({
          orgId: currentOrgId,
          payload: {
            number: parsedNumber,
            title: data.title,
            description: data.description,
          },
        });
        setSuccessMsg("Уровень обучения успешно добавлен.");
      }
      setLevelModalOpen(false);
    } catch (err: unknown) {
      setErrorMsg(
        (err as Error).message || "Ошибка при сохранении уровня обучения.",
      );
    }
  };

  const handleRunSubmit = async (data: SessionRunFormData) => {
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      if (editMode && selectedId) {
        const currentRun = runs.find((r) => r.id === selectedId);
        if (currentRun && currentRun.status !== data.status) {
          if (
            !validateStatusTransition(
              currentRun.status as SessionRunStatus,
              data.status,
            )
          ) {
            setErrorMsg(
              `Недопустимый переход статуса из ${currentRun.status} в ${data.status}.`,
            );
            return;
          }
        }
        await updateSessionRunMutation.mutateAsync({
          orgId: currentOrgId,
          id: selectedId,
          payload: {
            levelId: data.levelId,
            academicYearId: data.academicYearId,
            status: data.status,
            classroomCourseId: data.classroomCourseId || undefined,
          },
        });
        setSuccessMsg("Запуск сессии успешно обновлён.");
      } else {
        await createSessionRunMutation.mutateAsync({
          orgId: currentOrgId,
          payload: {
            levelId: data.levelId,
            academicYearId: data.academicYearId,
            status: data.status,
            classroomCourseId: data.classroomCourseId || undefined,
          },
        });
        setSuccessMsg("Запуск сессии успешно создан.");
      }
      setRunModalOpen(false);
    } catch (err: unknown) {
      setErrorMsg(
        (err as Error).message || "Ошибка при сохранении запуска сессии.",
      );
    }
  };

  const handleSubjectSubmit = async (data: SubjectFormData) => {
    setSuccessMsg(null);
    setErrorMsg(null);
    const parsedScale = parseInt(data.scale, 10);
    const parsedHours = data.hours ? parseInt(data.hours, 10) : undefined;
    
    if (isNaN(parsedScale)) {
      setErrorMsg("Масштаб должен быть целым числом.");
      return;
    }
    
    try {
      if (editMode && selectedId) {
        await updateSubjectMutation.mutateAsync({
          orgId: currentOrgId,
          id: selectedId,
          payload: {
            sessionRunId: data.sessionRunId,
            title: data.title,
            scale: parsedScale,
            hours: parsedHours,
            isCore: data.isCore,
            hasClassroom: data.hasClassroom,
          },
        });
        setSuccessMsg("Предмет успешно обновлён.");
      } else {
        await createSubjectMutation.mutateAsync({
          orgId: currentOrgId,
          payload: {
            sessionRunId: data.sessionRunId,
            title: data.title,
            scale: parsedScale,
            hours: parsedHours,
            isCore: data.isCore,
            hasClassroom: data.hasClassroom,
          },
        });
        setSuccessMsg("Предмет успешно создан.");
      }
      setSubjectModalOpen(false);
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || "Ошибка при сохранении предмета.");
    }
  };

  // --------------- Delete handlers ---------------

  const handleDeleteClick = (type: TabType, id: string) => {
    setConflictMsg(null);
    setSuccessMsg(null);
    setErrorMsg(null);

    if (type === "years" && runs.some((r) => r.academicYearId === id)) {
      setConflictMsg(
        "Невозможно удалить элемент, так как он используется в учебных процессах. Сначала удалите связанные потоки/предметы.",
      );
      setDeleteTarget(null);
      setDeleteOpen(true);
      return;
    }
    if (
      type === "levels" &&
      (runs.some((r) => r.levelId === id) ||
        subjects.some((s) => s.levelId === id))
    ) {
      setConflictMsg(
        "Невозможно удалить элемент, так как он используется в учебных процессах. Сначала удалите связанные потоки/предметы.",
      );
      setDeleteTarget(null);
      setDeleteOpen(true);
      return;
    }
    if (type === "runs" && subjects.some((s) => s.sessionRunId === id)) {
      setConflictMsg(
        "Невозможно удалить элемент, так как он используется в учебных процессах. Сначала удалите связанные потоки/предметы.",
      );
      setDeleteTarget(null);
      setDeleteOpen(true);
      return;
    }

    setDeleteTarget({ type, id });
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) {
      setDeleteOpen(false);
      return;
    }
    const { type, id } = deleteTarget;
    try {
      if (type === "years") {
        await deleteAcademicYearMutation.mutateAsync({
          orgId: currentOrgId,
          id,
        });
        setSuccessMsg("Учебный год удалён.");
      } else if (type === "levels") {
        await deleteSessionLevelMutation.mutateAsync({
          orgId: currentOrgId,
          id,
        });
        setSuccessMsg("Уровень обучения удалён.");
      } else if (type === "runs") {
        await deleteSessionRunMutation.mutateAsync({ orgId: currentOrgId, id });
        setSuccessMsg("Запуск сессии удалён.");
      } else {
        await deleteSubjectMutation.mutateAsync({ orgId: currentOrgId, id });
        setSuccessMsg("Предмет удалён.");
      }
    } catch (err: unknown) {
      const errorResponse = err as { status?: number; message?: string };
      if (errorResponse.status === 409) {
        setConflictMsg(
          "Невозможно удалить элемент, так как он используется в учебных процессах. Сначала удалите связанные потоки/предметы.",
        );
      } else {
        setErrorMsg(errorResponse.message || "Ошибка при удалении.");
      }
    } finally {
      setDeleteOpen(false);
      setDeleteTarget(null);
    }
  };

  // --------------- Render ---------------

  return (
    <Box sx={{ width: "100%" }}>
      {/* Tabs */}
      <Tabs
        indicatorColor="primary"
        onChange={(_, val) => {
          setActiveTab(val);
          setErrorMsg(null);
        }}
        textColor="primary"
        value={activeTab}
        variant="scrollable"
        sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}
      >
        <Tab label="ЗАПУСКИ СЕССИЙ" value="runs" />
        <Tab label="УРОВНИ СЕССИЙ" value="levels" />
        <Tab label="ПРЕДМЕТЫ" value="subjects" />
        <Tab label="УЧЕБНЫЕ ГОДЫ" value="years" />
      </Tabs>

      {/* Alerts */}
      {successMsg && (
        <Alert
          onClose={() => setSuccessMsg(null)}
          severity="success"
          sx={{ mb: 2 }}
        >
          {successMsg}
        </Alert>
      )}
      {errorMsg && (
        <Alert
          onClose={() => setErrorMsg(null)}
          severity="error"
          sx={{ mb: 2 }}
        >
          {errorMsg}
        </Alert>
      )}

      {/* Header row */}
      <Box
        sx={{
          alignItems: { xs: "stretch", sm: "center" },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Typography component="h2" variant="h6">
            {activeTab === "runs" && "Запуски сессий"}
            {activeTab === "levels" && "Уровни сессий"}
            {activeTab === "subjects" && "Список предметов"}
            {activeTab === "years" && "Учебные годы"}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {activeTab === "runs" &&
              "Управление запуском и жизненным циклом сессий учебных программ."}
            {activeTab === "levels" &&
              "Настройка шаблонов и классов уровней сессий."}
            {activeTab === "subjects" &&
              "Каталог предметов, закреплённых за определёнными сессиями."}
            {activeTab === "years" &&
              "Временные рамки и интервалы учебных годов."}
          </Typography>
        </Box>
        <Button onClick={openAdd} startIcon={<AddIcon />} variant="contained">
          ДОБАВИТЬ
        </Button>
      </Box>

      {/* Table */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          boxShadow: "none",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Table sx={{ minWidth: 650 }}>
          {/* Session Runs */}
          {activeTab === "runs" && (
            <>
              <TableHead>
                <TableRow>
                  <StyledTableCell width={50} />
                  <StyledTableCell>Уровень</StyledTableCell>
                  <StyledTableCell>Учебный год</StyledTableCell>
                  <StyledTableCell>Course ID</StyledTableCell>
                  <StyledTableCell>Статус</StyledTableCell>
                  <StyledTableCell align="right">Действия</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {runs.map((run) => {
                  const levelObj = levels.find((l) => l.id === run.levelId);
                  const yearObj = years.find(
                    (y) => y.id === run.academicYearId,
                  );
                  const allowedStatuses = getAllowedStatuses(
                    run.status as SessionRunStatus,
                  );
                  return (
                    <SessionRunRow
                      key={run.id}
                      run={run}
                      levelObj={levelObj}
                      yearObj={yearObj}
                      allowedStatuses={allowedStatuses}
                      orgId={currentOrgId}
                      onEdit={() => openEdit("runs", run)}
                      onDelete={() => handleDeleteClick("runs", run.id)}
                    />
                  );
                })}
              </TableBody>
            </>
          )}

          {/* Session Levels */}
          {activeTab === "levels" && (
            <>
              <TableHead>
                <TableRow>
                  <StyledTableCell>Номер</StyledTableCell>
                  <StyledTableCell>Название</StyledTableCell>
                  <StyledTableCell>Описание</StyledTableCell>
                  <StyledTableCell align="right">Действия</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {levels.map((lvl) => (
                  <StyledTableRow key={lvl.id}>
                    <StyledTableCell>{lvl.number}</StyledTableCell>
                    <StyledTableCell>{lvl.title}</StyledTableCell>
                    <StyledTableCell>{lvl.description || "-"}</StyledTableCell>
                    <StyledTableCell align="right">
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          justifyContent: "flex-end",
                        }}
                      >
                        <Button
                          size="small"
                          onClick={() => openEdit("levels", lvl)}
                        >
                          <EditIcon fontSize="small" />
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick("levels", lvl.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </Button>
                      </Box>
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </>
          )}

          {/* Subjects */}
          {activeTab === "subjects" && (
            <>
              <TableHead>
                <TableRow>
                  <StyledTableCell>Название предмета</StyledTableCell>
                  <StyledTableCell>Преподаватель</StyledTableCell>
                  <StyledTableCell>Часы</StyledTableCell>
                  <StyledTableCell>Уровень / Поток</StyledTableCell>
                  <StyledTableCell>Google Classroom</StyledTableCell>
                  <StyledTableCell align="right">Действия</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subjects.map((sub) => {
                  const runObj = runs.find((r) => r.id === sub.sessionRunId);
                  const lvlObj = levels.find((l) => l.id === sub.levelId);
                  return (
                    <StyledTableRow key={sub.id}>
                      <StyledTableCell>{sub.title}</StyledTableCell>
                      <StyledTableCell>
                        {sub.teacherName || "-"}
                      </StyledTableCell>
                      <StyledTableCell>{sub.hours || "0"}</StyledTableCell>
                      <StyledTableCell>
                        {lvlObj?.title ?? ""}
                        {runObj ? ` (Run #${runObj.id.substring(0, 4)})` : ""}
                      </StyledTableCell>
                      <StyledTableCell>
                        <Chip
                          label={
                            sub.hasClassroom
                              ? `Связано (${sub.classroomCourseworkId || "ID"})`
                              : "Нет"
                          }
                          color={sub.hasClassroom ? "success" : "default"}
                          size="small"
                        />
                      </StyledTableCell>
                      <StyledTableCell align="right">
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            justifyContent: "flex-end",
                          }}
                        >
                          <Button
                            size="small"
                            onClick={() => openEdit("subjects", sub)}
                          >
                            <EditIcon fontSize="small" />
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            onClick={() =>
                              handleDeleteClick("subjects", sub.id)
                            }
                          >
                            <DeleteIcon fontSize="small" />
                          </Button>
                        </Box>
                      </StyledTableCell>
                    </StyledTableRow>
                  );
                })}
              </TableBody>
            </>
          )}

          {/* Academic Years */}
          {activeTab === "years" && (
            <>
              <TableHead>
                <TableRow>
                  <StyledTableCell>Название</StyledTableCell>
                  <StyledTableCell>Дата начала</StyledTableCell>
                  <StyledTableCell>Дата окончания</StyledTableCell>
                  <StyledTableCell align="right">Действия</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {years.map((yr) => (
                  <StyledTableRow key={yr.id}>
                    <StyledTableCell>{yr.label}</StyledTableCell>
                    <StyledTableCell>{formatDate(yr.startsAt)}</StyledTableCell>
                    <StyledTableCell>{formatDate(yr.endsAt)}</StyledTableCell>
                    <StyledTableCell align="right">
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          justifyContent: "flex-end",
                        }}
                      >
                        <Button
                          size="small"
                          onClick={() => openEdit("years", yr)}
                        >
                          <EditIcon fontSize="small" />
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick("years", yr.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </Button>
                      </Box>
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </>
          )}
        </Table>
      </TableContainer>

      {/* Modals */}
      <AcademicYearModal
        open={yearModalOpen}
        editMode={editMode}
        initialData={yearForm}
        onClose={() => setYearModalOpen(false)}
        onSubmit={handleYearSubmit}
      />

      <SessionLevelModal
        open={levelModalOpen}
        editMode={editMode}
        initialData={levelForm}
        onClose={() => setLevelModalOpen(false)}
        onSubmit={handleLevelSubmit}
      />

      <SessionRunModal
        open={runModalOpen}
        editMode={editMode}
        initialData={runForm}
        currentStatus={
          editMode && selectedId
            ? (runs.find((r) => r.id === selectedId)?.status as
                | SessionRunStatus
                | undefined)
            : undefined
        }
        levels={levels}
        years={years}
        onClose={() => setRunModalOpen(false)}
        onSubmit={handleRunSubmit}
      />

      <SubjectModal
        open={subjectModalOpen}
        editMode={editMode}
        initialData={subjectForm}
        runs={runs}
        onClose={() => setSubjectModalOpen(false)}
        onSubmit={handleSubjectSubmit}
      />

      <DeleteConfirmModal
        open={deleteOpen}
        conflictMessage={conflictMsg}
        onClose={() => {
          setDeleteOpen(false);
          setConflictMsg(null);
        }}
        onConfirm={confirmDelete}
      />
    </Box>
  );
}

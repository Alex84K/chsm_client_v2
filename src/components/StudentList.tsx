import * as React from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import { styled } from '@mui/material/styles'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell, { tableCellClasses } from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import { useOrganizationMembers } from '../hooks/useOrganizationMembers'
import { useStudents } from '../hooks/useStudents'
import AddStudentModal from '../modals/AddStudentModal'

type StudentListProps = {
  currentOrgId: string
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}))

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}))

const formatDate = (date: Date | string) =>
  new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))

const StudentList = ({ currentOrgId }: StudentListProps) => {
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const [successMessage, setSuccessMessage] = React.useState('')
  const {
    data: students = [],
    error: studentsError,
    isError: isStudentsError,
    isLoading: isStudentsLoading,
  } = useStudents(currentOrgId)
  const {
    data: members = [],
    error: membersError,
    isError: isMembersError,
    isLoading: isMembersLoading,
  } = useOrganizationMembers(currentOrgId)

  const isLoading = isStudentsLoading || isMembersLoading

  return (
    <>
      <Box
        sx={{
          alignItems: { xs: 'stretch', sm: 'center' },
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography component="h2" variant="h6">
            Студенты
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Список студентов организации и их учебные данные.
          </Typography>
        </Box>

        <Button
          disabled={!currentOrgId || isMembersLoading}
          onClick={() => {
            setSuccessMessage('')
            setIsAddModalOpen(true)
          }}
          startIcon={<AddIcon />}
          variant="contained"
        >
          Добавить студента
        </Button>
      </Box>

      {successMessage ? (
        <Alert
          onClose={() => setSuccessMessage('')}
          severity="success"
          sx={{ mb: 2 }}
        >
          {successMessage}
        </Alert>
      ) : null}

      {isStudentsError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {studentsError.message}
        </Alert>
      ) : null}

      {isMembersError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {membersError.message}
        </Alert>
      ) : null}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : null}

      {!isLoading && !isStudentsError ? (
        <TableContainer component={Paper}>
          <Table aria-label="Список студентов организации" sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow>
                <StyledTableCell>Имя</StyledTableCell>
                <StyledTableCell align="right">Пользователь</StyledTableCell>
                <StyledTableCell align="right">Инструмент</StyledTableCell>
                <StyledTableCell align="right">Специализация</StyledTableCell>
                <StyledTableCell align="right">Город</StyledTableCell>
                <StyledTableCell align="right">Страна</StyledTableCell>
                <StyledTableCell align="right">Зачётка</StyledTableCell>
                <StyledTableCell align="right">Дата зачисления</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student) => (
                <StyledTableRow hover key={student.id}>
                  <StyledTableCell component="th" scope="row">
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2">{student.name}</Typography>
                      {student.nameRu ? (
                        <Typography color="text.secondary" variant="caption">
                          {student.nameRu}
                        </Typography>
                      ) : null}
                    </Box>
                  </StyledTableCell>
                  <StyledTableCell align="right">{student.userId}</StyledTableCell>
                  <StyledTableCell align="right">{student.instrument}</StyledTableCell>
                  <StyledTableCell align="right">
                    {student.specialization}
                  </StyledTableCell>
                  <StyledTableCell align="right">{student.city || '-'}</StyledTableCell>
                  <StyledTableCell align="right">
                    {student.country || '-'}
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    {student.gradebookNumber}
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    {formatDate(student.enrolledAt)}
                  </StyledTableCell>
                </StyledTableRow>
              ))}
              {!students.length ? (
                <StyledTableRow>
                  <StyledTableCell colSpan={8}>
                    <Typography
                      color="text.secondary"
                      sx={{ py: 3, textAlign: 'center' }}
                    >
                      Студенты организации пока не найдены.
                    </Typography>
                  </StyledTableCell>
                </StyledTableRow>
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>
      ) : null}

      <AddStudentModal
        currentOrgId={currentOrgId}
        members={members}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() =>
          setSuccessMessage('Студент успешно добавлен в организацию.')
        }
        open={isAddModalOpen}
      />
    </>
  )
}

export default StudentList

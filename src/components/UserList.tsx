import * as React from 'react'
import { useQueryClient } from '@tanstack/react-query'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import { styled } from '@mui/material/styles'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell, { tableCellClasses } from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import { useOrganizationMembers } from '../hooks/useOrganizationMembers'
import InvitModal from '../modals/InvitModal'
import type {
  InvitationResponse,
  OrganizationMember,
} from '../types/users.types'
import {
  Copy,
  Edit as EditIcon,
  Trash2 as DeleteIcon,
} from 'lucide-react'

type UserListProps = {
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

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))

const getMemberName = (member: OrganizationMember) =>
  member.user.name || 'Без имени'

const UserList = ({ currentOrgId }: UserListProps) => {
  const queryClient = useQueryClient()
  const [isInvitationModalOpen, setIsInvitationModalOpen] =
    React.useState(false)
  const [successMessage, setSuccessMessage] = React.useState('')
  const [errorMessage, setErrorMessage] = React.useState('')
  const [copiedMemberId, setCopiedMemberId] = React.useState('')
  const {
    data: members = [],
    error,
    isError,
    isLoading,
  } = useOrganizationMembers(currentOrgId)

  const handleInvitationSuccess = (invitation: InvitationResponse) => {
    setSuccessMessage(
      `Приглашение успешно отправлено на ${invitation.email}. Ссылка действительна 48 часов.`,
    )
    void queryClient.invalidateQueries({
      queryKey: ['organization-members', currentOrgId],
    })
  }

  const handleCopyEmail = async (member: OrganizationMember) => {
    try {
      await navigator.clipboard.writeText(member.user.email)
      setCopiedMemberId(member.id)
      window.setTimeout(() => setCopiedMemberId(''), 1500)
    } catch {
      setErrorMessage('Не удалось скопировать email.')
    }
  }

  const handleEditProfile = (member: OrganizationMember) => {
    setErrorMessage('')
    setSuccessMessage(`Редактирование профиля ${member.user.email} пока не подключено.`)
  }

  const handleDeleteMember = (member: OrganizationMember) => {
    setErrorMessage('')
    setSuccessMessage(`Удаление пользователя ${member.user.email} пока не подключено.`)
  }

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
            Участники организации
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Управление доступом пользователей через приглашения.
          </Typography>
        </Box>

        <Button
          disabled={!currentOrgId}
          onClick={() => {
            setSuccessMessage('')
            setIsInvitationModalOpen(true)
          }}
          startIcon={<AddIcon />}
          variant="contained"
        >
          Пригласить
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

      {errorMessage ? (
        <Alert
          onClose={() => setErrorMessage('')}
          severity="error"
          sx={{ mb: 2 }}
        >
          {errorMessage}
        </Alert>
      ) : null}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : null}

      {isError ? <Alert severity="error">{error.message}</Alert> : null}

      {!isLoading && !isError ? (
        <TableContainer component={Paper}>
          <Table aria-label="Список участников организации" sx={{ minWidth: 700 }}>
            <TableHead>
              <TableRow>
                <StyledTableCell>Имя</StyledTableCell>
                <StyledTableCell align="right">Email</StyledTableCell>
                <StyledTableCell align="right">Локальная роль</StyledTableCell>
                <StyledTableCell align="right">Дата добавления</StyledTableCell>
                <StyledTableCell align="right">Действия</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {members.map((member) => (
                <StyledTableRow hover key={member.id}>
                  <StyledTableCell component="th" scope="row">
                    {getMemberName(member)}
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    {member.user.email}
                    <Tooltip
                        title={
                          copiedMemberId === member.id
                            ? 'Email скопирован'
                            : 'Скопировать email'
                        }
                      >
                        <IconButton
                          aria-label="Скопировать email"
                          onClick={() => void handleCopyEmail(member)}
                          size="small"
                        >
                          <Copy size={18} />
                        </IconButton>
                      </Tooltip>
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    <Chip label={member.role} size="small" />
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    {formatDate(member.createdAt)}
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                      <Tooltip title="Редактировать профиль">
                        <IconButton
                          aria-label="Редактировать профиль"
                          onClick={() => handleEditProfile(member)}
                          size="small"
                        >
                          <EditIcon size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Удалить пользователя">
                        <IconButton
                          aria-label="Удалить пользователя"
                          color="error"
                          onClick={() => handleDeleteMember(member)}
                          size="small"
                        >
                          <DeleteIcon size={18} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
              {!members.length ? (
                <StyledTableRow>
                  <StyledTableCell colSpan={5}>
                    <Typography
                      color="text.secondary"
                      sx={{ py: 3, textAlign: 'center' }}
                    >
                      Участники организации пока не найдены.
                    </Typography>
                  </StyledTableCell>
                </StyledTableRow>
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>
      ) : null}

      <InvitModal
        currentOrgId={currentOrgId}
        onClose={() => setIsInvitationModalOpen(false)}
        onSuccess={handleInvitationSuccess}
        open={isInvitationModalOpen}
      />
    </>
  )
}

export default UserList

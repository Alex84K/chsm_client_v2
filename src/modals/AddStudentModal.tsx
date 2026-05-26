import * as React from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import InputAdornment from '@mui/material/InputAdornment'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Search, User, X } from 'lucide-react'
import { useCreateStudent } from '../hooks/useStudents'
import type { NewStudent } from '../types/student.types'
import type { OrganizationMember } from '../types/users.types'

type UserOption = {
  id: string
  name: string | null
  email: string
  role: string
}

type UserSearchDropdownProps = {
  error?: boolean
  loading?: boolean
  onChange: (user: UserOption | null) => void
  options: UserOption[]
  value: UserOption | null
}

type AddStudentModalProps = {
  currentOrgId: string
  members: OrganizationMember[]
  onClose: () => void
  onSuccess: () => void
  open: boolean
}

const UserSearchDropdown = ({
  error,
  loading,
  onChange,
  options,
  value,
}: UserSearchDropdownProps) => {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const containerRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
        setSearch('')
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const filteredOptions = React.useMemo(() => {
    const query = search.toLowerCase().trim()

    if (!query) {
      return options
    }

    return options.filter((user) => {
      const name = user.name?.toLowerCase() ?? ''
      const email = user.email.toLowerCase()

      return name.includes(query) || email.includes(query) || user.id.includes(query)
    })
  }, [options, search])

  const displayValue = value?.name || value?.email || value?.id || ''

  const handleOpen = () => {
    setOpen(true)
    setSearch('')
    window.setTimeout(() => inputRef.current?.focus(), 50)
  }

  const handleSelect = (user: UserOption) => {
    onChange(user)
    setOpen(false)
    setSearch('')
  }

  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation()
    onChange(null)
    setSearch('')
  }

  return (
    <Box ref={containerRef} sx={{ position: 'relative' }}>
      <Box
        onClick={handleOpen}
        sx={{
          alignItems: 'center',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: error ? 'error.main' : open ? 'primary.main' : 'rgba(0,0,0,0.23)',
          borderRadius: 1,
          boxShadow: open ? '0 0 0 2px rgba(25,118,210,0.15)' : 'none',
          cursor: 'pointer',
          display: 'flex',
          minHeight: 56,
          px: 1.5,
          transition: 'border-color 0.15s',
          '&:hover': { borderColor: error ? 'error.main' : 'text.primary' },
        }}
      >
        <User size={16} style={{ flexShrink: 0, marginRight: 8, opacity: 0.45 }} />

        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <Typography
            sx={{
              color: error ? 'error.main' : 'text.secondary',
              display: 'block',
              fontSize: '0.7rem',
              lineHeight: 1,
              mb: 0.25,
            }}
            variant="caption"
          >
            Пользователь *
          </Typography>
          <Typography
            noWrap
            sx={{
              color: value ? 'text.primary' : 'text.disabled',
              fontSize: '0.95rem',
              lineHeight: 1.2,
            }}
          >
            {value ? displayValue : 'Выберите пользователя из списка'}
          </Typography>
          {value?.email ? (
            <Typography
              color="text.secondary"
              noWrap
              sx={{ fontSize: '0.72rem' }}
              variant="caption"
            >
              {value.email}
            </Typography>
          ) : null}
        </Box>

        {loading ? <CircularProgress size={16} sx={{ flexShrink: 0, ml: 1 }} /> : null}
        {!loading && value ? (
          <Box
            component="span"
            onClick={handleClear}
            sx={{
              alignItems: 'center',
              color: 'text.secondary',
              display: 'flex',
              flexShrink: 0,
              ml: 1,
              '&:hover': { color: 'error.main' },
            }}
          >
            <X size={16} />
          </Box>
        ) : null}
      </Box>

      {open ? (
        <Paper
          elevation={4}
          sx={{
            borderRadius: 1.5,
            left: 0,
            overflow: 'hidden',
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 4px)',
            zIndex: 1300,
          }}
        >
          <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', p: 1 }}>
            <TextField
              fullWidth
              inputRef={inputRef}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  setOpen(false)
                  setSearch('')
                }

                if (event.key === 'Enter' && filteredOptions.length === 1) {
                  handleSelect(filteredOptions[0])
                }
              }}
              placeholder="Поиск по имени, email или ID..."
              size="small"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={15} />
                    </InputAdornment>
                  ),
                  endAdornment: search ? (
                    <InputAdornment position="end">
                      <Box
                        component="span"
                        onClick={() => setSearch('')}
                        sx={{
                          color: 'text.secondary',
                          cursor: 'pointer',
                          display: 'flex',
                        }}
                      >
                        <X size={14} />
                      </Box>
                    </InputAdornment>
                  ) : null,
                },
              }}
              value={search}
            />
          </Box>

          <Box sx={{ maxHeight: 260, overflowY: 'auto' }}>
            {filteredOptions.length ? (
              filteredOptions.map((user) => {
                const isSelected = value?.id === user.id

                return (
                  <Box
                    key={user.id}
                    onClick={() => handleSelect(user)}
                    sx={{
                      bgcolor: isSelected ? 'action.selected' : 'transparent',
                      borderColor: isSelected ? 'primary.main' : 'transparent',
                      borderLeft: isSelected ? '3px solid' : '3px solid transparent',
                      cursor: 'pointer',
                      px: 2,
                      py: 1.25,
                      transition: 'background 0.1s',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <Typography
                      sx={{ fontWeight: isSelected ? 600 : 400 }}
                      variant="body2"
                    >
                      {user.name || <i style={{ opacity: 0.5 }}>Без имени</i>}
                    </Typography>
                    <Stack direction="row" spacing={1.5} sx={{ mt: 0.25 }}>
                      <Typography color="text.secondary" variant="caption">
                        {user.email}
                      </Typography>
                      <Typography color="text.disabled" variant="caption">
                        ID: {user.id}
                      </Typography>
                    </Stack>
                  </Box>
                )
              })
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography color="text.secondary" variant="body2">
                  Ничего не найдено
                </Typography>
              </Box>
            )}
          </Box>

          <Box
            sx={{
              bgcolor: 'grey.50',
              borderColor: 'divider',
              borderTop: '1px solid',
              px: 2,
              py: 0.75,
            }}
          >
            <Typography color="text.secondary" variant="caption">
              {filteredOptions.length} из {options.length} пользователей
            </Typography>
          </Box>
        </Paper>
      ) : null}
    </Box>
  )
}

const getMemberOption = (member: OrganizationMember): UserOption => ({
  email: member.user.email,
  id: member.userId,
  name: member.user.name,
  role: member.role,
})

const AddStudentModal = ({
  currentOrgId,
  members,
  onClose,
  onSuccess,
  open,
}: AddStudentModalProps) => {
  const [selectedUser, setSelectedUser] = React.useState<UserOption | null>(null)
  const [name, setName] = React.useState('')
  const [nameRu, setNameRu] = React.useState('')
  const [instrument, setInstrument] = React.useState('')
  const [specialization, setSpecialization] = React.useState('')
  const [city, setCity] = React.useState('')
  const [country, setCountry] = React.useState('')
  const [gradebookNumber, setGradebookNumber] = React.useState('')
  const [clientError, setClientError] = React.useState('')
  const {
    error: createStudentError,
    isPending: isCreateStudentPending,
    mutate: createStudent,
    reset: resetCreateStudent,
  } = useCreateStudent()
  const wasOpenRef = React.useRef(open)

  const userOptions = React.useMemo(
    () =>
      members
        .filter((member) => member.role === 'STUDENT' || member.role === 'USER')
        .map(getMemberOption),
    [members],
  )

  const resetForm = React.useCallback(() => {
      setSelectedUser(null)
      setName('')
      setNameRu('')
      setInstrument('')
      setSpecialization('')
      setCity('')
      setCountry('')
      setGradebookNumber('')
      setClientError('')
      resetCreateStudent()
  }, [resetCreateStudent])

  React.useEffect(() => {
    if (wasOpenRef.current && !open) {
      resetForm()
    }

    wasOpenRef.current = open
  }, [open, resetForm])

  const handleUserChange = (user: UserOption | null) => {
    setSelectedUser(user)
    setName(user?.name ?? '')
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setClientError('')

    if (!selectedUser) {
      setClientError('Выберите пользователя из списка.')
      return
    }

    if (!name.trim()) {
      setClientError('Заполните имя студента.')
      return
    }

    const payload: Omit<NewStudent, 'organizationId'> = {
      city: city.trim() || null,
      country: country.trim() || null,
      gradebookNumber: gradebookNumber.trim(),
      instrument: instrument.trim(),
      name: name.trim(),
      nameRu: nameRu.trim() || null,
      specialization: specialization.trim(),
      userId: selectedUser.id,
    }

    createStudent(
      {
        orgId: currentOrgId,
        payload,
      },
      {
        onSuccess: () => {
          onSuccess()
          onClose()
        },
      },
    )
  }

  const isLoading = isCreateStudentPending

  return (
    <Dialog fullWidth maxWidth="sm" onClose={onClose} open={open}>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>Добавить студента</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {clientError ? <Alert severity="error">{clientError}</Alert> : null}
            {createStudentError ? (
              <Alert severity="error">{createStudentError.message}</Alert>
            ) : null}

            <UserSearchDropdown
              error={Boolean(clientError && !selectedUser)}
              loading={false}
              onChange={handleUserChange}
              options={userOptions}
              value={selectedUser}
            />

            <TextField
              disabled={isLoading}
              fullWidth
              label="Имя"
              onChange={(event) => setName(event.target.value)}
              required
              value={name}
            />
            <TextField
              disabled={isLoading}
              fullWidth
              label="Имя на русском"
              onChange={(event) => setNameRu(event.target.value)}
              value={nameRu}
            />
            <TextField
              disabled={isLoading}
              fullWidth
              label="Инструмент"
              onChange={(event) => setInstrument(event.target.value)}
              placeholder="Напр: Фортепиано"
              required
              value={instrument}
            />
            <TextField
              disabled={isLoading}
              fullWidth
              label="Специализация"
              onChange={(event) => setSpecialization(event.target.value)}
              placeholder="Напр: Джаз"
              required
              value={specialization}
            />
            <TextField
              disabled={isLoading}
              fullWidth
              label="Город"
              onChange={(event) => setCity(event.target.value)}
              value={city}
            />
            <TextField
              disabled={isLoading}
              fullWidth
              label="Страна"
              onChange={(event) => setCountry(event.target.value)}
              value={country}
            />
            <TextField
              disabled={isLoading}
              fullWidth
              label="Номер зачётной книжки"
              onChange={(event) => setGradebookNumber(event.target.value)}
              required
              value={gradebookNumber}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button disabled={isLoading} onClick={onClose}>
            Отмена
          </Button>
          <Button disabled={isLoading} type="submit" variant="contained">
            {isLoading ? <CircularProgress color="inherit" size={22} /> : 'Добавить'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

export default AddStudentModal

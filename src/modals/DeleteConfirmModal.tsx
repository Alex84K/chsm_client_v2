import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'

interface DeleteConfirmModalProps {
  open: boolean
  conflictMessage?: string | null
  onClose: () => void
  onConfirm: () => void
}

const DeleteConfirmModal = ({
  open,
  conflictMessage,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) => {
  const isConflict = Boolean(conflictMessage)

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{isConflict ? 'Ошибка удаления' : 'Подтверждение удаления'}</DialogTitle>
      <DialogContent dividers sx={{ minWidth: 320 }}>
        <Typography>
          {isConflict
            ? conflictMessage
            : 'Вы действительно хотите удалить эту запись?'}
        </Typography>
      </DialogContent>
      <DialogActions>
        {isConflict ? (
          <Button onClick={onClose} variant="contained">
            Ок
          </Button>
        ) : (
          <>
            <Button onClick={onClose}>Отмена</Button>
            <Button onClick={onConfirm} color="error" variant="contained">
              Удалить
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default DeleteConfirmModal

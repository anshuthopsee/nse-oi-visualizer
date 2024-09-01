import { useEffect, useContext } from 'react';
import { ToastContext } from '../contexts/ToastContextProvider';
import Snackbar, { type SnackbarCloseReason } from '@mui/material/Snackbar';

const Toast = () => {
  const { open, toastPack, messageInfo, setOpen, setToastPack, setMessageInfo } = useContext(ToastContext);

  const handleClose = (
    _e: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const handleExited = () => {
    setMessageInfo(undefined);
  };

  useEffect(() => {
    if (toastPack.length && !messageInfo) {
      setMessageInfo({ ...toastPack[0] });
      setToastPack((prev) => prev.slice(1));
      setOpen(true);
    } else if (toastPack.length && messageInfo && open) {
      setOpen(false);
    }
  }, [toastPack, messageInfo, open]);

  return (
    <Snackbar
      key={messageInfo ? messageInfo.key : undefined}
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      TransitionProps={{ onExited: handleExited }}
      message={messageInfo ? messageInfo.message : undefined}
    />
  );
};

export default Toast;
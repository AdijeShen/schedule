import React, { useEffect, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';

const RequestToast = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('info');

  useEffect(() => {
    // 监听API请求事件
    const handleRequest = (event) => {
      const { detail } = event;
      setMessage(`${detail.method} ${detail.url} - ${detail.status}`);
      setSeverity(detail.success ? 'success' : 'error');
      setOpen(true);
    };

    window.addEventListener('api-request', handleRequest);
    return () => window.removeEventListener('api-request', handleRequest);
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default RequestToast;
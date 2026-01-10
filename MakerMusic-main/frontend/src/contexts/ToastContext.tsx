import React, { createContext, useContext, useState, ReactNode } from 'react';
import Toast, { ToastType } from '../components/Toast';

interface ToastContextData {
  showToast: (message: string, type: ToastType, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('info');
  const [duration, setDuration] = useState(3000);

  const showToast = (msg: string, toastType: ToastType, toastDuration: number = 3000) => {
    setMessage(msg);
    setType(toastType);
    setDuration(toastDuration);
    setVisible(true);
  };

  const showSuccess = (msg: string, toastDuration?: number) => {
    showToast(msg, 'success', toastDuration);
  };

  const showError = (msg: string, toastDuration?: number) => {
    showToast(msg, 'error', toastDuration);
  };

  const showWarning = (msg: string, toastDuration?: number) => {
    showToast(msg, 'warning', toastDuration);
  };

  const showInfo = (msg: string, toastDuration?: number) => {
    showToast(msg, 'info', toastDuration);
  };

  const hideToast = () => {
    setVisible(false);
  };

  return (
    <ToastContext.Provider
      value={{
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
      }}
    >
      {children}
      <Toast
        message={message}
        type={type}
        visible={visible}
        onHide={hideToast}
        duration={duration}
      />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextData => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de um ToastProvider');
  }
  return context;
};
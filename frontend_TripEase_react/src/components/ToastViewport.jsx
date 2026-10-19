import { useEffect, useRef, useState } from 'react';

let nextToastId = 0;

export default function ToastViewport() {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  useEffect(() => {
    const activeTimers = timers.current;
    const dismiss = (id) => {
      clearTimeout(activeTimers.get(id));
      activeTimers.delete(id);
      setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
    };

    const handleToast = (event) => {
      const id = ++nextToastId;
      setToasts((currentToasts) => [
        ...currentToasts,
        { id, type: event.detail.type, message: event.detail.message },
      ]);
      activeTimers.set(id, setTimeout(() => dismiss(id), 5000));
    };

    window.addEventListener('app:toast', handleToast);
    return () => {
      window.removeEventListener('app:toast', handleToast);
      activeTimers.forEach((timer) => clearTimeout(timer));
      activeTimers.clear();
    };
  }, []);

  const dismiss = (id) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  };

  return (
    <div className="toast-viewport" aria-live="polite" aria-relevant="additions">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`} role="alert">
          <span>{toast.message}</span>
          <button type="button" onClick={() => dismiss(toast.id)} aria-label="Dismiss">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

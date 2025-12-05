import { useState, useCallback } from 'react';

export interface Toast {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((toastData: Toast) => {
    // In a real app, this would integrate with a toast component
    // For this prototype, we'll just log it
    console.log('[Toast]', toastData);
    
    // You could also show browser notifications or integrate with a UI library
    if (typeof window !== 'undefined') {
      // Simple alert fallback for demo
      const message = `${toastData.title}${toastData.description ? '\n' + toastData.description : ''}`;
      // Using a timeout to not block the main thread
      setTimeout(() => {
        if (toastData.variant === 'destructive') {
          console.error(message);
        } else {
          console.log(message);
        }
      }, 0);
    }
    
    setToasts(prev => [...prev, toastData]);
  }, []);

  return { toast, toasts };
}

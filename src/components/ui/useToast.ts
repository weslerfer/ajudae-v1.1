import { useState, useEffect } from 'react';

type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastType;
}

interface Toast extends ToastOptions {
  id: string;
}

let toastsCounter = 0;
let subscribers: ((toasts: Toast[]) => void)[] = [];
let toasts: Toast[] = [];

const notify = () => subscribers.forEach((s) => s(toasts));

export const toast = (options: ToastOptions) => {
  const id = (++toastsCounter).toString();
  toasts = [...toasts, { id, ...options }];
  notify();
  
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
  }, 5000);
};

export const useToast = () => {
  const [state, setState] = useState<Toast[]>(toasts);

  useEffect(() => {
    subscribers.push(setState);
    return () => {
      subscribers = subscribers.filter((s) => s !== setState);
    };
  }, []);

  return { toasts: state, toast };
};

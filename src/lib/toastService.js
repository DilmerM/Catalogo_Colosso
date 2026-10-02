let listeners = [];
let toasts = [];

function notify() {
  listeners.forEach(listener => listener([...toasts]));
}

export const toastService = {
  subscribe: (listener) => {
    listeners.push(listener);
    listener([...toasts]);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  },

  show: (message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    const toast = { id, message, type };
    
    toasts = [...toasts, toast];
    notify();

    setTimeout(() => {
      toastService.remove(id);
    }, duration);
  },

  success: (message, duration = 3000) => {
    toastService.show(message, 'success', duration);
  },

  error: (message, duration = 4000) => {
    toastService.show(message, 'error', duration);
  },

  remove: (id) => {
    toasts = toasts.filter(t => t.id !== id);
    notify();
  }
};

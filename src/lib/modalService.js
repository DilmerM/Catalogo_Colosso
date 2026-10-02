let modalState = {
  isOpen: false,
  type: 'alert', // 'alert' or 'confirm'
  message: '',
  onConfirm: null,
  onCancel: null,
};

let listeners = [];

function notify() {
  listeners.forEach(listener => listener(modalState));
}

export const modalService = {
  subscribe: (listener) => {
    listeners.push(listener);
    // return current state immediately
    listener(modalState);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  },
  
  alert: (message) => {
    return new Promise(resolve => {
      modalState = {
        isOpen: true,
        type: 'alert',
        message,
        onConfirm: () => {
          modalState.isOpen = false;
          notify();
          resolve();
        },
        onCancel: null
      };
      notify();
    });
  },

  confirm: (message) => {
    return new Promise(resolve => {
      modalState = {
        isOpen: true,
        type: 'confirm',
        message,
        onConfirm: () => {
          modalState.isOpen = false;
          notify();
          resolve(true);
        },
        onCancel: () => {
          modalState.isOpen = false;
          notify();
          resolve(false);
        }
      };
      notify();
    });
  }
};

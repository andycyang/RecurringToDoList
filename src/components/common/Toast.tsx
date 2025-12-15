import { useToast } from '../../context/ToastContext';

export function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[300px] max-w-md
            animate-slide-in
            ${
              toast.type === 'success'
                ? 'bg-green-600 text-white'
                : toast.type === 'error'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-white'
            }
          `}
        >
          <span className="flex-1">{toast.message}</span>
          {toast.undoAction && (
            <button
              onClick={() => {
                toast.undoAction?.();
                dismissToast(toast.id);
              }}
              className="font-medium underline hover:no-underline"
            >
              Undo
            </button>
          )}
          <button
            onClick={() => dismissToast(toast.id)}
            className="text-white/80 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

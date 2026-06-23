import { AlertCircle, X } from 'lucide-react';

export default function ErrorMessage({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
      <AlertCircle size={18} />
      <span className="flex-1">{message}</span>
      {onClose && (
        <button onClick={onClose} className="text-red-400 hover:text-red-600">
          <X size={18} />
        </button>
      )}
    </div>
  );
}

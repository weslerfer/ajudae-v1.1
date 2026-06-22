import React from "react";

interface ActionModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  promptLabel?: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: (val?: string) => void;
  onCancel: () => void;
}

export function ActionModal({
  isOpen,
  title,
  message,
  promptLabel,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isDanger = false,
  onConfirm,
  onCancel,
}: ActionModalProps) {
  const [inputValue, setInputValue] = React.useState("");

  React.useEffect(() => {
    if (isOpen) setInputValue("");
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(promptLabel ? inputValue : undefined);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm shadow-2xl p-6 relative overflow-hidden">
        <h3
          className={`text-lg font-bold font-sans mb-2 ${isDanger ? "text-red-400" : "text-white"}`}
        >
          {title}
        </h3>
        <p className="text-sm text-slate-400 mb-6 font-sans">{message}</p>

        {promptLabel && (
          <div className="mb-6 space-y-2">
            <label className="text-[10px] uppercase font-mono font-bold text-slate-500">
              {promptLabel}
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full bg-slate-950 text-white rounded-xl px-4 py-3 border border-slate-800 text-sm focus:outline-none focus:border-indigo-500"
              placeholder="Digite aqui..."
              autoFocus
            />
          </div>
        )}

        <div className="flex gap-3 mt-8">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 text-xs font-bold font-mono uppercase bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 px-4 py-3 text-xs font-bold font-mono uppercase rounded-xl transition-colors ${
              isDanger
                ? "bg-red-600 hover:bg-red-500 text-white"
                : "bg-emerald-600 hover:bg-emerald-500 text-white"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

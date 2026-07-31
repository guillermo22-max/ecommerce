export function InputField({ label, id, error, className = '', ...props }) {
  return (
    <label htmlFor={id} className={`flex flex-col gap-1 text-sm ${className}`}>
      <span className="font-medium text-slate-700">{label}</span>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        className={`rounded-md border px-3 py-2 text-slate-900 outline-none transition-colors focus:ring-1 ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
            : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'
        }`}
        {...props}
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  )
}

export function SelectField({ label, id, className = '', children, ...props }) {
  return (
    <label htmlFor={id} className={`flex flex-col gap-1 text-sm ${className}`}>
      <span className="font-medium text-slate-700">{label}</span>
      <select
        id={id}
        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        {...props}
      >
        {children}
      </select>
    </label>
  )
}

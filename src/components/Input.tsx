import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-semibold text-gray-700">{label}</label>
      )}
      <input
        className={clsx(
          'px-4 py-3 border-2 rounded-lg focus:outline-none transition',
          'border-gray-300 focus:border-red-600 focus:ring-2 focus:ring-red-200',
          error && 'border-red-500 focus:border-red-500',
          className
        )}
        {...props}
      />
      {error && <span className="text-sm text-red-600 font-semibold">{error}</span>}
    </div>
  );
}

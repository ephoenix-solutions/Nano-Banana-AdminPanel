interface FormSelectProps {
  id: string;
  name: string;
  label: string;
  value: string | undefined;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
  disabled?: boolean;
}

export default function FormSelect({
  id,
  name,
  label,
  value,
  onChange,
  options,
  required = false,
  disabled = false,
}: FormSelectProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-primary mb-2 font-body"
      >
        {label} {required && <span className="text-secondary">*</span>}
      </label>
      <select
        id={id}
        name={name}
        value={value || ''}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="w-full px-4 py-3 border border-primary/10 rounded-lg text-sm font-body text-primary bg-background transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

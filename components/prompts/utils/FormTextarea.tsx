interface FormTextareaProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  placeholder?: string;
  rows?: number;
}

export default function FormTextarea({
  id,
  name,
  label,
  value,
  onChange,
  required = false,
  placeholder = '',
  rows = 4,
}: FormTextareaProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-primary mb-2 font-body"
      >
        {label} {required && <span className="text-secondary">*</span>}
      </label>
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        rows={rows}
        className="w-full px-4 py-3 border border-primary/10 rounded-lg text-sm font-body text-primary bg-background transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none"
        placeholder={placeholder}
      />
    </div>
  );
}

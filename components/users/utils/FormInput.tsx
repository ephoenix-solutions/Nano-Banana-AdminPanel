interface FormInputProps {
  id: string;
  name: string;
  label: string;
  value: string | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  optional?: boolean;
}

export default function FormInput({
  id,
  name,
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  placeholder = '',
  optional = false,
}: FormInputProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-primary mb-2 font-body"
      >
        {label}{' '}
        {required && <span className="text-secondary">*</span>}
        {optional && <span className="text-secondary/50">(Optional)</span>}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        value={value || ''}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-3 border border-primary/10 rounded-lg text-sm font-body text-primary bg-background transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        placeholder={placeholder}
      />
    </div>
  );
}

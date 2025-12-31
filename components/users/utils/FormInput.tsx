'use client';

import { useState } from 'react';
import { Icons } from '@/config/icons';

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
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === 'password';

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
      <div className="relative">
        <input
          type={isPasswordField && showPassword ? 'text' : type}
          id={id}
          name={name}
          value={value || ''}
          onChange={onChange}
          required={required}
          className={`w-full px-4 py-3 border border-primary/10 rounded-lg text-sm font-body text-primary bg-background transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 ${isPasswordField ? 'pr-12' : ''}`}
          placeholder={placeholder}
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? (
              <Icons.eyeOff size={20} className="text-secondary hover:text-primary transition-colors" />
            ) : (
              <Icons.eye size={20} className="text-secondary hover:text-primary transition-colors" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { SecurityUtils } from '../../utils/security';

interface SecureInputProps {
  type: 'text' | 'password' | 'email';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  validateSecurity?: boolean;
  maxLength?: number;
}

export const SecureInput: React.FC<SecureInputProps> = ({
  type,
  value,
  onChange,
  placeholder = '',
  required = false,
  className = '',
  validateSecurity = true,
  maxLength = 500
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [securityWarning, setSecurityWarning] = useState('');

  useEffect(() => {
    if (validateSecurity && value) {
      // Check for potentially dangerous content
      const originalLength = value.length;
      const sanitized = SecurityUtils.sanitizeInput(value);
      
      if (sanitized.length !== originalLength) {
        setSecurityWarning('Potentially unsafe characters were removed');
        onChange(sanitized);
      } else {
        setSecurityWarning('');
      }
    }
  }, [value, validateSecurity, onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Enforce max length
    if (newValue.length > maxLength) {
      return;
    }

    if (validateSecurity) {
      const sanitized = SecurityUtils.sanitizeInput(newValue);
      onChange(sanitized);
    } else {
      onChange(newValue);
    }
  };

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className="relative">
      <input
        type={inputType}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        className={`block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${className} ${
          securityWarning ? 'border-yellow-400 bg-yellow-50' : ''
        }`}
        autoComplete={type === 'password' ? 'current-password' : 'off'}
        spellCheck={false}
      />
      
      {type === 'password' && (
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      )}

      {securityWarning && (
        <div className="mt-1 flex items-center text-xs text-yellow-600">
          <AlertTriangle className="w-3 h-3 mr-1" />
          {securityWarning}
        </div>
      )}
    </div>
  );
};
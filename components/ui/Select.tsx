
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  children: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({ label, id, children, ...props }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      <select
        id={id}
        {...props}
        className="w-full bg-gray-100 dark:bg-dark-tertiary border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-tech-blue focus:outline-none transition-colors"
      >
        {children}
      </select>
    </div>
  );
};

export default Select;

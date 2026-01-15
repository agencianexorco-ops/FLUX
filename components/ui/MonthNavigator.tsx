
import React from 'react';
import Icon from './Icon';

interface MonthNavigatorProps {
  selectedDate: Date;
  onDateChange: (newDate: Date) => void;
}

const MonthNavigator: React.FC<MonthNavigatorProps> = ({ selectedDate, onDateChange }) => {
  const handlePrevMonth = () => {
    onDateChange(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 15)); // Use day 15 to avoid month skipping issues
  };

  const handleNextMonth = () => {
    onDateChange(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 15)); // Use day 15 to avoid month skipping issues
  };

  const monthName = selectedDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 p-1 bg-gray-200/60 dark:bg-dark-tertiary/60 rounded-lg w-full max-w-xs sm:max-w-sm">
      <button onClick={handlePrevMonth} className="p-2 rounded-full text-gray-600 dark:text-gray-200 hover:bg-gray-300/50 dark:hover:bg-dark-tertiary" aria-label="Mês anterior">
        <Icon name="chevron-left" className="w-5 h-5" />
      </button>
      <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white w-36 sm:w-48 text-center capitalize whitespace-nowrap">{monthName}</h2>
      <button onClick={handleNextMonth} className="p-2 rounded-full text-gray-600 dark:text-gray-200 hover:bg-gray-300/50 dark:hover:bg-dark-tertiary" aria-label="Próximo mês">
        <Icon name="chevron-right" className="w-5 h-5" />
      </button>
    </div>
  );
};

export default MonthNavigator;

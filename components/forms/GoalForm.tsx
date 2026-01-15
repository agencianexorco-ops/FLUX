
import React, { useState, useEffect } from 'react';
import { Goal } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface GoalFormProps {
  onSave: (goal: Omit<Goal, 'id' | 'currentAmount'> | Goal) => void;
  onClose: () => void;
  initialData: Goal | null;
}

const GoalForm: React.FC<GoalFormProps> = ({ onSave, onClose, initialData }) => {
  const today = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: 0,
    initialAmount: 0,
    startDate: today,
    endDate: today,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
          name: initialData.name,
          targetAmount: initialData.targetAmount,
          initialAmount: initialData.initialAmount,
          startDate: initialData.startDate,
          endDate: initialData.endDate,
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(initialData ? { ...formData, id: initialData.id, currentAmount: initialData.currentAmount } : formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Nome da Meta" id="name" name="name" value={formData.name} onChange={handleChange} required />
      <Input label="Valor Alvo" id="targetAmount" name="targetAmount" type="number" value={formData.targetAmount} onChange={handleChange} required />
      <Input label="Valor Inicial" id="initialAmount" name="initialAmount" type="number" value={formData.initialAmount} onChange={handleChange} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Data de Início" id="startDate" name="startDate" type="date" value={formData.startDate} onChange={handleChange} required />
        <Input label="Data de Previsão" id="endDate" name="endDate" type="date" value={formData.endDate} onChange={handleChange} required />
      </div>
      <div className="flex justify-end gap-4 pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button type="submit">Salvar</Button>
      </div>
    </form>
  );
};

export default GoalForm;

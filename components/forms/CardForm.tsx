
import React, { useState, useEffect } from 'react';
import { CreditCard } from '../../types';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface CardFormProps {
  onSave: (card: Omit<CreditCard, 'id' | 'user_id' | 'created_at'> | CreditCard) => void;
  onClose: () => void;
  initialData: CreditCard | null;
}

const CardForm: React.FC<CardFormProps> = ({ onSave, onClose, initialData }) => {
    const { profile } = useAuth();
    const [formData, setFormData] = useState({
        bankName: '',
        limit: 0,
        closingDay: 1,
        dueDay: 10,
        holderName: profile?.user_name || '',
    });

    useEffect(() => {
        if (initialData) {
            const { id, user_id, created_at, ...rest } = initialData;
            setFormData(rest);
        } else {
            setFormData(prev => ({ ...prev, holderName: profile?.user_name || '' }));
        }
    }, [initialData, profile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(initialData ? { ...formData, id: initialData.id, user_id: initialData.user_id, created_at: initialData.created_at } : formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Nome do Banco" id="bankName" name="bankName" value={formData.bankName} onChange={handleChange} required />
            <Input label="Nome do Titular" id="holderName" name="holderName" value={formData.holderName} onChange={handleChange} required />
            <Input label="Limite do Cartão" id="limit" name="limit" type="number" value={formData.limit} onChange={handleChange} required />
            <div className="grid grid-cols-2 gap-4">
                <Input label="Dia do Fechamento" id="closingDay" name="closingDay" type="number" min="1" max="31" value={formData.closingDay} onChange={handleChange} required />
                <Input label="Dia do Vencimento" id="dueDay" name="dueDay" type="number" min="1" max="31" value={formData.dueDay} onChange={handleChange} required />
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button type="submit">Salvar</Button>
            </div>
        </form>
    );
};

export default CardForm;

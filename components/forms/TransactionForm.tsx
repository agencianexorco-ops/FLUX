import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, TransactionStatus, Recurrence, PaymentMethod, AppMode } from '../../types';
import { useAppContext } from '../../context/AppContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

interface TransactionFormProps {
  onSave: (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>, installmentDetails: {date: string, amount: number}[]) => void;
  onClose: () => void;
  initialData: Transaction | null;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onSave, onClose, initialData }) => {
  const { categories, profile, cards, selectedDate } = useAppContext();
  
  const getInitialDate = () => {
    if (initialData) return initialData.date;
    const today = new Date();
    const selectedYear = selectedDate.getFullYear();
    const selectedMonth = selectedDate.getMonth();
    if (selectedYear === today.getFullYear() && selectedMonth === today.getMonth()) {
      return today.toISOString().split('T')[0];
    }
    const d = new Date(selectedYear, selectedMonth, 1);
    return d.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState<Omit<Transaction, 'id' | 'user_id' | 'created_at'>>({
    type: TransactionType.EXPENSE,
    amount: 0,
    date: getInitialDate(),
    description: '',
    payer: profile?.user_name || '',
    category: '',
    status: TransactionStatus.COMPLETED,
    recurrence: Recurrence.NONE,
    paymentMethod: PaymentMethod.PIX,
    paymentDetails: '',
    installments: undefined,
    cardId: undefined,
  });
  const [installments, setInstallments] = useState(1);
  const [installmentDetails, setInstallmentDetails] = useState<{date: string, amount: number}[]>([]);

  useEffect(() => {
    if (initialData) {
      const { user_id, created_at, id, ...rest } = initialData;
      setFormData({ ...rest });
      if (initialData.installments) {
        setInstallments(initialData.installments.total);
      }
    } else {
        setFormData(prev => ({ ...prev, date: getInitialDate(), payer: profile?.user_name || '' }));
        setInstallments(1);
    }
  }, [initialData, selectedDate, profile]);

  useEffect(() => {
    if (installments > 1 && formData.amount > 0 && !initialData) {
        const totalAmount = formData.amount;
        const baseAmount = Math.floor((totalAmount / installments) * 100) / 100;
        let remainder = totalAmount - (baseAmount * installments);
        remainder = Math.round(remainder * 100) / 100;

        const details = Array.from({ length: installments }, (_, i) => {
            const installmentDate = new Date(formData.date + 'T12:00:00');
            installmentDate.setMonth(installmentDate.getMonth() + i);
            
            let amount = baseAmount;
            if (i === installments - 1) { // last installment gets remainder
                amount += remainder;
            }

            return {
                date: installmentDate.toISOString().split('T')[0],
                amount: Math.round(amount * 100) / 100
            };
        });
        setInstallmentDetails(details);
    } else {
        setInstallmentDetails([]);
    }
  }, [installments, formData.amount, formData.date, initialData]);

  const handleInstallmentDetailChange = (index: number, field: 'date' | 'amount', value: string | number) => {
      const newDetails = [...installmentDetails];
      if(field === 'amount') {
          newDetails[index].amount = Number(String(value).replace(',', '.')) || 0;
      } else {
          newDetails[index][field] = value as string;
      }
      setInstallmentDetails(newDetails);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\./g, '').replace(',', '.');
    setFormData(prev => ({ ...prev, amount: Number(value) || 0 }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, installmentDetails);
  };

  const availableCategories = categories.filter(c => c.type === formData.type);
  const payers = profile?.mode === AppMode.COUPLE && profile.partner_name ? [profile.user_name, profile.partner_name] : [profile?.user_name || ''];
  const isInstallmentEdit = !!(initialData && initialData.installments);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-4">
          <Button type="button" onClick={() => setFormData(p => ({...p, type: TransactionType.EXPENSE}))} className={`w-full ${formData.type === TransactionType.EXPENSE ? 'bg-energetic-orange' : 'bg-gray-200 text-gray-700 dark:bg-dark-tertiary dark:text-gray-300'}`}>Despesa</Button>
          <Button type="button" onClick={() => setFormData(p => ({...p, type: TransactionType.INCOME}))} className={`w-full ${formData.type === TransactionType.INCOME ? 'bg-finance-green' : 'bg-gray-200 text-gray-700 dark:bg-dark-tertiary dark:text-gray-300'}`}>Receita</Button>
      </div>
      <Input label="Descrição" id="description" name="description" value={formData.description} onChange={handleChange} required />
      <div className="grid grid-cols-2 gap-4">
        <Input 
            label="Valor" 
            id="amount" 
            name="amount" 
            value={formData.amount === 0 ? '' : String(formData.amount).replace('.', ',')} 
            onChange={handleAmountChange} 
            required 
            type="text" 
            placeholder="0,00"
            disabled={isInstallmentEdit}
        />
        <Input label="Data" id="date" name="date" type="date" value={formData.date} onChange={handleChange} required />
      </div>
       <div className="grid grid-cols-2 gap-4">
        <Select label="Categoria" id="category" name="category" value={formData.category} onChange={handleChange} required>
          <option value="">Selecione...</option>
          {availableCategories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
        </Select>
        <Select label="Responsável" id="payer" name="payer" value={formData.payer} onChange={handleChange} required>
            {payers.filter(p => p).map(p => <option key={p} value={p}>{p}</option>)}
        </Select>
       </div>
      <div className="grid grid-cols-2 gap-4">
        <Select label="Status" id="status" name="status" value={formData.status} onChange={handleChange}>
          {Object.values(TransactionStatus).map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </Select>
        <Select label="Forma de Pagamento" id="paymentMethod" name="paymentMethod" value={formData.paymentMethod} onChange={handleChange}>
          {Object.values(PaymentMethod).map(pm => <option key={pm} value={pm}>{pm.charAt(0).toUpperCase() + pm.slice(1)}</option>)}
        </Select>
      </div>
       {formData.paymentMethod === PaymentMethod.CREDIT && (
        <Select label="Cartão de Crédito" id="cardId" name="cardId" value={formData.cardId || ''} onChange={handleChange}>
            <option value="">Selecione o cartão...</option>
            {cards.map(card => <option key={card.id} value={card.id}>{card.bankName} - {card.holderName}</option>)}
        </Select>
      )}
      {!isInstallmentEdit && (
         <Input label="Parcelas" id="installments" name="installments" type="number" min="1" value={installments} onChange={(e) => setInstallments(Number(e.target.value) || 1)} />
      )}
      
      {installmentDetails.length > 1 && (
        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Detalhes das Parcelas</h3>
            <div className="max-h-48 overflow-y-auto pr-2 space-y-2">
            {installmentDetails.map((detail, index) => (
                <div key={index} className="grid grid-cols-5 gap-2 items-center">
                    <span className="col-span-1 text-sm text-gray-500 dark:text-gray-400">P {index+1}:</span>
                    <div className="col-span-2">
                        <Input label="" id={`date-${index}`} type="date" value={detail.date} onChange={e => handleInstallmentDetailChange(index, 'date', e.target.value)} />
                    </div>
                    <div className="col-span-2">
                         <Input label="" id={`amount-${index}`} type="text" value={String(detail.amount).replace('.', ',')} onChange={e => handleInstallmentDetailChange(index, 'amount', e.target.value)} />
                    </div>
                </div>
            ))}
            </div>
        </div>
      )}

      <div className="flex justify-end gap-4 pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button type="submit">Salvar</Button>
      </div>
    </form>
  );
};

export default TransactionForm;
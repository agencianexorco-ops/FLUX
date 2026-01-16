
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Transaction, TransactionStatus, AppMode } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import Modal from '../components/ui/Modal';
import TransactionForm from '../components/forms/TransactionForm';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

const Transactions: React.FC = () => {
    const { monthlyTransactions, addTransaction, addMultipleTransactions, updateTransaction, deleteTransaction, categories, cards, profile } = useAppContext();
    
    const [filters, setFilters] = useState({
        type: 'all',
        payer: 'all',
        category: 'all',
        card: 'all',
        minAmount: '',
        maxAmount: ''
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({...prev, [e.target.name]: e.target.value}));
    }

    const payers = useMemo(() => {
        if (!profile) return [];
        return profile.mode === AppMode.COUPLE ? [profile.user_name, profile.partner_name].filter(Boolean) as string[] : [profile.user_name];
    }, [profile]);
    
    const filteredTransactions = useMemo(() => {
        return monthlyTransactions.filter(t => {
            const { type, payer, category, card, minAmount, maxAmount } = filters;
            if (type !== 'all' && t.type !== type) return false;
            if (payer !== 'all' && t.payer !== payer) return false;
            if (category !== 'all' && t.category !== category) return false;
            if (card !== 'all' && t.cardId !== card) return false;
            const min = parseFloat(minAmount.replace(',', '.'));
            const max = parseFloat(maxAmount.replace(',', '.'));
            if (!isNaN(min) && t.amount < min) return false;
            if (!isNaN(max) && t.amount > max) return false;
            return true;
        });
    }, [monthlyTransactions, filters]);


    const handleOpenModal = (transaction: Transaction | null = null) => {
        setEditingTransaction(transaction);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTransaction(null);
    };

    const handleSaveTransaction = (transactionData: Omit<Transaction, 'id'>, installmentDetails: {date: string, amount: number}[]) => {
        try {
            if (editingTransaction) {
                // This only updates the single transaction being edited, not the entire installment group.
                updateTransaction({ ...transactionData, id: editingTransaction.id });
            } else if (installmentDetails.length > 1) {
                const parentId = crypto.randomUUID();
                const installmentsCount = installmentDetails.length;

                const transactionsToAdd: Omit<Transaction, 'id'>[] = installmentDetails.map((detail, index) => ({
                    ...transactionData,
                    amount: detail.amount,
                    date: detail.date,
                    description: `${transactionData.description} (${index + 1}/${installmentsCount})`,
                    installments: {
                        current: index + 1,
                        total: installmentsCount,
                        parentId: parentId,
                    },
                    status: index === 0 ? transactionData.status : TransactionStatus.PLANNED,
                }));
                
                addMultipleTransactions(transactionsToAdd);
            } else {
                addTransaction(transactionData);
            }
            handleCloseModal();
        } catch (error) {
            if (error instanceof Error) {
                alert(error.message);
            } else {
                alert("Ocorreu um erro desconhecido ao salvar a transação.");
            }
        }
    };

    const handleDeleteTransaction = async (id: string) => {
        try {
            await deleteTransaction(id);
        } catch (error) {
            console.error("Falha ao excluir o lançamento:", error);
            // A notificação de erro já é tratada no AppContext.
        }
    };
    
    return (
        <div className="space-y-8 pb-16 md:pb-0">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-3xl font-bold font-display text-gray-900 dark:text-white">Lançamentos do Mês</h1>
                <Button onClick={() => handleOpenModal()}>
                    <Icon name="plus" className="w-5 h-5 mr-2" />
                    Novo Lançamento
                </Button>
            </div>

            <Card>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
                    <Select label="Tipo" name="type" value={filters.type} onChange={handleFilterChange}>
                        <option value="all">Todos</option>
                        <option value="income">Receita</option>
                        <option value="expense">Despesa</option>
                    </Select>
                    <Select label="Responsável" name="payer" value={filters.payer} onChange={handleFilterChange}>
                        <option value="all">Todos</option>
                        {payers.map(p => <option key={p} value={p}>{p}</option>)}
                    </Select>
                    <Select label="Categoria" name="category" value={filters.category} onChange={handleFilterChange}>
                        <option value="all">Todas</option>
                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </Select>
                    <Select label="Cartão" name="card" value={filters.card} onChange={handleFilterChange}>
                        <option value="all">Todos</option>
                        {cards.map(c => <option key={c.id} value={c.id}>{c.bankName}</option>)}
                    </Select>
                    <Input label="Valor Mín." name="minAmount" type="number" placeholder="0,00" value={filters.minAmount} onChange={handleFilterChange} />
                    <Input label="Valor Máx." name="maxAmount" type="number" placeholder="1.000,00" value={filters.maxAmount} onChange={handleFilterChange} />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                            <tr>
                                <th className="p-3">Descrição</th>
                                <th className="p-3">Valor</th>
                                <th className="p-3 hidden md:table-cell">Categoria</th>
                                <th className="p-3 hidden lg:table-cell">Responsável</th>
                                <th className="p-3 hidden lg:table-cell">Data</th>
                                <th className="p-3 hidden md:table-cell">Status</th>
                                <th className="p-3">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.length > 0 ? filteredTransactions.map(t => (
                                <tr key={t.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-dark-tertiary/50">
                                    <td className="p-3">
                                        <div className="flex items-center">
                                            <div className={`w-2 h-8 rounded-full mr-3 ${t.type === 'income' ? 'bg-finance-green' : 'bg-energetic-orange'}`}></div>
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white">{t.description}</p>
                                                <p className="text-xs text-gray-500 md:hidden">{t.category} - {formatDate(t.date)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={`p-3 font-semibold ${t.type === 'income' ? 'text-finance-green' : 'text-energetic-orange'}`}>{formatCurrency(t.amount)}</td>
                                    <td className="p-3 text-gray-700 dark:text-gray-300 hidden md:table-cell">{t.category}</td>
                                    <td className="p-3 text-gray-700 dark:text-gray-300 hidden lg:table-cell">{t.payer}</td>
                                    <td className="p-3 text-gray-700 dark:text-gray-300 hidden lg:table-cell">{formatDate(t.date)}</td>
                                    <td className="p-3 hidden md:table-cell">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${t.status === TransactionStatus.COMPLETED ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{t.status}</span>
                                    </td>
                                    <td className="p-3">
                                        <div className="flex space-x-2">
                                            <button onClick={() => handleOpenModal(t)} className="p-1 text-gray-500 dark:text-gray-400 hover:text-tech-blue"><Icon name="pencil" className="w-4 h-4" /></button>
                                            <button onClick={() => handleDeleteTransaction(t.id)} className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-500"><Icon name="trash" className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="text-center py-10 text-gray-500 dark:text-gray-400">
                                        Nenhum lançamento encontrado para este mês com os filtros aplicados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingTransaction ? 'Editar Lançamento' : 'Novo Lançamento'}>
                <TransactionForm
                    onSave={handleSaveTransaction}
                    onClose={handleCloseModal}
                    initialData={editingTransaction}
                />
            </Modal>
        </div>
    );
};

export default Transactions;

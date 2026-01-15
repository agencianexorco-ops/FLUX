
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Transaction, TransactionStatus } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import Modal from '../components/ui/Modal';
import TransactionForm from '../components/forms/TransactionForm';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

const Transactions: React.FC = () => {
    const { monthlyTransactions, transactions, addTransaction, addMultipleTransactions, updateTransaction, deleteTransaction } = useAppContext();
    const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

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

    const handleDeleteTransaction = (transaction: Transaction) => {
        if (transaction.installments?.parentId) {
            if (window.confirm("Este é um lançamento parcelado. Deseja excluir todas as parcelas relacionadas?")) {
                deleteTransaction(transaction.id);
            }
        } else {
            if (window.confirm("Tem certeza que deseja excluir este lançamento?")) {
                deleteTransaction(transaction.id);
            }
        }
    };

    const filteredTransactions = monthlyTransactions.filter(t => {
        if (filter === 'all') return true;
        return t.type === filter;
    });

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
                <div className="flex items-center justify-between mb-4">
                    <div className="flex space-x-2 p-1 bg-gray-100 dark:bg-dark-tertiary rounded-lg">
                        <button onClick={() => setFilter('all')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${filter === 'all' ? 'bg-tech-blue text-white' : 'text-gray-600 dark:text-gray-400'}`}>Todos</button>
                        <button onClick={() => setFilter('income')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${filter === 'income' ? 'bg-finance-green text-white' : 'text-gray-600 dark:text-gray-400'}`}>Entradas</button>
                        <button onClick={() => setFilter('expense')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${filter === 'expense' ? 'bg-energetic-orange text-white' : 'text-gray-600 dark:text-gray-400'}`}>Saídas</button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                            <tr>
                                <th className="p-3">Descrição</th>
                                <th className="p-3">Valor</th>
                                <th className="p-3 hidden md:table-cell">Categoria</th>
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
                                    <td className="p-3 text-gray-700 dark:text-gray-300 hidden lg:table-cell">{formatDate(t.date)}</td>
                                    <td className="p-3 hidden md:table-cell">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${t.status === TransactionStatus.COMPLETED ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{t.status}</span>
                                    </td>
                                    <td className="p-3">
                                        <div className="flex space-x-2">
                                            <button onClick={() => handleOpenModal(t)} className="p-1 text-gray-500 dark:text-gray-400 hover:text-tech-blue"><Icon name="pencil" className="w-4 h-4" /></button>
                                            <button onClick={() => handleDeleteTransaction(t)} className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-500"><Icon name="trash" className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-10 text-gray-500 dark:text-gray-400">
                                        Nenhum lançamento encontrado para este mês.
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

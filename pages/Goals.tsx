
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Goal } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import Modal from '../components/ui/Modal';
import GoalForm from '../components/forms/GoalForm';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const GoalItem: React.FC<{ goal: Goal, onEdit: (goal: Goal) => void, onDelete: (id: string) => void }> = ({ goal, onEdit, onDelete }) => {
    const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
    
    return (
        <Card>
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{goal.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Meta: {formatCurrency(goal.targetAmount)}</p>
                </div>
                <div className="flex space-x-2">
                    <Button size="sm" variant="secondary" onClick={() => onEdit(goal)}><Icon name="pencil" className="w-4 h-4" /></Button>
                    <Button size="sm" variant="danger" onClick={() => onDelete(goal.id)}><Icon name="trash" className="w-4 h-4" /></Button>
                </div>
            </div>
            <div className="mt-4">
                <div className="flex justify-between items-center text-sm mb-1">
                    <span className="font-semibold text-finance-green">{formatCurrency(goal.currentAmount)}</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-dark-tertiary rounded-full h-3">
                    <div 
                        className="bg-gradient-to-r from-tech-blue to-finance-green h-3 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                </div>
            </div>
            <div className="mt-4 flex justify-between text-xs text-gray-500">
                <span>Início: {new Date(goal.startDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</span>
                <span>Previsão: {new Date(goal.endDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</span>
            </div>
        </Card>
    );
};

const Goals: React.FC = () => {
    const { goals, addGoal, updateGoal, deleteGoal } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

    const handleOpenModal = (goal: Goal | null = null) => {
        setEditingGoal(goal);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingGoal(null);
    };

    // FIX: The type for a new goal was incorrect. It should not include database-generated fields like `id`, `user_id`, `created_at`, or the calculated `currentAmount`. This aligns it with the `addGoal` function's expectation.
    const handleSaveGoal = (goalData: Omit<Goal, 'id' | 'currentAmount' | 'user_id' | 'created_at'> | Goal) => {
        if ('id' in goalData) {
            updateGoal(goalData);
        } else {
            addGoal(goalData);
        }
        handleCloseModal();
    };


    return (
        <div className="space-y-8 pb-16 md:pb-0">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-3xl font-bold font-display text-gray-900 dark:text-white">Metas e Investimentos</h1>
                <Button onClick={() => handleOpenModal()}>
                    <Icon name="plus" className="w-5 h-5 mr-2" />
                    Nova Meta
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {goals.map(goal => (
                    <GoalItem key={goal.id} goal={goal} onEdit={handleOpenModal} onDelete={deleteGoal} />
                ))}
                {goals.length === 0 && (
                     <p className="text-gray-500 dark:text-gray-400 col-span-full text-center py-10">Você ainda não definiu nenhuma meta.</p>
                )}
            </div>
            
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingGoal ? 'Editar Meta' : 'Nova Meta'}>
                <GoalForm
                    onSave={handleSaveGoal}
                    onClose={handleCloseModal}
                    initialData={editingGoal}
                />
            </Modal>
        </div>
    );
};

export default Goals;


import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Category, TransactionType } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

const CategoryItem: React.FC<{ category: Category; onEdit: (category: Category) => void; onDelete: (id: string) => void }> = ({ category, onEdit, onDelete }) => {
    return (
        <div className="flex items-center justify-between bg-gray-100 dark:bg-dark-tertiary p-3 rounded-lg">
            <div className="flex items-center">
                <div className={`w-2 h-6 rounded-full mr-3 ${category.type === TransactionType.INCOME ? 'bg-finance-green' : 'bg-energetic-orange'}`}></div>
                <span className="font-medium text-gray-900 dark:text-white">{category.name}</span>
            </div>
            <div className="flex space-x-2">
                <Button size="sm" variant="secondary" onClick={() => onEdit(category)}><Icon name="pencil" className="w-4 h-4"/></Button>
                <Button size="sm" variant="danger" onClick={() => onDelete(category.id)}><Icon name="trash" className="w-4 h-4"/></Button>
            </div>
        </div>
    );
};

const Categories: React.FC = () => {
    const { categories, addCategory, updateCategory, deleteCategory } = useAppContext();
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryType, setNewCategoryType] = useState<TransactionType>(TransactionType.EXPENSE);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const handleAddCategory = () => {
        if (newCategoryName.trim()) {
            addCategory({ name: newCategoryName, type: newCategoryType });
            setNewCategoryName('');
        }
    };

    const handleOpenEditModal = (category: Category) => {
        setEditingCategory(category);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setEditingCategory(null);
        setIsEditModalOpen(false);
    };

    const handleUpdateCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCategory) {
            updateCategory(editingCategory);
            handleCloseEditModal();
        }
    };
    
    const incomeCategories = categories.filter(c => c.type === TransactionType.INCOME);
    const expenseCategories = categories.filter(c => c.type === TransactionType.EXPENSE);

    return (
        <div className="space-y-8 pb-16 md:pb-0">
            <h1 className="text-3xl font-bold font-display text-gray-900 dark:text-white">Categorias</h1>

            <Card>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Adicionar Nova Categoria</h2>
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-grow">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Nome</label>
                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            className="w-full mt-1 bg-gray-100 dark:bg-dark-tertiary border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-tech-blue focus:outline-none"
                        />
                    </div>
                     <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Tipo</label>
                        <select
                            value={newCategoryType}
                            onChange={(e) => setNewCategoryType(e.target.value as TransactionType)}
                            className="w-full mt-1 bg-gray-100 dark:bg-dark-tertiary border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-tech-blue focus:outline-none"
                        >
                            <option value={TransactionType.EXPENSE}>Despesa</option>
                            <option value={TransactionType.INCOME}>Receita</option>
                        </select>
                    </div>
                    <Button onClick={handleAddCategory}>Adicionar</Button>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Receitas</h2>
                    <div className="space-y-3">
                        {incomeCategories.map(cat => <CategoryItem key={cat.id} category={cat} onEdit={handleOpenEditModal} onDelete={deleteCategory} />)}
                    </div>
                </Card>
                <Card>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Despesas</h2>
                    <div className="space-y-3">
                        {expenseCategories.map(cat => <CategoryItem key={cat.id} category={cat} onEdit={handleOpenEditModal} onDelete={deleteCategory} />)}
                    </div>
                </Card>
            </div>
            
            <Modal isOpen={isEditModalOpen} onClose={handleCloseEditModal} title="Editar Categoria">
               {editingCategory && (
                 <form onSubmit={handleUpdateCategory} className="space-y-4">
                    <Input 
                        label="Nome da Categoria" 
                        value={editingCategory.name} 
                        onChange={(e) => setEditingCategory(prev => prev ? {...prev, name: e.target.value} : null)} 
                    />
                    <Select 
                        label="Tipo" 
                        value={editingCategory.type}
                        onChange={(e) => setEditingCategory(prev => prev ? {...prev, type: e.target.value as TransactionType} : null)}
                    >
                        <option value={TransactionType.EXPENSE}>Despesa</option>
                        <option value={TransactionType.INCOME}>Receita</option>
                    </Select>
                     <div className="flex justify-end gap-4 pt-4">
                        <Button type="button" variant="secondary" onClick={handleCloseEditModal}>Cancelar</Button>
                        <Button type="submit">Salvar</Button>
                    </div>
                 </form>
               )}
            </Modal>
        </div>
    );
};

export default Categories;

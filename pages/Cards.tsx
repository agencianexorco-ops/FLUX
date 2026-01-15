
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { CreditCard } from '../types';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import Modal from '../components/ui/Modal';
import CardForm from '../components/forms/CardForm';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const getCardColor = (bankName: string) => {
    const name = bankName.toLowerCase();
    if (name.includes('nubank')) return 'from-purple-600 to-purple-800';
    if (name.includes('inter')) return 'from-orange-500 to-orange-700';
    if (name.includes('santander')) return 'from-red-600 to-red-800';
    if (name.includes('bradesco')) return 'from-red-700 to-red-900';
    if (name.includes('itaú') || name.includes('itau')) return 'from-orange-400 to-blue-900';
    return 'from-gray-600 to-gray-800';
};

const CreditCardComponent: React.FC<{ card: CreditCard }> = ({ card }) => {
    return (
        <div className={`relative p-6 rounded-2xl text-white shadow-2xl bg-gradient-to-br ${getCardColor(card.bankName)} flex flex-col justify-between h-56`}>
            <div>
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-xl font-display">{card.bankName}</h3>
                    <p className="text-sm opacity-80">Crédito</p>
                </div>
                <div className="mt-4">
                    <p className="text-xs opacity-80">Limite</p>
                    <p className="font-semibold tracking-wider text-2xl">{formatCurrency(card.limit)}</p>
                </div>
            </div>
            
            <div>
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-xs opacity-80">Titular</p>
                        <p className="font-semibold tracking-wider">{card.holderName}</p>
                    </div>
                    <div>
                        <p className="text-xs opacity-80">Vencimento</p>
                        <p className="font-semibold">Dia {card.dueDay}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};


const Cards: React.FC = () => {
    const { cards, addCard, updateCard, deleteCard } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCard, setEditingCard] = useState<CreditCard | null>(null);

    const handleOpenModal = (card: CreditCard | null = null) => {
        setEditingCard(card);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCard(null);
    };

    const handleSaveCard = (cardData: Omit<CreditCard, 'id'> | CreditCard) => {
        if ('id' in cardData) {
            updateCard(cardData);
        } else {
            addCard(cardData);
        }
        handleCloseModal();
    };

    return (
        <div className="space-y-8 pb-16 md:pb-0">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-3xl font-bold font-display text-gray-900 dark:text-white">Meus Cartões</h1>
                <Button onClick={() => handleOpenModal()}>
                    <Icon name="plus" className="w-5 h-5 mr-2" />
                    Adicionar Cartão
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {cards.map(card => (
                    <div key={card.id} className="space-y-3 group">
                        <CreditCardComponent card={card} />
                         <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="sm" variant="secondary" onClick={() => handleOpenModal(card)}>Editar</Button>
                            <Button size="sm" variant="danger" onClick={() => deleteCard(card.id)}>Excluir</Button>
                        </div>
                    </div>
                ))}
                {cards.length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400 col-span-full text-center py-10">Você ainda não adicionou nenhum cartão.</p>
                )}
            </div>

             <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingCard ? 'Editar Cartão' : 'Adicionar Cartão'}>
                <CardForm
                    onSave={handleSaveCard}
                    onClose={handleCloseModal}
                    initialData={editingCard}
                />
            </Modal>
        </div>
    );
};

export default Cards;

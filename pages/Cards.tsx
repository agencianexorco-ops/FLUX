import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { CreditCard, PaymentMethod, TransactionType } from '../types';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import Modal from '../components/ui/Modal';
import CardForm from '../components/forms/CardForm';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const getCardColor = (bankName: string) => {
    // FIX: Add guard to prevent crash if bankName is null or undefined.
    if (!bankName) return 'from-gray-600 to-gray-800';
    const name = bankName.toLowerCase();
    if (name.includes('nubank')) return 'from-purple-600 to-purple-800';
    if (name.includes('inter')) return 'from-orange-500 to-orange-700';
    if (name.includes('santander')) return 'from-red-600 to-red-800';
    if (name.includes('bradesco')) return 'from-red-700 to-red-900';
    if (name.includes('itaú') || name.includes('itau')) return 'from-orange-400 to-blue-900';
    return 'from-gray-600 to-gray-800';
};

const CreditCardComponent: React.FC<{ card: CreditCard, displayLimit: string, displayFatura: string }> = ({ card, displayLimit, displayFatura }) => {
    return (
        <div className={`relative p-6 rounded-2xl text-white shadow-2xl bg-gradient-to-br ${getCardColor(card.bankName)} flex flex-col justify-between h-56`}>
            <div>
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-xl font-display">{card.bankName}</h3>
                    <div className="text-right">
                        <p className="text-xs opacity-80">Fatura Atual</p>
                        <p className="font-semibold tracking-wider text-2xl text-energetic-orange">{displayFatura}</p>
                    </div>
                </div>
                <div className="mt-2">
                    <p className="text-xs opacity-80">Limite Disponível</p>
                    <p className="font-semibold tracking-wider text-lg">{displayLimit}</p>
                </div>
            </div>
            
            <div>
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-xs opacity-80">Fechamento</p>
                        <p className="font-semibold">Dia {card.closingDay}</p>
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
    const { cards, transactions, addCard, updateCard, deleteCard } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
    const [isValueVisible, setIsValueVisible] = useState(true);

    const formatDisplayCurrency = (value: number) => {
        return isValueVisible ? formatCurrency(value) : 'R$ ●●●●,●●';
    };

    const cardsWithFatura = useMemo(() => {
        return cards.map(card => {
            const today = new Date();
            const currentYear = today.getFullYear();
            const currentMonth = today.getMonth();
            const closingDay = card.closingDay;

            let startDate: Date;
            
            if (today.getDate() > closingDay) {
                startDate = new Date(currentYear, currentMonth, closingDay + 1);
            } else {
                startDate = new Date(currentYear, currentMonth - 1, closingDay + 1);
            }
            
            const fatura = transactions
                .filter(t => 
                    t.cardId === card.id &&
                    t.type === TransactionType.EXPENSE &&
                    t.paymentMethod === PaymentMethod.CREDIT &&
                    new Date(t.date + 'T12:00:00') >= startDate
                )
                .reduce((acc, t) => acc + t.amount, 0);

            return { ...card, fatura };
        });
    }, [cards, transactions]);

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
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold font-display text-gray-900 dark:text-white">Meus Cartões</h1>
                    <button
                        onClick={() => setIsValueVisible(!isValueVisible)}
                        className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-tertiary"
                        aria-label={isValueVisible ? "Ocultar valores" : "Mostrar valores"}
                        title={isValueVisible ? "Ocultar valores" : "Mostrar valores"}
                    >
                        <Icon name={isValueVisible ? 'eye' : 'eye-slash'} className="w-6 h-6" />
                    </button>
                </div>
                <Button onClick={() => handleOpenModal()}>
                    <Icon name="plus" className="w-5 h-5 mr-2" />
                    Adicionar Cartão
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {cardsWithFatura.map(card => (
                    <div key={card.id} className="space-y-3 group">
                        <CreditCardComponent 
                            card={card} 
                            displayLimit={formatDisplayCurrency(card.limit - (card.fatura || 0))} 
                            displayFatura={formatDisplayCurrency(card.fatura || 0)}
                        />
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

import React from 'react';
import { useAppContext } from '../context/AppContext';
import Card from '../components/ui/Card';
import Icon from '../components/ui/Icon';
import { Transaction, TransactionStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/80 dark:bg-dark-secondary/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 p-3 rounded-lg shadow-lg">
        {label ? <p className="label text-gray-700 dark:text-gray-300 font-bold">{`${label}`}</p> : null}
        {payload.map((pld: any, index: number) => (
          <p key={index} style={{ color: pld.color }} className="text-gray-800 dark:text-gray-200">
            {`${pld.name}: ${formatCurrency(pld.value)}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const SummaryCard: React.FC<{ title: string; value: string; icon: string; color: string; }> = ({ title, value, icon, color }) => {
    return (
        <Card className={`relative overflow-hidden`}>
            <div className={`absolute top-0 left-0 -mt-8 -ml-8 w-24 h-24 rounded-full opacity-10 ${color}`}></div>
            <div className="relative z-10">
                <div className="flex items-center justify-between">
                    <p className="text-gray-500 dark:text-gray-400 font-medium">{title}</p>
                    <div className={`p-2 rounded-lg ${color}/20`}>
                        <Icon name={icon} className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
                    </div>
                </div>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
        </Card>
    );
};

const Dashboard: React.FC = () => {
  const { transactions, monthlyTransactions, goals, cards, selectedDate } = useAppContext();
  
  const selectedYear = selectedDate.getFullYear();
  const selectedMonth = selectedDate.getMonth();
  
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  // Data for the selected month view, now directly from context
  const realized = monthlyTransactions.filter(t => t.status === TransactionStatus.COMPLETED);
  
  const totalIncome = realized.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
  const totalExpense = realized.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
  const monthlyResult = totalIncome - totalExpense;

  // These calculations still need to look at all transactions across time
  const endOfSelectedMonth = new Date(selectedYear, selectedMonth + 1, 0);
  const closingBalanceOfMonth = transactions
    .filter(t => t.status === TransactionStatus.COMPLETED && new Date(t.date) <= endOfSelectedMonth)
    .reduce((acc, t) => acc + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)), 0);

  const plannedForNextMonth = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getFullYear() === selectedYear && date.getMonth() === selectedMonth + 1 && t.status === TransactionStatus.PLANNED;
  });
  const plannedIncome = plannedForNextMonth.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
  const plannedExpense = plannedForNextMonth.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
  
  const nextMonthOpeningBalance = closingBalanceOfMonth + plannedIncome - plannedExpense;
  
  const recentTransactionsInMonth = monthlyTransactions.slice(0, 5);

  const annualProjectionData = Array.from({ length: 12 }).map((_, i) => {
    const monthTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === i && tDate.getFullYear() === selectedYear && t.status === TransactionStatus.COMPLETED;
    });

    let income = monthTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
    let expense = monthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
    
    return { name: months[i], Receita: income, Despesa: expense };
  });
  
  const categorySpending = realized
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
        return acc;
    }, {} as Record<string, number>);

  const categoryData = Object.entries(categorySpending)
    .map(([name, value]: [string, number]) => ({ name, value }))
    .sort((a,b) => b.value - a.value);

  const COLORS = ['#00BFFF', '#f97316', '#8884d8', '#22c55e', '#ffc658', '#FF8042'];

  return (
    <div className="space-y-8 pb-16 md:pb-0">
        <h1 className="text-3xl font-bold font-display text-gray-900 dark:text-white">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SummaryCard title="Resultado Mensal" value={formatCurrency(monthlyResult)} icon="switch-horizontal" color="bg-tech-blue" />
            <SummaryCard title="Saldo Final do Mês" value={formatCurrency(closingBalanceOfMonth)} icon="chart-pie" color="bg-finance-green" />
            <SummaryCard title="Receita do Mês" value={formatCurrency(totalIncome)} icon="arrow-up" color="bg-finance-green" />
            <SummaryCard title="Despesa do Mês" value={formatCurrency(totalExpense)} icon="arrow-down" color="bg-energetic-orange" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Projeção Anual ({selectedYear})</h2>
                      <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={annualProjectionData}>
                              <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                              <YAxis stroke="#6b7280" fontSize={12} tickFormatter={formatCurrency} />
                              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }}/>
                              <Legend wrapperStyle={{fontSize: "14px"}}/>
                              <Bar dataKey="Receita" fill="#22c55e" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="Despesa" fill="#f97316" radius={[4, 4, 0, 0]} />
                          </BarChart>
                      </ResponsiveContainer>
                  </Card>
                  <Card>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Gastos por Categoria</h2>
                      {categoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    fontSize={12}
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-[300px]">
                          <p className="text-gray-500 dark:text-gray-400 text-center">Nenhuma despesa registrada para {months[selectedMonth]}.</p>
                        </div>
                      )}
                  </Card>
                </div>
            </div>
            {/* Sidebar column */}
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Previsão</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Saldo estimado para o próximo mês.</p>
                    <p className="text-3xl font-bold text-tech-blue">{formatCurrency(nextMonthOpeningBalance)}</p>
                </Card>
                <Card>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Metas em Andamento</h2>
                    <div className="space-y-4">
                        {goals.length > 0 ? goals.slice(0, 3).map(goal => {
                            const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
                            return (
                                <div key={goal.id}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-semibold text-gray-900 dark:text-white">{goal.name}</span>
                                        <span className="text-sm text-gray-700 dark:text-gray-300">{progress.toFixed(0)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-dark-tertiary rounded-full h-2.5">
                                        <div className="bg-gradient-to-r from-tech-blue to-finance-green h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                    </div>
                                </div>
                            )
                        }) : <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhuma meta definida.</p>}
                    </div>
                </Card>
                 <Card>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Cartões de Crédito</h2>
                    <div className="space-y-3">
                        {cards.length > 0 ? cards.slice(0, 3).map(card => (
                            <div key={card.id} className="bg-gray-100 dark:bg-dark-tertiary p-3 rounded-lg">
                                <p className="font-semibold text-gray-900 dark:text-white">{card.bankName}</p>
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    <span>Limite: {formatCurrency(card.limit)}</span>
                                    <span>Venc.: dia {card.dueDay}</span>
                                </div>
                            </div>
                        )) : <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhum cartão adicionado.</p>}
                    </div>
                </Card>
            </div>
        </div>
        <Card>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Lançamentos Recentes do Mês</h2>
            <div className="space-y-4">
                {recentTransactionsInMonth.length > 0 ? recentTransactionsInMonth.map(t => (
                     <div key={t.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className={`w-2 h-8 rounded-full mr-3 ${t.type === 'income' ? 'bg-finance-green' : 'bg-energetic-orange'}`}></div>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">{t.description}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(t.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                            </div>
                        </div>
                        <p className={`font-semibold text-lg ${t.type === 'income' ? 'text-finance-green' : 'text-energetic-orange'}`}>
                            {t.type === 'expense' ? '-' : ''}{formatCurrency(t.amount)}
                        </p>
                    </div>
                )) : <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">Nenhum lançamento recente neste mês.</p>}
            </div>
        </Card>
    </div>
  );
};

export default Dashboard;

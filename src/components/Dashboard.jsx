import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Target, Activity } from 'lucide-react';

function Dashboard() {
  const { currentUser } = useAuth();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'trades'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tradesData = [];
      querySnapshot.forEach((doc) => {
        tradesData.push({ id: doc.id, ...doc.data() });
      });
      setTrades(tradesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const calculateStats = () => {
    const activeTrades = trades.filter(trade => trade.status === 'active');
    const closedTrades = trades.filter(trade => trade.status === 'closed');
    
    const totalProfit = closedTrades.reduce((sum, trade) => sum + (trade.finalPnL || 0), 0);
    const winningTrades = closedTrades.filter(trade => (trade.finalPnL || 0) > 0);
    const losingTrades = closedTrades.filter(trade => (trade.finalPnL || 0) < 0);
    
    const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;
    const avgWin = winningTrades.length > 0 ? winningTrades.reduce((sum, trade) => sum + trade.finalPnL, 0) / winningTrades.length : 0;
    const avgLoss = losingTrades.length > 0 ? Math.abs(losingTrades.reduce((sum, trade) => sum + trade.finalPnL, 0) / losingTrades.length) : 0;

    return {
      totalTrades: trades.length,
      activeTrades: activeTrades.length,
      closedTrades: closedTrades.length,
      totalProfit,
      winRate,
      avgWin,
      avgLoss,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length
    };
  };

  const stats = calculateStats();

  const pieData = [
    { name: 'Winning Trades', value: stats.winningTrades, color: '#10b981' },
    { name: 'Losing Trades', value: stats.losingTrades, color: '#ef4444' }
  ];

  const monthlyData = trades
    .filter(trade => trade.status === 'closed' && trade.closedAt)
    .reduce((acc, trade) => {
      const month = new Date(trade.closedAt.toDate()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const existing = acc.find(item => item.month === month);
      if (existing) {
        existing.profit += trade.finalPnL || 0;
      } else {
        acc.push({ month, profit: trade.finalPnL || 0 });
      }
      return acc;
    }, [])
    .slice(-6); // Last 6 months

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
          Trading Dashboard
        </h1>
        <p className="text-text-secondary text-lg">Professional trade tracking and performance analytics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className={`card-stat group ${stats.totalProfit >= 0 ? 'card-stat-profit' : 'card-stat-loss'}`}>
          <div>
            <p className="text-text-secondary text-sm font-medium uppercase tracking-wider">Total P&L</p>
            <p className={`text-3xl font-bold mt-2 ${stats.totalProfit >= 0 ? 'text-primary-green' : 'text-accent-red'}`}>
              ${stats.totalProfit.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="card-stat group card-stat-blue">
          <div>
            <p className="text-text-secondary text-sm font-medium uppercase tracking-wider">Win Rate</p>
            <p className="text-3xl font-bold text-midpoint-blue mt-2">{stats.winRate.toFixed(1)}%</p>
          </div>
        </div>

        <div className={`card-stat group ${stats.activeTrades > 0 ? 'card-stat-profit' : 'card-stat-cyan'}`}>
          <div>
            <p className="text-text-secondary text-sm font-medium uppercase tracking-wider">Active Trades</p>
            <p className={`text-3xl font-bold mt-2 ${stats.activeTrades > 0 ? 'text-primary-green' : 'text-muted-cyan'}`}>{stats.activeTrades}</p>
          </div>
        </div>

        <div className="card-stat group card-stat-purple">
          <div>
            <p className="text-text-secondary text-sm font-medium uppercase tracking-wider">Total Trades</p>
            <p className="text-3xl font-bold text-primary-purple mt-2">{stats.totalTrades}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Win/Loss Pie Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Win/Loss Distribution</h3>
          {stats.closedTrades > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-text-secondary">
              No closed trades yet
            </div>
          )}
        </div>

        {/* Monthly Performance */}
        <div className="card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Monthly Performance</h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" tick={{ fill: '#9ca3af' }} />
                <YAxis tick={{ fill: '#9ca3af' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1b1e', 
                    border: '1px solid #2a2d31',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="profit" 
                  fill={(entry) => entry.profit >= 0 ? '#10b981' : '#ef4444'}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-text-secondary">
              No monthly data available
            </div>
          )}
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Performance Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-text-secondary">Average Win:</span>
              <span className="text-accent-green font-medium">${stats.avgWin.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Average Loss:</span>
              <span className="text-accent-red font-medium">-${stats.avgLoss.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Profit Factor:</span>
              <span className="text-text-primary font-medium">
                {stats.avgLoss > 0 ? (stats.avgWin / stats.avgLoss).toFixed(2) : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Trade Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-text-secondary">Winning Trades:</span>
              <span className="text-accent-green font-medium">{stats.winningTrades}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Losing Trades:</span>
              <span className="text-accent-red font-medium">{stats.losingTrades}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Closed Trades:</span>
              <span className="text-text-primary font-medium">{stats.closedTrades}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

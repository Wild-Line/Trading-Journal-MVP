import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { TrendingUp, TrendingDown, Calendar, DollarSign, Target, Filter } from 'lucide-react';

function TradeHistory() {
  const { currentUser } = useAuth();
  const [trades, setTrades] = useState([]);
  const [filteredTrades, setFilteredTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, winning, losing
  const [sortBy, setSortBy] = useState('date'); // date, pnl, ticker

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'trades'),
      where('userId', '==', currentUser.uid),
      where('status', '==', 'closed'),
      orderBy('closedAt', 'desc')
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

  useEffect(() => {
    let filtered = [...trades];

    // Apply filter
    if (filter === 'winning') {
      filtered = filtered.filter(trade => (trade.finalPnL || 0) > 0);
    } else if (filter === 'losing') {
      filtered = filtered.filter(trade => (trade.finalPnL || 0) < 0);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'pnl':
          return (b.finalPnL || 0) - (a.finalPnL || 0);
        case 'ticker':
          return a.ticker.localeCompare(b.ticker);
        case 'date':
        default:
          return b.closedAt?.toDate() - a.closedAt?.toDate();
      }
    });

    setFilteredTrades(filtered);
  }, [trades, filter, sortBy]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return timestamp.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateStats = () => {
    const totalTrades = trades.length;
    const winningTrades = trades.filter(trade => (trade.finalPnL || 0) > 0);
    const losingTrades = trades.filter(trade => (trade.finalPnL || 0) < 0);
    const totalPnL = trades.reduce((sum, trade) => sum + (trade.finalPnL || 0), 0);
    const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;

    return {
      totalTrades,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      totalPnL,
      winRate
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Trade History</h1>
        <p className="text-text-secondary mt-2">Review your closed positions and performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Total P&L</p>
              <p className={`text-xl font-bold ${stats.totalPnL >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                {formatCurrency(stats.totalPnL)}
              </p>
            </div>
            <DollarSign className={`h-6 w-6 ${stats.totalPnL >= 0 ? 'text-accent-green' : 'text-accent-red'}`} />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Win Rate</p>
              <p className="text-xl font-bold text-text-primary">{stats.winRate.toFixed(1)}%</p>
            </div>
            <Target className="h-6 w-6 text-accent-blue" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Winning Trades</p>
              <p className="text-xl font-bold text-accent-green">{stats.winningTrades}</p>
            </div>
            <TrendingUp className="h-6 w-6 text-accent-green" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Losing Trades</p>
              <p className="text-xl font-bold text-accent-red">{stats.losingTrades}</p>
            </div>
            <TrendingDown className="h-6 w-6 text-accent-red" />
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-text-secondary" />
            <select
              className="input-field text-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Trades</option>
              <option value="winning">Winning Only</option>
              <option value="losing">Losing Only</option>
            </select>
          </div>

          <select
            className="input-field text-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date">Sort by Date</option>
            <option value="pnl">Sort by P&L</option>
            <option value="ticker">Sort by Ticker</option>
          </select>
        </div>

        <p className="text-text-secondary text-sm">
          Showing {filteredTrades.length} of {trades.length} trades
        </p>
      </div>

      {trades.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-text-secondary mx-auto mb-4" />
          <h3 className="text-xl font-medium text-text-primary mb-2">No Trade History</h3>
          <p className="text-text-secondary">Your closed trades will appear here once you start trading.</p>
        </div>
      ) : filteredTrades.length === 0 ? (
        <div className="text-center py-12">
          <Filter className="h-16 w-16 text-text-secondary mx-auto mb-4" />
          <h3 className="text-xl font-medium text-text-primary mb-2">No Trades Match Filter</h3>
          <p className="text-text-secondary">Try adjusting your filter criteria.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-border">
                  <th className="text-left py-3 px-4 text-text-secondary font-medium">Ticker</th>
                  <th className="text-left py-3 px-4 text-text-secondary font-medium">Direction</th>
                  <th className="text-left py-3 px-4 text-text-secondary font-medium">Entry</th>
                  <th className="text-left py-3 px-4 text-text-secondary font-medium">Exit</th>
                  <th className="text-left py-3 px-4 text-text-secondary font-medium">Quantity</th>
                  <th className="text-left py-3 px-4 text-text-secondary font-medium">P&L</th>
                  <th className="text-left py-3 px-4 text-text-secondary font-medium">R:R</th>
                  <th className="text-left py-3 px-4 text-text-secondary font-medium">Date Closed</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrades.map((trade) => (
                  <tr key={trade.id} className="table-row">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-text-primary">{trade.ticker}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {trade.direction === 'long' ? (
                          <TrendingUp className="h-4 w-4 text-accent-green" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-accent-red" />
                        )}
                        <span className="text-text-primary capitalize">{trade.direction}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-text-primary">
                      {formatCurrency(trade.averageEntry)}
                    </td>
                    <td className="py-3 px-4 text-text-primary">
                      {trade.exitPrice ? formatCurrency(trade.exitPrice) : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-text-primary">
                      {trade.quantity || 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${
                        (trade.finalPnL || 0) >= 0 ? 'text-accent-green' : 'text-accent-red'
                      }`}>
                        {formatCurrency(trade.finalPnL || 0)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-text-primary">
                      {trade.riskReward !== 'N/A' ? `${trade.riskReward}:1` : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-text-secondary">
                      {formatDate(trade.closedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Trade Details */}
      {filteredTrades.length > 0 && (
        <div className="mt-8 grid gap-6">
          {filteredTrades.slice(0, 3).map((trade) => (
            <div key={`detail-${trade.id}`} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    trade.direction === 'long' ? 'bg-green-900/20 text-accent-green' : 'bg-red-900/20 text-accent-red'
                  }`}>
                    {trade.direction === 'long' ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">{trade.ticker}</h3>
                    <p className="text-text-secondary text-sm">
                      Closed on {formatDate(trade.closedAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${
                    (trade.finalPnL || 0) >= 0 ? 'text-accent-green' : 'text-accent-red'
                  }`}>
                    {formatCurrency(trade.finalPnL || 0)}
                  </p>
                  <p className="text-text-secondary text-sm">
                    {((trade.finalPnL || 0) / (trade.averageEntry * (trade.quantity || 1)) * 100).toFixed(2)}% return
                  </p>
                </div>
              </div>

              {trade.notes && (
                <div className="mb-4">
                  <p className="text-text-secondary text-sm mb-1">Notes</p>
                  <p className="text-text-primary text-sm bg-dark-bg p-3 rounded-lg">{trade.notes}</p>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-text-secondary">Entry Price</p>
                  <p className="text-text-primary font-medium">{formatCurrency(trade.averageEntry)}</p>
                </div>
                <div>
                  <p className="text-text-secondary">Exit Price</p>
                  <p className="text-text-primary font-medium">{formatCurrency(trade.exitPrice)}</p>
                </div>
                <div>
                  <p className="text-text-secondary">Quantity</p>
                  <p className="text-text-primary font-medium">{trade.quantity || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-text-secondary">Risk/Reward</p>
                  <p className="text-text-primary font-medium">
                    {trade.riskReward !== 'N/A' ? `${trade.riskReward}:1` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TradeHistory;

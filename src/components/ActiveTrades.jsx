import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import TradeForm from './TradeForm';
import { Plus, Edit, TrendingUp, TrendingDown, Target, DollarSign, X } from 'lucide-react';

function ActiveTrades() {
  const { currentUser } = useAuth();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTrade, setEditingTrade] = useState(null);
  const [closingTrade, setClosingTrade] = useState(null);
  const [exitPrice, setExitPrice] = useState('');

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'trades'),
      where('userId', '==', currentUser.uid),
      where('status', '==', 'active')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tradesData = [];
      querySnapshot.forEach((doc) => {
        tradesData.push({ id: doc.id, ...doc.data() });
      });
      setTrades(tradesData.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate()));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleCloseTrade = async () => {
    if (!closingTrade || !exitPrice) return;

    try {
      const exit = parseFloat(exitPrice);
      const avgEntry = closingTrade.averageEntry;
      const quantity = closingTrade.quantity || 1;
      
      let finalPnL;
      if (closingTrade.direction === 'long') {
        finalPnL = (exit - avgEntry) * quantity;
      } else {
        finalPnL = (avgEntry - exit) * quantity;
      }

      await updateDoc(doc(db, 'trades', closingTrade.id), {
        status: 'closed',
        exitPrice: exit,
        finalPnL: finalPnL,
        closedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setClosingTrade(null);
      setExitPrice('');
    } catch (error) {
      console.error('Error closing trade:', error);
      alert('Failed to close trade. Please try again.');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const calculateUnrealizedPnL = (trade, currentPrice = null) => {
    if (!currentPrice) return 0;
    const quantity = trade.quantity || 1;
    
    if (trade.direction === 'long') {
      return (currentPrice - trade.averageEntry) * quantity;
    } else {
      return (trade.averageEntry - currentPrice) * quantity;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Active Trades</h1>
          <p className="text-text-secondary mt-2">Manage your open positions</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Trade</span>
        </button>
      </div>

      {trades.length === 0 ? (
        <div className="text-center py-12">
          <TrendingUp className="h-16 w-16 text-text-secondary mx-auto mb-4" />
          <h3 className="text-xl font-medium text-text-primary mb-2">No Active Trades</h3>
          <p className="text-text-secondary mb-6">Start by adding your first trade to track your performance.</p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            Add Your First Trade
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {trades.map((trade) => (
            <div key={trade.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    trade.direction === 'long' ? 'bg-green-900/20 text-accent-green' : 'bg-red-900/20 text-accent-red'
                  }`}>
                    {trade.direction === 'long' ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-text-primary">{trade.ticker}</h3>
                    <p className="text-text-secondary capitalize">{trade.direction} Position</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingTrade(trade)}
                    className="p-2 text-text-secondary hover:text-text-primary hover:bg-dark-bg rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setClosingTrade(trade)}
                    className="btn-danger text-sm"
                  >
                    Close Trade
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-text-secondary text-sm">Average Entry</p>
                  <p className="text-text-primary font-semibold">{formatCurrency(trade.averageEntry)}</p>
                </div>
                <div>
                  <p className="text-text-secondary text-sm">Quantity</p>
                  <p className="text-text-primary font-semibold">{trade.quantity || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-text-secondary text-sm">Stop Loss</p>
                  <p className="text-text-primary font-semibold">
                    {trade.stopLoss ? formatCurrency(trade.stopLoss) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-text-secondary text-sm">Risk/Reward</p>
                  <p className="text-text-primary font-semibold">
                    {trade.riskReward !== 'N/A' ? `${trade.riskReward}:1` : 'N/A'}
                  </p>
                </div>
              </div>

              {trade.takeProfits && trade.takeProfits.length > 0 && (
                <div className="mb-4">
                  <p className="text-text-secondary text-sm mb-2">Take Profit Targets</p>
                  <div className="flex flex-wrap gap-2">
                    {trade.takeProfits.map((tp, index) => (
                      <span key={index} className="px-3 py-1 bg-green-900/20 text-accent-green rounded-full text-sm">
                        TP{index + 1}: {formatCurrency(tp)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {trade.notes && (
                <div className="mb-4">
                  <p className="text-text-secondary text-sm mb-1">Notes</p>
                  <p className="text-text-primary text-sm bg-dark-bg p-3 rounded-lg">{trade.notes}</p>
                </div>
              )}

              <div className="text-xs text-text-secondary">
                Added: {trade.createdAt?.toDate().toLocaleDateString()} at {trade.createdAt?.toDate().toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Trade Form Modal */}
      {(showForm || editingTrade) && (
        <TradeForm
          trade={editingTrade}
          onClose={() => {
            setShowForm(false);
            setEditingTrade(null);
          }}
          onSave={() => {
            setShowForm(false);
            setEditingTrade(null);
          }}
        />
      )}

      {/* Close Trade Modal */}
      {closingTrade && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-dark-surface rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-dark-border">
              <h2 className="text-xl font-semibold text-text-primary">Close Trade</h2>
              <button
                onClick={() => {
                  setClosingTrade(null);
                  setExitPrice('');
                }}
                className="text-text-secondary hover:text-text-primary"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-text-secondary text-sm">Closing position for:</p>
                <p className="text-text-primary font-semibold text-lg">{closingTrade.ticker}</p>
                <p className="text-text-secondary text-sm capitalize">{closingTrade.direction} • Entry: {formatCurrency(closingTrade.averageEntry)}</p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Exit Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="input-field w-full"
                  placeholder="Enter exit price"
                  value={exitPrice}
                  onChange={(e) => setExitPrice(e.target.value)}
                />
                {exitPrice && (
                  <p className="text-sm text-text-secondary mt-2">
                    Estimated P&L: {
                      (() => {
                        const exit = parseFloat(exitPrice);
                        const quantity = closingTrade.quantity || 1;
                        let pnl;
                        if (closingTrade.direction === 'long') {
                          pnl = (exit - closingTrade.averageEntry) * quantity;
                        } else {
                          pnl = (closingTrade.averageEntry - exit) * quantity;
                        }
                        return (
                          <span className={pnl >= 0 ? 'text-accent-green' : 'text-accent-red'}>
                            {formatCurrency(pnl)}
                          </span>
                        );
                      })()
                    }
                  </p>
                )}
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={handleCloseTrade}
                  disabled={!exitPrice}
                  className="btn-danger flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Close Trade
                </button>
                <button
                  onClick={() => {
                    setClosingTrade(null);
                    setExitPrice('');
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ActiveTrades;

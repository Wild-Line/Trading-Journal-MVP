import React, { useState } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { X, Plus, Minus } from 'lucide-react';

function TradeForm({ trade, onClose, onSave }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  // Format date to YYYY-MM-DD for the date input
  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Initialize form data with trade data or defaults
  const [formData, setFormData] = useState(() => {
    const defaultDate = formatDate(new Date());
    return {
      ticker: trade?.ticker || '',
      direction: trade?.direction || 'long',
      timeFrame: trade?.timeFrame || '1h',
      entryPrices: trade?.entryPrices || [''],
      stopLoss: trade?.stopLoss || '',
      takeProfits: trade?.takeProfits || [''],
      notes: trade?.notes || '',
      cost: trade?.cost || '',
      leverage: trade?.leverage || '1:1',
      tradeDate: trade?.tradeDate ? formatDate(trade.tradeDate.toDate()) : defaultDate,
      indicators: trade?.indicators || {
        supportResistance: false,
        fib: false,
        movingAverage: false,
        trendline: false,
        stochRsi: false,
        volume: false,
        fvg: false
      },
      ...trade
    };
  });

  // Get day of the week from date
  const getDayOfWeek = (dateString) => {
    try {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return '';
      }
      return days[date.getDay()];
    } catch (error) {
      console.error('Error getting day of week:', error);
      return '';
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleIndicatorChange = (indicator) => {
    setFormData(prev => ({
      ...prev,
      indicators: {
        ...prev.indicators,
        [indicator]: !prev.indicators[indicator]
      }
    }));
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayField = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayField = (field, index) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  const calculateAverageEntry = () => {
    const validPrices = formData.entryPrices.filter(price => price && !isNaN(parseFloat(price)));
    if (validPrices.length === 0) return 0;
    return validPrices.reduce((sum, price) => sum + parseFloat(price), 0) / validPrices.length;
  };

  const calculateTradeValue = () => {
    const cost = parseFloat(formData.cost);
    if (!cost || !formData.leverage) return 0;
    
    const leverageRatio = formData.leverage.split(':');
    if (leverageRatio.length !== 2) return cost;
    
    const multiplier = parseFloat(leverageRatio[1]) / parseFloat(leverageRatio[0]);
    return cost * multiplier;
  };

  const calculateRiskReward = () => {
    const avgEntry = calculateAverageEntry();
    const stopLoss = parseFloat(formData.stopLoss);
    const firstTP = parseFloat(formData.takeProfits[0]);

    if (!avgEntry || !stopLoss || !firstTP) return 'N/A';

    const risk = Math.abs(avgEntry - stopLoss);
    const reward = Math.abs(firstTP - avgEntry);

    if (risk === 0) return 'N/A';
    return (reward / risk).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const avgEntry = calculateAverageEntry();
      const tradeData = {
        ...formData,
        userId: currentUser.uid,
        averageEntry: avgEntry,
        riskReward: calculateRiskReward(),
        entryPrices: formData.entryPrices.filter(price => price && !isNaN(parseFloat(price))).map(price => parseFloat(price)),
        takeProfits: formData.takeProfits.filter(price => price && !isNaN(parseFloat(price))).map(price => parseFloat(price)),
        stopLoss: parseFloat(formData.stopLoss) || null,
        cost: parseFloat(formData.cost) || null,
        leverage: formData.leverage,
        tradeValue: calculateTradeValue(),
        status: 'active',
        updatedAt: serverTimestamp()
      };

      if (trade?.id) {
        // Update existing trade
        await updateDoc(doc(db, 'trades', trade.id), tradeData);
      } else {
        // Create new trade
        tradeData.createdAt = serverTimestamp();
        await addDoc(collection(db, 'trades'), tradeData);
      }

      onSave?.();
      onClose();
    } catch (error) {
      console.error('Error saving trade:', error);
      alert('Failed to save trade. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-dark-surface rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-dark-border">
          <h2 className="text-xl font-semibold text-text-primary">
            {trade ? 'Edit Trade' : 'Add New Trade'}
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Trade Date */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-primary mb-2">
              Trade Date
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="date"
                className="input-field"
                value={formData.tradeDate}
                onChange={(e) => handleInputChange('tradeDate', e.target.value)}
              />
              <div className="text-text-primary font-medium">
                {formData.tradeDate ? getDayOfWeek(formData.tradeDate) : ''}
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Ticker Symbol *
              </label>
              <input
                type="text"
                required
                className="input-field w-full"
                placeholder="e.g., AAPL"
                value={formData.ticker}
                onChange={(e) => handleInputChange('ticker', e.target.value.toUpperCase())}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Direction *
              </label>
              <select
                className="input-field w-full"
                value={formData.direction}
                onChange={(e) => handleInputChange('direction', e.target.value)}
              >
                <option value="long">Long</option>
                <option value="short">Short</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Time Frame *
              </label>
              <select
                className="input-field w-full"
                value={formData.timeFrame}
                onChange={(e) => handleInputChange('timeFrame', e.target.value)}
              >
                <option value="5m">5 min</option>
                <option value="15m">15 min</option>
                <option value="30m">30 min</option>
                <option value="1h">1 hour</option>
                <option value="4h">4 hours</option>
                <option value="1d">Daily</option>
              </select>
            </div>
          </div>

          {/* Cost, Value and Leverage */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Cost */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Cost *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="input-field w-full pl-8"
                  placeholder="20.00"
                  value={formData.cost}
                  onChange={(e) => handleInputChange('cost', e.target.value)}
                />
              </div>
            </div>

            {/* Value */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Value
              </label>
              <div className="flex items-center h-10 px-3 bg-dark-border/30 rounded-md text-text-primary">
                ${formData.cost ? calculateTradeValue().toFixed(2) : '0.00'}
              </div>
              <div className="text-xs text-text-secondary mt-1">
                Cost × {formData.leverage} leverage
              </div>
            </div>
            
            {/* Leverage */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Leverage
              </label>
              <select
                className="input-field w-full"
                value={formData.leverage}
                onChange={(e) => handleInputChange('leverage', e.target.value)}
              >
                <option value="1:1">1:1 (No Leverage)</option>
                <option value="1:2">1:2</option>
                <option value="1:3">1:3</option>
                <option value="1:5">1:5</option>
                <option value="1:8">1:8</option>
                <option value="1:10">1:10</option>
                <option value="1:20">1:20</option>
                <option value="1:50">1:50</option>
                <option value="1:100">1:100</option>
              </select>
            </div>
          </div>

          {/* Entry Prices */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-text-primary">
                Entry Prices *
              </label>
              <button
                type="button"
                onClick={() => addArrayField('entryPrices')}
                className="text-accent-blue hover:text-blue-400 text-sm flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Entry
              </button>
            </div>
            {formData.entryPrices.map((price, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="number"
                  step="0.01"
                  required={index === 0}
                  className="input-field flex-1"
                  placeholder={`Entry price ${index + 1}`}
                  value={price}
                  onChange={(e) => handleArrayChange('entryPrices', index, e.target.value)}
                />
                {formData.entryPrices.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayField('entryPrices', index)}
                    className="text-accent-red hover:text-red-400"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            {formData.entryPrices.some(price => price && !isNaN(parseFloat(price))) && (
              <p className="text-sm text-text-secondary mt-1">
                Average Entry: ${calculateAverageEntry().toFixed(2)}
              </p>
            )}
          </div>

          {/* Stop Loss and Take Profits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stop Loss */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Stop Loss
              </label>
              <input
                type="number"
                step="0.01"
                className="input-field w-full"
                placeholder="Stop loss price"
                value={formData.stopLoss}
                onChange={(e) => handleInputChange('stopLoss', e.target.value)}
              />
            </div>

            {/* Take Profits */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-text-primary">
                  Take Profit Targets
                </label>
                <button
                  type="button"
                  onClick={() => addArrayField('takeProfits')}
                  className="text-accent-blue hover:text-blue-400 text-sm flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Target
                </button>
              </div>
              {formData.takeProfits.map((price, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="number"
                    step="0.01"
                    className="input-field flex-1"
                    placeholder={`Take profit ${index + 1}`}
                    value={price}
                    onChange={(e) => handleArrayChange('takeProfits', index, e.target.value)}
                  />
                  {formData.takeProfits.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayField('takeProfits', index)}
                      className="text-accent-red hover:text-red-400"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              {calculateRiskReward() !== 'N/A' && (
                <p className="text-sm text-text-secondary mt-1">
                  Risk/Reward Ratio: {calculateRiskReward()}:1
                </p>
              )}
            </div>
          </div>

          {/* Indicators */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-primary mb-3">
              Indicators Used
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {[
                { id: 'supportResistance', label: 'Support/Resistance' },
                { id: 'fib', label: 'Fib' },
                { id: 'movingAverage', label: 'MA' },
                { id: 'trendline', label: 'Trendline' },
                { id: 'stochRsi', label: 'Stoch RSI' },
                { id: 'volume', label: 'Volume' },
                { id: 'fvg', label: 'FVG' }
              ].map((indicator) => (
                <label key={indicator.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.indicators?.[indicator.id] || false}
                    onChange={() => handleIndicatorChange(indicator.id)}
                    className="h-4 w-4 text-accent-blue rounded border-gray-300 focus:ring-accent-blue"
                  />
                  <span className="text-sm text-text-primary">{indicator.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Notes
            </label>
            <textarea
              className="input-field w-full h-24 resize-none"
              placeholder="Trade notes, strategy, observations..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : (trade ? 'Update Trade' : 'Add Trade')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TradeForm;

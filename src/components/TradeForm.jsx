import React, { useState } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { X, Plus, Minus } from 'lucide-react';

function TradeForm({ trade, onClose, onSave }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ticker: trade?.ticker || '',
    direction: trade?.direction || 'long',
    entryPrices: trade?.entryPrices || [''],
    stopLoss: trade?.stopLoss || '',
    takeProfits: trade?.takeProfits || [''],
    notes: trade?.notes || '',
    quantity: trade?.quantity || '',
    ...trade
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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
        quantity: parseFloat(formData.quantity) || null,
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
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Quantity
            </label>
            <input
              type="number"
              step="0.01"
              className="input-field w-full"
              placeholder="Number of shares/contracts"
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', e.target.value)}
            />
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

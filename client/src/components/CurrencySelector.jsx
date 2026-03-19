import { useState } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import './CurrencySelector.css';

const CurrencySelector = () => {
  const { currency, setCurrency, currencies } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);

  const currencyInfo = {
    GBP: {
      name: 'British Pound',
      symbol: '£',
      icon: '🇬🇧',
      flag: '£'
    },
    USD: {
      name: 'US Dollar',
      symbol: '$',
      icon: '🇺🇸',
      flag: '$'
    },
    EUR: {
      name: 'Euro',
      symbol: '€',
      icon: '🇪🇺',
      flag: '€'
    },
    JPY: {
      name: 'Japanese Yen',
      symbol: '¥',
      icon: '🇯🇵',
      flag: '¥'
    }
  };

  const currentCurrency = currencyInfo[currency] || currencyInfo.GBP;

  const handleCurrencyChange = (newCurrency) => {
    setCurrency(newCurrency);
    setIsOpen(false);
  };

  return (
    <div className="currency-selector">
      <button 
        className="currency-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select currency"
      >
        <span className="currency-icon">{currentCurrency.icon}</span>
        <span className="currency-symbol">{currentCurrency.symbol}</span>
        <span className="currency-code">{currency}</span>
        <svg 
          className={`dropdown-arrow ${isOpen ? 'open' : ''}`} 
          width="12" 
          height="12" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className="currency-dropdown">
          <div className="dropdown-header">
            <span>Select Currency</span>
          </div>
          <div className="currency-list">
            {currencies.map((curr) => {
              const info = currencyInfo[curr];
              return (
                <button
                  key={curr}
                  className={`currency-option ${curr === currency ? 'active' : ''}`}
                  onClick={() => handleCurrencyChange(curr)}
                >
                  <span className="currency-flag">{info.icon}</span>
                  <div className="currency-details">
                    <span className="currency-name">{info.name}</span>
                    <span className="currency-symbol-large">{info.symbol}</span>
                  </div>
                  {curr === currency && (
                    <svg className="checkmark" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
          <div className="dropdown-footer">
            <small>Prices will be updated automatically</small>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="currency-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default CurrencySelector;

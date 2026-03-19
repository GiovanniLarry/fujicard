import { createContext, useContext, useState, useEffect } from 'react';
import { currencyAPI } from '../services/api';

const CurrencyContext = createContext();

export const useCurrency = () => useContext(CurrencyContext);

const currencySymbols = {
  GBP: '£',
  USD: '$',
  EUR: '€',
  JPY: '¥'
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'GBP');
  const [rates, setRates] = useState({ GBP: 1, USD: 1.27, EUR: 1.17, JPY: 190.5 });
  const [currencies, setCurrencies] = useState(['GBP', 'USD', 'EUR', 'JPY']);

  useEffect(() => {
    fetchRates();
  }, []);

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  const fetchRates = async () => {
    try {
      const response = await currencyAPI.getRates();
      setRates(response.data.rates);
      setCurrencies(response.data.currencies);
    } catch (error) {
      console.error('Failed to fetch currency rates:', error);
    }
  };

  const convertPrice = (priceInGBP) => {
    const converted = priceInGBP * rates[currency];
    return converted.toFixed(2);
  };

  const formatPrice = (priceInGBP) => {
    const converted = convertPrice(priceInGBP);
    return `${currencySymbols[currency]}${converted}`;
  };

  const getSymbol = () => currencySymbols[currency];

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      currencies,
      rates,
      convertPrice,
      formatPrice,
      getSymbol
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

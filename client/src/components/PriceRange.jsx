import { useState, useEffect, useRef } from 'react';
import './PriceRange.css';

const PriceRange = ({ onFilterChange, maxPrice = 1000000 }) => {
  const [minPrice, setMinPrice] = useState(0);
  const [maxPriceLocal, setMaxPriceLocal] = useState(maxPrice);
  const timeoutRef = useRef(null);

  const handleMinChange = (e) => {
    const value = Math.min(Number(e.target.value), maxPriceLocal - 100);
    setMinPrice(value);
  };

  const handleMaxChange = (e) => {
    const value = Math.max(Number(e.target.value), minPrice + 100);
    setMaxPriceLocal(value);
  };

  // Debounced filter update - only triggers after user stops changing for 500ms
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onFilterChange({ min: minPrice, max: maxPriceLocal });
    }, 500); // Wait 500ms after last change

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [minPrice, maxPriceLocal]);

  const handleReset = () => {
    setMinPrice(0);
    setMaxPriceLocal(maxPrice);
    onFilterChange({ min: 0, max: maxPrice });
  };

  return (
    <div className="price-range-container">
      <h3 className="price-range-title">Price Range</h3>
      
      <div className="price-inputs">
        <div className="input-group">
          <label>Min</label>
          <input
            type="number"
            value={minPrice}
            onChange={handleMinChange}
            min="0"
            max={maxPriceLocal - 100}
            step="100"
          />
        </div>
        
        <span className="separator">-</span>
        
        <div className="input-group">
          <label>Max</label>
          <input
            type="number"
            value={maxPriceLocal}
            onChange={handleMaxChange}
            min={minPrice + 100}
            max={maxPrice}
            step="100"
          />
        </div>
      </div>

      <div className="price-slider">
        <input
          type="range"
          min="0"
          max={maxPrice}
          value={minPrice}
          onChange={handleMinChange}
          className="slider-min"
          step="100"
        />
        <input
          type="range"
          min="0"
          max={maxPrice}
          value={maxPriceLocal}
          onChange={handleMaxChange}
          className="slider-max"
          step="100"
        />
      </div>

      <div className="price-display">
        <span>${minPrice.toLocaleString()}</span>
        <span>-</span>
        <span>${maxPriceLocal >= maxPrice ? `${maxPrice/1000}k+` : maxPriceLocal.toLocaleString()}</span>
      </div>

      <button className="reset-btn" onClick={handleReset}>
        Reset Filter
      </button>
    </div>
  );
};

export default PriceRange;

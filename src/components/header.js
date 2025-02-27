import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCryptoState } from '../cryptocontext';

const Header = memo(() => {
  const navigate = useNavigate();
  const { currency, setCurrency } = useCryptoState(); 

  const handleCurrencyChange = (e) => {
    if (currency !== e.target.value) {
      setCurrency(e.target.value);
    }
  };

  return (
    <header className="bg-gray-900 text-white py-4 px-6 flex justify-between items-center">
      <h1 
        className="text-2xl font-bold text-gold cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => navigate('/Homepage')}
      >
        InvestSmart
      </h1>

      <select
        value={currency}
        onChange={handleCurrencyChange}
        className="bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-2 focus:outline-none"
      >
        <option value="USD">USD</option>
        <option value="INR">INR</option>
      </select>
    </header>
  );
});

export default Header;

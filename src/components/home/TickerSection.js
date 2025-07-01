import React from 'react';
import { ProductTicker, ProductTickerReverse } from './showCase';

function TickerSection() {
  return (
    <div>
      <ProductTicker />
      <div className="py-2">
        <ProductTickerReverse />
      </div>
      <div className="py-2">
        <ProductTicker />
      </div>
    </div>
  );
}

export default TickerSection;

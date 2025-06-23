import React from 'react';
import { motion } from 'motion/react';

const products = [
  { id: 1, icon: '🍎', name: 'Elma', description: 'Taze ve lezzetli elma' },
  { id: 2, icon: '🍌', name: 'Muz', description: 'Sarı muzlar burada' },
  { id: 3, icon: '🥑', name: 'Avokado', description: 'Sağlıklı yağ kaynağı' },
  { id: 4, icon: '🍓', name: 'Çilek', description: 'Tatlı kırmızı meyve' },
  { id: 5, icon: '🍇', name: 'Üzüm', description: 'Salkım salkım üzüm' },
];

const containerStyle = {
  position: 'relative',
  width: '100%',
  height: '80px',
  overflow: 'hidden',
  backgroundColor: '#f5f5f5',
};

const tickerContainerStyle = {
  position: 'relative',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
};

const tickerStyle = {
  display: 'flex',
  gap: '20px',
  whiteSpace: 'nowrap',
  position: 'absolute',
  animation: 'ticker 40s linear infinite',
  top: '50%',
  transform: 'translateY(-50%)',
  willChange: 'right',
};

const productStyle = {
  display: 'flex',
  alignItems: 'center',
  border: '1px solid #ddd',
  borderRadius: '8px',
  padding: '10px 15px',
  minWidth: '180px',
  backgroundColor: '#fff',
  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  userSelect: 'none',
  transition: 'transform 0.3s, box-shadow 0.3s',
};

const iconStyle = {
  fontSize: '30px',
  marginRight: '15px',
};

const textContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  flexShrink: 0,
  width: '120px',
};

const nameStyle = {
  fontWeight: '600',
  fontSize: '16px',
  textAlign: 'center',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  maxWidth: '100%',
  letterSpacing: '0.05em',
};

const descStyle = {
  fontSize: '12px',
  color: '#666',
  marginTop: '5px',
  textAlign: 'center',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  maxWidth: '100%',
  letterSpacing: '0.02em',
};

const styleSheet = `
@keyframes ticker {
  0% {
    right: -100%;
  }
  100% {
    right: 100%;
  }
}

.ticker-container:hover .ticker {
  animation-play-state: paused;
}

.product-card:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  z-index: 10;
}
`;

export default function ProductTicker() {
  return (
    <>
      <style>{styleSheet}</style>

      <div style={containerStyle} className="ticker-container">
        <div style={tickerContainerStyle}>
          <motion.div 
            className="ticker" 
            style={tickerStyle}
            initial={{ right: "-100%" }}
            animate={{ right: "100%" }}
            transition={{ 
              duration: 40, 
              ease: "linear", 
              repeat: Infinity,
              repeatType: "loop"
            }}
          >
            {products.map(({ id, icon, name, description }) => (
              <motion.div 
                key={id} 
                className="product-card"
                style={productStyle}
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
                  y: -5
                }}
              >
                <motion.div 
                  style={iconStyle}
                  whileHover={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                >{icon}</motion.div>
                <div style={textContainerStyle}>
                  <div style={nameStyle} title={name}>
                    {name.length > 10 ? name.slice(0, 10) + '…' : name}
                  </div>
                  <div style={descStyle} title={description}>
                    {description.length > 20 ? description.slice(0, 20) + '…' : description}
                  </div>
                </div>
              </motion.div>
            ))}
            {products.map(({ id, icon, name, description }) => (
              <motion.div 
                key={'dup-' + id} 
                className="product-card"
                style={productStyle}
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
                  y: -5
                }}
              >
                <motion.div 
                  style={iconStyle}
                  whileHover={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                >{icon}</motion.div>
                <div style={textContainerStyle}>
                  <div style={nameStyle} title={name}>
                    {name.length > 10 ? name.slice(0, 10) + '…' : name}
                  </div>
                  <div style={descStyle} title={description}>
                    {description.length > 20 ? description.slice(0, 20) + '…' : description}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </>
  );
}

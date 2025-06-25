import React from 'react';
import { motion } from 'motion/react';

const products = [
  { id: 1, image: 'https://i.imgur.com/1GnhM3T.png', name: 'Elma', description: 'Taze ve lezzetli elma' },
  { id: 2, image: 'https://i.imgur.com/bXYHGBL.png', name: 'Muz', description: 'Sarı muzlar burada' },
  { id: 3, image: 'https://i.imgur.com/HlVXEZK.png', name: 'Avokado', description: 'Sağlıklı yağ kaynağı' },
  { id: 4, image: 'https://i.imgur.com/SRt4Kj7.png', name: 'Çilek', description: 'Tatlı kırmızı meyve' },
  { id: 5, image: 'https://i.imgur.com/vpYY5YO.png', name: 'Üzüm', description: 'Salkım salkım üzüm' },
];

export function ProductTicker() {
  const containerStyle = {
    position: 'relative',
    width: '100%',
    height: '100px', // 🔥 Yüksekliği artırdım
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
    gap: '25px', // 🔥 Gap artırıldı
    whiteSpace: 'nowrap',
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    willChange: 'transform',
    height: '75px', // 🔥 Yükseklik artırıldı
  };
  const productStyle = {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #ddd',
    borderRadius: '10px', // 🔥 Border radius artırıldı
    padding: '12px 18px', // 🔥 Padding artırıldı
    minWidth: '220px', // 🔥 Genişlik artırıldı
    height: '75px', // 🔥 Yükseklik artırıldı
    backgroundColor: '#fff',
    boxShadow: '0 3px 7px rgba(0,0,0,0.15)', // 🔥 Gölge güçlendirildi
    userSelect: 'none',
    transition: 'transform 0.3s, box-shadow 0.3s',
  };
  const imageStyle = {
    width: '40px', // 🔥 İmaj boyutu artırıldı
    height: '30px',
    marginRight: '15px',
    objectFit: 'contain'
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
    transform: translate3d(0, -50%, 0);
  }
  100% {
    transform: translate3d(calc(-100% / 2), -50%, 0);
  }
}
.ticker {
  display: flex;
  animation: ticker 30s linear infinite;
  width: fit-content;
}
.ticker > div {
  flex-shrink: 0;
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
  const duplicatedProducts = [...products, ...products, ...products];
  return (
    <>
      <style>{styleSheet}</style>
      <div style={containerStyle} className="ticker-container">
        <div style={tickerContainerStyle}>
          <div className="ticker" style={tickerStyle}>
            {duplicatedProducts.map(({ id, image, name, description }, index) => (
              <motion.div
                key={`${id}-${index}`}
                className="product-card"
                style={productStyle}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
                  y: -5
                }}
              >
                <img
                  src={image}
                  alt={name}
                  style={imageStyle}
                />
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
          </div>
        </div>
      </div>
    </>
  );
}

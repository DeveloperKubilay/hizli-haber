import React from 'react';

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
    height: '120px', // 🔥 Yüksekliği daha da artırdım
    overflow: 'hidden',
    backgroundColor: 'transparent',
  };
  const tickerContainerStyle = {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  };
  const tickerStyle = {
    display: 'flex',
    gap: '30px', // 🔥 Gap biraz daha artırıldı
    whiteSpace: 'nowrap',
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    willChange: 'transform',
    height: '90px', // 🔥 Yükseklik artırıldı
  };
  const productStyle = {
    display: 'flex',
    alignItems: 'center',
    border: '2px solid #ddd',
    borderRadius: '12px', // 🔥 Border radius biraz artırıldı
    padding: '15px 25px', // 🔥 Padding artırıldı, özellikle yatay padding
    minWidth: '300px', // 🔥 Genişlik daha da artırıldı
    height: '90px', // 🔥 Yükseklik artırıldı
    backgroundColor: 'transparent', // 🔥 Arka plan kaldırıldı
    boxShadow: 'none', // 🔥 Gölge kaldırıldı
    userSelect: 'none',
    transition: 'transform 0.3s, border-color 0.3s',
  };
  const imageStyle = {
    width: '45px', // 🔥 İmaj boyutu artırıldı
    height: '35px',
    marginRight: '18px',
    objectFit: 'contain'
  };
  const textContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    flexShrink: 0,
    width: '180px', // 🔥 Genişlik artırıldı
    textAlign: 'left', // 🔥 Sol hizalama
  };
  const nameStyle = {
    fontWeight: '600',
    fontSize: '20px', // 🔥 18px'den 20px'e artırıldı
    textAlign: 'left', // 🔥 Sol hizalama
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    maxWidth: '100%',
    letterSpacing: '0.05em',
    marginBottom: '4px', // 🔥 Alt margin eklendi
  };
  const descStyle = {
    fontSize: '16px', // 🔥 14px'den 16px'e artırıldı
    color: '#f0f0f0', // 🔥 Beyazın kapalı tonu
    textAlign: 'left', // 🔥 Sol hizalama
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
@keyframes tickerReverse {
  0% {
    transform: translate3d(calc(-100% / 2), -50%, 0);
  }
  100% {
    transform: translate3d(0, -50%, 0);
  }
}
.ticker {
  display: flex;
  animation: ticker 40s linear infinite;
  width: fit-content;
}
.ticker-reverse {
  display: flex;
  animation: tickerReverse 40s linear infinite;
  width: fit-content;
}
.ticker > div, .ticker-reverse > div {
  flex-shrink: 0;
}
.ticker-container:hover .ticker,
.ticker-container:hover .ticker-reverse {
  animation-play-state: paused;
}
.product-card:hover {
  transform: scale(1.02);
  border-color: #999;
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
              <div
                key={`${id}-${index}`}
                className="product-card"
                style={productStyle}
              >
                <img
                  src={image}
                  alt={name}
                  style={imageStyle}
                />
                <div style={textContainerStyle}>
                  <div style={nameStyle} title={name}>
                    {name.length > 18 ? name.slice(0, 18) + '…' : name}
                  </div>
                  <div style={descStyle} title={description}>
                    {description.length > 25 ? description.slice(0, 25) + '…' : description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export function ProductTickerReverse() {
  const containerStyle = {
    position: 'relative',
    width: '100%',
    height: '120px',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  };
  const tickerContainerStyle = {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  };
  const tickerStyle = {
    display: 'flex',
    gap: '30px',
    whiteSpace: 'nowrap',
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    willChange: 'transform',
    height: '90px',
  };
  const productStyle = {
    display: 'flex',
    alignItems: 'center',
    border: '2px solid #ddd',
    borderRadius: '12px',
    padding: '15px 25px',
    minWidth: '300px',
    height: '90px',
    backgroundColor: 'transparent',
    boxShadow: 'none',
    userSelect: 'none',
    transition: 'transform 0.3s, border-color 0.3s',
  };
  const imageStyle = {
    width: '45px',
    height: '35px',
    marginRight: '18px',
    objectFit: 'contain'
  };
  const textContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    flexShrink: 0,
    width: '180px',
    textAlign: 'left',
  };
  const nameStyle = {
    fontWeight: '600',
    fontSize: '20px', // 🔥 Font boyutu artırıldı
    textAlign: 'left',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    maxWidth: '100%',
    letterSpacing: '0.05em',
    marginBottom: '4px',
  };
  const descStyle = {
    fontSize: '16px', // 🔥 Font boyutu artırıldı
    color: '#f0f0f0', // 🔥 Beyazın kapalı tonu
    textAlign: 'left',
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
@keyframes tickerReverse {
  0% {
    transform: translate3d(calc(-100% / 2), -50%, 0);
  }
  100% {
    transform: translate3d(0, -50%, 0);
  }
}
.ticker {
  display: flex;
  animation: ticker 40s linear infinite;
  width: fit-content;
}
.ticker-reverse {
  display: flex;
  animation: tickerReverse 40s linear infinite;
  width: fit-content;
}
.ticker > div, .ticker-reverse > div {
  flex-shrink: 0;
}
.ticker-container:hover .ticker,
.ticker-container:hover .ticker-reverse {
  animation-play-state: paused;
}
.product-card:hover {
  transform: scale(1.02);
  border-color: #999;
}
`;

  const duplicatedProducts = [...products, ...products, ...products];
  
  return (
    <>
      <style>{styleSheet}</style>
      <div style={containerStyle} className="ticker-container">
      <div style={tickerContainerStyle}>
        <div className="ticker-reverse" style={tickerStyle}>
          {duplicatedProducts.map(({ id, image, name, description }, index) => (
            <div
              key={`${id}-${index}`}
              className="product-card"
              style={productStyle}
            >
              <img
                src={image}
                alt={name}
                style={imageStyle}
              />
              <div style={textContainerStyle}>
                <div style={nameStyle} title={name}>
                  {name.length > 18 ? name.slice(0, 18) + '…' : name}
                </div>
                <div style={descStyle} title={description}>
                  {description.length > 25 ? description.slice(0, 25) + '…' : description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}

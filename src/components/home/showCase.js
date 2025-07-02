import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../services/firebase';
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore';

export function ProductTicker() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleNewsClick = (newsId) => {
    navigate(`/haberler/${newsId}`);
  };

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const newsQuery = query(
          collection(db, 'news'),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        const newsSnapshot = await getDocs(newsQuery);
        
        const newsData = newsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            image: data.image || '/favicon.ico',
            name: data.name || 'Haber Başlığı',
            description: data.minides ? 
              (data.minides.length > 25 ? data.minides.slice(0, 25) + '...' : data.minides) : 
              'Haber açıklaması'
          };
        });
        
        setProducts(newsData);
      } catch (error) {
        console.error("Haberler çekilirken hata:", error);
        // Hata durumunda varsayılan veriler
        setProducts([
          { id: 1, image: '/favicon.ico', name: 'Ekonomi Haberleri', description: 'Güncel ekonomik gelişmeler' },
          { id: 2, image: '/favicon.ico', name: 'Spor Dünyası', description: 'En son spor haberleri' },
          { id: 3, image: '/favicon.ico', name: 'Teknoloji', description: 'Teknoloji dünyasındaki yenilikler' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Loading durumunda skeleton göster
  if (loading) {
    return (
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        height: '120px', 
        overflow: 'hidden', 
        backgroundColor: 'transparent' 
      }}>
        <div style={{
          display: 'flex',
          gap: '30px',
          position: 'absolute',
          top: '50%',
          transform: 'translateY(-50%)',
          height: '90px',
          alignItems: 'center'
        }}>
          {Array.from({ length: 5 }).map((_, index) => (
            <div 
              key={index} 
              className="animate-pulse"
              style={{
                display: 'flex',
                alignItems: 'center',
                border: '2px solid #ddd',
                borderRadius: '12px',
                padding: '15px 25px',
                minWidth: '300px',
                height: '90px',
                backgroundColor: 'transparent',
                flexShrink: 0
              }}
            >
              {/* Resim skeleton */}
              <div 
                style={{
                  width: '45px',
                  height: '35px',
                  marginRight: '18px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '4px'
                }}
              ></div>
              
              {/* Text container skeleton */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                width: '180px',
                gap: '8px'
              }}>
                {/* Başlık skeleton */}
                <div style={{
                  height: '20px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '4px',
                  width: '85%'
                }}></div>
                
                {/* Açıklama skeleton */}
                <div style={{
                  height: '16px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '4px',
                  width: '70%'
                }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const containerStyle = {
    position: 'relative',
    width: '100%',
    height: '120px', // 🔥 Yükseklik daha da artırdım
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
    cursor: 'pointer', // 🔥 Pointer ekledim
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
                onClick={() => handleNewsClick(id)}
              >
                <img
                  src={image}
                  alt={name}
                  style={imageStyle}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/favicon.ico';
                  }}
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
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleNewsClick = (newsId) => {
    navigate(`/haberler/${newsId}`);
  };

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const newsQuery = query(
          collection(db, 'news'),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        const newsSnapshot = await getDocs(newsQuery);
        
        const newsData = newsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            image: data.image || '/favicon.ico',
            name: data.name || 'Haber Başlığı',
            description: data.minides ? 
              (data.minides.length > 25 ? data.minides.slice(0, 25) + '...' : data.minides) : 
              'Haber açıklaması'
          };
        });
        
        setProducts(newsData);
      } catch (error) {
        console.error("Haberler çekilirken hata:", error);
        // Hata durumunda varsayılan veriler
        setProducts([
          { id: 1, image: '/favicon.ico', name: 'Ekonomi Haberleri', description: 'Güncel ekonomik gelişmeler' },
          { id: 2, image: '/favicon.ico', name: 'Spor Dünyası', description: 'En son spor haberleri' },
          { id: 3, image: '/favicon.ico', name: 'Teknoloji', description: 'Teknoloji dünyasındaki yenilikler' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Loading durumunda skeleton göster
  if (loading) {
    return (
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        height: '120px', 
        overflow: 'hidden', 
        backgroundColor: 'transparent' 
      }}>
        <div style={{
          display: 'flex',
          gap: '30px',
          position: 'absolute',
          top: '50%',
          transform: 'translateY(-50%)',
          height: '90px',
          alignItems: 'center'
        }}>
          {Array.from({ length: 5 }).map((_, index) => (
            <div 
              key={index} 
              className="animate-pulse"
              style={{
                display: 'flex',
                alignItems: 'center',
                border: '2px solid #ddd',
                borderRadius: '12px',
                padding: '15px 25px',
                minWidth: '300px',
                height: '90px',
                backgroundColor: 'transparent',
                flexShrink: 0
              }}
            >
              {/* Resim skeleton */}
              <div 
                style={{
                  width: '45px',
                  height: '35px',
                  marginRight: '18px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '4px'
                }}
              ></div>
              
              {/* Text container skeleton */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                width: '180px',
                gap: '8px'
              }}>
                {/* Başlık skeleton */}
                <div style={{
                  height: '20px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '4px',
                  width: '85%'
                }}></div>
                
                {/* Açıklama skeleton */}
                <div style={{
                  height: '16px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '4px',
                  width: '70%'
                }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

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
    cursor: 'pointer', // 🔥 Pointer ekledim
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
              onClick={() => handleNewsClick(id)}
            >
              <img
                src={image}
                alt={name}
                style={imageStyle}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/favicon.ico';
                }}
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

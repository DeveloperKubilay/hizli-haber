import React, { useState, useEffect } from 'react';
import { ProductTicker, ProductTickerReverse } from './showCase';
import { db } from '../../services/firebase';
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore';

function TickerSection() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchLatest = async () => {
      try {
        const q = query(
          collection(db, 'news'),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        const snap = await getDocs(q);
        if (!isMounted) return;
        
        const data = snap.docs.map(doc => {
          const d = doc.data();
          return {
            id: doc.id,
            tag: d.tag,
            slug: d.slug,
            image: d.image || '/favicon.ico',
            name: d.name || 'Haber Başlığı',
            description: d.minides ? 
              (d.minides.length > 25 ? d.minides.slice(0, 25) + '...' : d.minides) : 
              'Haber açıklaması'
          };
        });
        setItems(data);
      } catch (e) {
        console.error('Ticker haberleri çekilirken hata:', e);
      }
    };

    fetchLatest();
    return () => { isMounted = false; };
  }, []);

  return (
    <div>
      <ProductTicker items={items} />
      <div className="py-2">
        <ProductTickerReverse items={items} />
      </div>
      <div className="py-2">
        <ProductTicker items={items} />
      </div>
    </div>
  );
}

export default TickerSection;

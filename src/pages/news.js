import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import { CATEGORY_LIST, CATEGORIES, CATEGORY_ICONS, CATEGORY_COLORS, APP_CONFIG } from '../services/categories';

function Home() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(APP_CONFIG.DEFAULT_CATEGORY);
  
  const filteredBlogs = selectedCategory === CATEGORIES.ALL 
    ? blogs 
    : blogs.filter(blog => blog.kategori === selectedCategory);
  
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const blogsCollection = collection(db, 'blogs');
        const blogsSnapshot = await getDocs(blogsCollection);
        setBlogs(blogsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBlogs();
  }, []);

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">📰 Haberler</h1>
            
            {/* Kategori Butonları - Yatay Sıralı */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Kategoriler:</h2>
              <div className="flex flex-wrap gap-3">
                {CATEGORY_LIST.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 border-2 ${
                      selectedCategory === category
                        ? 'bg-blue-500 text-white border-blue-500 shadow-lg transform scale-105'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                  >
                    <span className="mr-2">{CATEGORY_ICONS[category]}</span>
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-xl text-gray-500">⏳ Haberler yükleniyor...</div>
            </div>
          ) : filteredBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBlogs.map(blog => (
                <div key={blog.id} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-gray-200">
                  <h3 className="text-xl font-bold mb-3 text-gray-800">{blog.baslik}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{blog.kisaAciklama}</p>
                  {blog.kategori && (
                    <span className={`text-sm px-3 py-1 rounded-full mb-3 inline-block ${CATEGORY_COLORS[blog.kategori] || 'bg-gray-100 text-gray-800'}`}>
                      {CATEGORY_ICONS[blog.kategori]} {blog.kategori}
                    </span>
                  )}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {blog.etiketler && blog.etiketler.map((tag, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>👁️ {blog.okunmaSayisi || 0} okunma</span>
                    <span>📅 {blog.tarih || 'Bilinmiyor'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-xl text-gray-500">
                {selectedCategory === CATEGORIES.ALL ? '📭 Henüz haber yok' : `📭 ${selectedCategory} kategorisinde haber bulunamadı`}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Home;
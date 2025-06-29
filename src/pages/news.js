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
          {/* Kategoriler */}
          <div className="mb-6">
            <div className="bg-primary p-1 rounded-3xl shadow-lg w-fit mx-auto">
              <div className="flex flex-wrap justify-center">
                {CATEGORY_LIST.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-2 rounded-2xl text-sm font-medium transition-all duration-200 ${
                      selectedCategory === category
                        ? 'bg-secondaryBG text-secondary border border-secondary shadow-md'
                        : 'bg-transparent text-textPrimary hover:bg-primaryBG hover:text-textHeading border border-transparent'
                    }`}
                  >
                    <span className="mr-1.5">{CATEGORY_ICONS[category]}</span>
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Ana içerik - Sol reklam, Sağ haberler */}
          <div className="flex gap-6">
            {/* Sol reklam alanı 300px */}
            <div className="w-[300px] flex-shrink-0">
              <div className="bg-primary p-6 rounded-2xl shadow-lg sticky top-6">
                <div className="text-center text-textPrimary">
                  <h3 className="text-lg font-semibold mb-4 text-textHeading">📢 Reklam Alanı</h3>
                  <div className="bg-primaryBG rounded-xl p-8 min-h-[400px] flex items-center justify-center">
                    <p className="text-textPrimary">Buraya reklam gelecek! 🚀</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sağ haberler alanı */}
            <div className="flex-1">
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="text-xl text-gray-500">⏳ Haberler yükleniyor...</div>
                </div>
              ) : filteredBlogs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredBlogs.map(blog => (
                    <div key={blog.id} className="bg-primary p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-primaryBG">
                      <h3 className="text-xl font-bold mb-3 text-textHeading">{blog.baslik}</h3>
                      <p className="text-textPrimary mb-4 line-clamp-3">{blog.kisaAciklama}</p>
                      {blog.kategori && (
                        <span className={`text-sm px-3 py-1 rounded-full mb-3 inline-block ${CATEGORY_COLORS[blog.kategori] || 'bg-primaryBG text-textPrimary'}`}>
                          {CATEGORY_ICONS[blog.kategori]} {blog.kategori}
                        </span>
                      )}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {blog.etiketler && blog.etiketler.map((tag, index) => (
                          <span key={index} className="bg-primaryBG text-textPrimary text-xs px-2 py-1 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex justify-between items-center text-sm text-textPrimary">
                        <span>👁️ {blog.okunmaSayisi || 0} okunma</span>
                        <span>📅 {blog.tarih || 'Bilinmiyor'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="text-xl text-textPrimary">
                    {selectedCategory === CATEGORIES.ALL ? '📭 Henüz haber yok' : `📭 ${selectedCategory} kategorisinde haber bulunamadı`}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
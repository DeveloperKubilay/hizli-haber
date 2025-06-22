import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import Navbar from '../components/Navbar';

function Home() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
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
      <div className="Welcome_container"></div>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 relative">
        <div className="space-y-8">
          <div>


            <h2 className="text-2xl font-semibold mb-4">All Blog Posts</h2>
            
            {loading ? (
              <p>Loading blogs...</p>
            ) : blogs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map(blog => (
                  <div key={blog.id} className="bg-white p-6 rounded shadow-md">
                    <h3 className="text-xl font-semibold mb-2">{blog.baslik}</h3>
                    <p className="text-gray-600 mb-2">{blog.kisaAciklama}</p>
                    <div className="flex flex-wrap mb-2">
                      {blog.etiketler && blog.etiketler.map((tag, index) => (
                        <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mr-2 mb-2">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500">Okunma: {blog.okunmaSayisi}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No blogs found.</p>
            )}


            
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
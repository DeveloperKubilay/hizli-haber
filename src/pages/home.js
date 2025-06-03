import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

function Home() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);
  const fetchedOnce = useRef(false);
  
  useEffect(() => {
    // Set up cleanup
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  useEffect(() => {
    const fetchBlogs = async () => {
      // Prevent duplicate fetches
      if (fetchedOnce.current) return;
      fetchedOnce.current = true;
      
      try {
        console.log('Fetching blogs from Firestore...');
        const blogsCollection = collection(db, 'blogs');
        const blogsSnapshot = await getDocs(blogsCollection);
        const blogsList = blogsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Only update state if component is still mounted
        if (isMounted.current) {
          console.log('Setting blogs:', blogsList.length);
          setBlogs(blogsList);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching blogs: ", error);
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };
    
    fetchBlogs();
  }, []);

  return (
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
  );
}

export default Home;
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
            <div className="flex flex-col justify-center items-center w-full my-4">
              <img 
                src="/imgs/logo.png" 
                alt="Blog Header" 
                className="rounded-lg shadow-lg max-h-64 object-cover mb-4" 
              />
              <h1 className="text-center mt-2">Burası aradığın haberin <span className='text-orange-300'>en hızlısı</span></h1>
            </div>



          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
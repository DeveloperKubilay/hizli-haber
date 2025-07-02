import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './pages/home';
import News from './pages/news';
import New from './pages/new';
import SavedNews from './pages/savednews';
import './services/index.css';

// Scroll to top component
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-tbackground text-textPrimary font-sans text-base">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/haberler" element={<News />} />
          <Route path="/haberler/:id" element={<New />} />
          <Route path="/new/:id" element={<New />} /> {/* Eski URL'ler için redirect */}
          <Route path="/haber/:id" element={<New />} /> {/* Eski URL'ler için redirect */}
          <Route path="/kaydettigim-haberler" element={<SavedNews />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
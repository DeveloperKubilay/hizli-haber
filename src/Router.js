import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import News from './pages/news';
import './services/index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-tbackground text-textPrimary font-sans text-base">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/haberler" element={<News />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
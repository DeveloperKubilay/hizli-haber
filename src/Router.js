import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import './services/index.css'; // CSS dosyasını import ediyoruz

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-textPrimary font-sans">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
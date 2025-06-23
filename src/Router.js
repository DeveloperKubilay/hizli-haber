import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Test from './pages/test';
import './services/index.css'; // CSS dosyasını import ediyoruz

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-textPrimary font-sans">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/test" element={<Test />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
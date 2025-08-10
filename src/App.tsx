import { useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './routes/Home';
import { Solo } from './routes/Solo';
import { Versus } from './routes/Versus';
import { Daily } from './routes/Daily';
import { Settings } from './routes/Settings';
import './index.css';

function App() {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/letterfall/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }

    // Prevent zoom on double tap (iOS Safari)
    let lastTouchEnd = 0;
    const preventZoom = (event: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    };

    document.addEventListener('touchend', preventZoom, false);
    
    return () => {
      document.removeEventListener('touchend', preventZoom);
    };
  }, []);

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/solo" element={<Solo />} />
          <Route path="/versus" element={<Versus />} />
          <Route path="/daily" element={<Daily />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './loading.css'
import './index.css'
import App from './App.tsx'

// Add error handling for React initialization
try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );

  // Hide loading screen when React renders successfully
  setTimeout(() => {
    const loading = document.getElementById('loading');
    if (loading && rootElement.children.length > 0) {
      loading.style.opacity = '0';
      loading.style.transition = 'opacity 0.3s ease';
      setTimeout(() => {
        loading.style.display = 'none';
      }, 300);
    }
  }, 500);

} catch (error) {
  console.error('Failed to initialize React app:', error);
  
  // Show error message if React fails
  const loading = document.getElementById('loading');
  if (loading) {
    loading.innerHTML = `
      <div class="loading-logo">🅻 LetterFall</div>
      <div style="color: #ff6b6b; margin-top: 20px; text-align: center; max-width: 300px;">
        <div>App failed to load</div>
        <div style="font-size: 14px; margin-top: 10px; opacity: 0.8;">
          ${error instanceof Error ? error.message : 'Unknown error'}
        </div>
        <button onclick="window.location.reload()" style="
          margin-top: 15px; 
          padding: 10px 20px; 
          background: #4a90e2; 
          color: white; 
          border: none; 
          border-radius: 5px; 
          cursor: pointer;
          font-size: 14px;
        ">Reload Page</button>
      </div>
    `;
  }
}

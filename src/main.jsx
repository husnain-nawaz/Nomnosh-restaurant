import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

const rootElement = document.getElementById('root');

class AppErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, fontFamily: 'system-ui, sans-serif', color: '#292524' }}>
          <h1 style={{ color: '#b91c1c' }}>NOM NOSH could not load</h1>
          <p>Refresh the page after restarting the local server.</p>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#f5f5f4', padding: 16, borderRadius: 8 }}>
            {this.state.error.message}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

if (rootElement) {
  createRoot(rootElement).render(
    <AppErrorBoundary>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </AppErrorBoundary>
  );
}

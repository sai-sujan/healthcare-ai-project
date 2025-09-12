import './App.css';
import PatientDashboard from './components/PatientDashboard';
import './styles/healthcare.css';

function App() {
  return (
    <div className="App">
      <header className="healthcare-header">
        <div className="container">
          <div>
            <h1>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 8h-2v3h-3v2h3v3h2v-3h3v-2h-3V8zM4 6h9v2H4V6zm0 5h9v2H4v-2zm0 5h9v2H4v-2z"/>
              </svg>
              HealthAI Pro
            </h1>
            <p className="subtitle">Advanced Healthcare Management System</p>
          </div>
          
          <div className="header-stats">
            <div className="header-stat">
              <span className="header-stat-number">500+</span>
              <span className="header-stat-label">Patient Records</span>
            </div>
            <div className="header-stat">
              <span className="header-stat-number">Active</span>
              <span className="header-stat-label">System Status</span>
            </div>
          </div>
        </div>
      </header>
      
      <main>
        <PatientDashboard />
      </main>
    </div>
  );
}

export default App;
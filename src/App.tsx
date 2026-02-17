import './App.css'
import DoctorList from './components/DoctorList'

function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header style={{ 
        background: 'linear-gradient(135deg, #2d5f3f 0%, #1a3d2b 100%)',
        color: 'white',
        padding: '1.5rem 2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '1.5rem',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ 
              margin: 0, 
              fontSize: '2rem',
              fontWeight: '700',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>
              Burhani Guards Pakistan DIV III
            </h1>
            <p style={{ 
              margin: '0.5rem 0 0 0',
              fontSize: '1.1rem',
              opacity: 0.95,
              fontWeight: '500'
            }}>
              OPD Token Generation System
            </p>
          </div>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        <DoctorList />
      </main>

      <footer style={{
        background: '#f8f9fa',
        borderTop: '2px solid #2d5f3f',
        padding: '1.5rem 2rem',
        textAlign: 'center',
        color: '#555',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.05)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600', color: '#2d5f3f' }}>
            Burhani Guards Pakistan DIV III
          </p>
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>
            © {new Date().getFullYear()} All Rights Reserved
          </p>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#888' }}>
            Version 1.0.0
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App

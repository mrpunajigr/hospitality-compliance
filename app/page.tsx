export default function HomePage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '40px',
      backgroundColor: '#1e293b',
      color: 'white',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px', textAlign: 'center' }}>
        🎉 OCR Enhancement System Live!
      </h1>
      
      <div style={{ 
        maxWidth: '600px', 
        margin: '0 auto',
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: '30px',
        borderRadius: '20px',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>
          Hospitality Compliance System
        </h2>
        
        <p style={{ fontSize: '18px', marginBottom: '30px', lineHeight: '1.6' }}>
          Your OCR Enhancement system is successfully deployed on Netlify!<br/>
          Ready to test with delivery dockets.
        </p>
        
        <div style={{ marginBottom: '20px' }}>
          <a 
            href="/console/dashboard" 
            style={{
              display: 'inline-block',
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '15px 30px',
              fontSize: '18px',
              fontWeight: 'bold',
              textDecoration: 'none',
              borderRadius: '10px',
              margin: '10px'
            }}
          >
            🚀 ACCESS DEMO
          </a>
        </div>
        
        <div style={{ marginTop: '30px', fontSize: '14px', opacity: '0.8' }}>
          <p>✅ Node.js 20 compatibility</p>
          <p>✅ Supabase environment variables configured</p>
          <p>✅ Full OCR system deployed and ready</p>
        </div>
      </div>
    </div>
  )
}
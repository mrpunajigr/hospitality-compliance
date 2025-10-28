export default function CardTestPage() {
  return (
    <div style={{
      minHeight: '100vh',
      padding: '50px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <h1 style={{color: 'white', fontSize: '48px', marginBottom: '30px'}}>
        CARD STYLING TEST
      </h1>
      
      {/* Test glass morphism card with 38px radius */}
      <div style={{
        borderRadius: '38px', 
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '24px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.2s ease',
        maxWidth: '400px',
        marginBottom: '20px'
      }}>
        <h3 style={{color: 'white', fontSize: '24px', marginBottom: '16px'}}>
          Glass Card with 38px Radius
        </h3>
        <p style={{color: 'rgba(255, 255, 255, 0.8)', fontSize: '16px'}}>
          This card should have translucent glass background with 38px rounded corners.
          The background should show through with blur effect.
        </p>
      </div>
      
      {/* Test regular opacity card for comparison */}
      <div style={{
        borderRadius: '16px', 
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        border: '2px solid white',
        padding: '24px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        maxWidth: '400px',
        marginBottom: '20px'
      }}>
        <h3 style={{color: 'black', fontSize: '24px', marginBottom: '16px'}}>
          Solid Card (16px radius)
        </h3>
        <p style={{color: 'rgba(0, 0, 0, 0.8)', fontSize: '16px'}}>
          This card should be solid white with 16px rounded corners for comparison.
        </p>
      </div>
      
      <p style={{color: 'white', fontSize: '18px', marginTop: '30px'}}>
        Navigate to this page to test card styling without any layout interference.
        URL: localhost:3000/card-test
      </p>
    </div>
  )
}
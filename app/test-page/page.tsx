export default function TestPage() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw', 
      height: '100vh',
      background: 'red',
      zIndex: 999999,
      color: 'white',
      fontSize: '48px',
      padding: '50px'
    }}>
      <h1>ISOLATED TEST PAGE</h1>
      <p>If this is black, the issue is systemic</p>
    </div>
  )
}
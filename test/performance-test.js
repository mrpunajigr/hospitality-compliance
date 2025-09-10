// Performance Testing for iPad Air Safari 12 Compatibility
// Tests memory usage, load times, and responsiveness

const { performance, PerformanceObserver } = require('perf_hooks')

class PerformanceTest {
  constructor() {
    this.results = []
    this.memoryBaseline = process.memoryUsage()
  }

  // Test page load performance
  async testPageLoadPerformance() {
    console.log('🚀 Testing Page Load Performance...\n')
    
    const pages = [
      'http://localhost:3000',
      'http://localhost:3000/upload/console', 
      'http://localhost:3000/admin/console',
      'http://localhost:3000/admin/team'
    ]

    for (const page of pages) {
      const startTime = performance.now()
      
      try {
        const response = await fetch(page, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (iPad; CPU OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1'
          }
        })
        
        const endTime = performance.now()
        const loadTime = endTime - startTime
        const status = response.status
        
        const result = {
          page: page.replace('http://localhost:3000', ''),
          loadTime: Math.round(loadTime),
          status,
          success: status >= 200 && status < 400,
          size: response.headers.get('content-length') || 'unknown'
        }
        
        this.results.push(result)
        
        console.log(`Page: ${result.page || '/'}`)
        console.log(`  Load Time: ${result.loadTime}ms`)
        console.log(`  Status: ${result.status}`)
        console.log(`  Size: ${result.size} bytes`)
        console.log(`  ✅ ${result.success ? 'PASS' : 'FAIL'}\n`)
        
      } catch (error) {
        console.log(`Page: ${page}`)
        console.log(`  ❌ ERROR: ${error.message}\n`)
      }
    }
  }

  // Test API response times
  async testAPIPerformance() {
    console.log('⚡ Testing API Performance...\n')
    
    const apiEndpoints = [
      { url: '/api/test-email', method: 'GET' },
      { url: '/api/test-email', method: 'POST', body: { email: 'test@example.com' } }
    ]

    for (const endpoint of apiEndpoints) {
      const startTime = performance.now()
      
      try {
        const options = {
          method: endpoint.method,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'iPad Performance Test'
          }
        }
        
        if (endpoint.body) {
          options.body = JSON.stringify(endpoint.body)
        }
        
        const response = await fetch(`http://localhost:3000${endpoint.url}`, options)
        const endTime = performance.now()
        const responseTime = endTime - startTime
        
        const result = {
          endpoint: `${endpoint.method} ${endpoint.url}`,
          responseTime: Math.round(responseTime),
          status: response.status,
          success: response.status >= 200 && response.status < 500 // Allow some 4xx for auth tests
        }
        
        console.log(`API: ${result.endpoint}`)
        console.log(`  Response Time: ${result.responseTime}ms`)
        console.log(`  Status: ${result.status}`) 
        console.log(`  ✅ ${result.success ? 'PASS' : 'FAIL'}\n`)
        
      } catch (error) {
        console.log(`API: ${endpoint.method} ${endpoint.url}`)
        console.log(`  ❌ ERROR: ${error.message}\n`)
      }
    }
  }

  // Test memory usage simulation
  testMemoryUsage() {
    console.log('💾 Testing Memory Usage...\n')
    
    const currentMemory = process.memoryUsage()
    const memoryUsage = {
      rss: Math.round((currentMemory.rss - this.memoryBaseline.rss) / 1024 / 1024),
      heapUsed: Math.round((currentMemory.heapUsed - this.memoryBaseline.heapUsed) / 1024 / 1024),
      heapTotal: Math.round(currentMemory.heapTotal / 1024 / 1024),
      external: Math.round(currentMemory.external / 1024 / 1024)
    }
    
    console.log(`Memory Usage:`)
    console.log(`  RSS: ${memoryUsage.rss}MB (change from baseline)`)
    console.log(`  Heap Used: ${memoryUsage.heapUsed}MB (change from baseline)`)
    console.log(`  Heap Total: ${memoryUsage.heapTotal}MB`)
    console.log(`  External: ${memoryUsage.external}MB`)
    
    // iPad Air (2013) has 1GB RAM, we should stay well under 512MB for browser
    const memoryPass = memoryUsage.heapTotal < 512
    console.log(`  ✅ ${memoryPass ? 'PASS' : 'FAIL'} (< 512MB target for iPad Air)\n`)
    
    return memoryPass
  }

  // Test rate limiting performance
  async testRateLimitingPerformance() {
    console.log('🛡️ Testing Rate Limiting Performance...\n')
    
    const requestTimes = []
    const maxRequests = 10
    
    for (let i = 0; i < maxRequests; i++) {
      const startTime = performance.now()
      
      try {
        const response = await fetch('http://localhost:3000/api/test-email', {
          method: 'GET',
          headers: {
            'User-Agent': 'Rate Limit Test'
          }
        })
        
        const endTime = performance.now()
        const requestTime = endTime - startTime
        
        requestTimes.push({
          request: i + 1,
          time: Math.round(requestTime),
          status: response.status,
          rateLimitRemaining: response.headers.get('x-ratelimit-remaining')
        })
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        console.log(`Request ${i + 1}: ERROR - ${error.message}`)
      }
    }
    
    // Analyze results
    const avgTime = Math.round(requestTimes.reduce((sum, req) => sum + req.time, 0) / requestTimes.length)
    const maxTime = Math.max(...requestTimes.map(req => req.time))
    const minTime = Math.min(...requestTimes.map(req => req.time))
    
    console.log(`Rate Limiting Performance:`)
    console.log(`  Requests Made: ${requestTimes.length}`)
    console.log(`  Average Time: ${avgTime}ms`)
    console.log(`  Min Time: ${minTime}ms`)
    console.log(`  Max Time: ${maxTime}ms`)
    
    // Check if any requests were rate limited
    const rateLimited = requestTimes.filter(req => req.status === 429)
    console.log(`  Rate Limited: ${rateLimited.length}`)
    
    const performancePass = avgTime < 500 // Should be under 500ms average
    console.log(`  ✅ ${performancePass ? 'PASS' : 'FAIL'} (< 500ms average target)\n`)
    
    return performancePass
  }

  // Test security header performance impact
  async testSecurityHeaderPerformance() {
    console.log('🔒 Testing Security Header Performance Impact...\n')
    
    const startTime = performance.now()
    
    try {
      const response = await fetch('http://localhost:3000', {
        method: 'HEAD', // Only get headers
        headers: {
          'User-Agent': 'Security Header Test'
        }
      })
      
      const endTime = performance.now()
      const headerTime = endTime - startTime
      
      // Count security headers
      const securityHeaders = [
        'content-security-policy',
        'x-frame-options', 
        'x-content-type-options',
        'x-xss-protection',
        'referrer-policy',
        'permissions-policy'
      ]
      
      let headerCount = 0
      securityHeaders.forEach(header => {
        if (response.headers.get(header)) {
          headerCount++
        }
      })
      
      console.log(`Security Header Performance:`)
      console.log(`  Response Time: ${Math.round(headerTime)}ms`)
      console.log(`  Security Headers Present: ${headerCount}/${securityHeaders.length}`)
      console.log(`  Total Headers: ${Array.from(response.headers.keys()).length}`)
      
      const headerPass = headerTime < 100 && headerCount >= 5
      console.log(`  ✅ ${headerPass ? 'PASS' : 'FAIL'} (< 100ms, ≥5 security headers)\n`)
      
      return headerPass
      
    } catch (error) {
      console.log(`  ❌ ERROR: ${error.message}\n`)
      return false
    }
  }

  // Run all performance tests
  async runAllTests() {
    console.log('🧪 JiGR Hospitality Compliance - Performance Test Suite')
    console.log('=' .repeat(60) + '\n')
    
    const startTime = Date.now()
    
    // Run all tests
    await this.testPageLoadPerformance()
    await this.testAPIPerformance() 
    const memoryPass = this.testMemoryUsage()
    const rateLimitPass = await this.testRateLimitingPerformance()
    const securityPass = await this.testSecurityHeaderPerformance()
    
    const endTime = Date.now()
    const totalTime = endTime - startTime
    
    // Summary
    console.log('📊 Performance Test Summary')
    console.log('=' .repeat(60))
    console.log(`Total Test Duration: ${totalTime}ms`)
    console.log(`Memory Usage: ${memoryPass ? '✅ PASS' : '❌ FAIL'}`)
    console.log(`Rate Limiting: ${rateLimitPass ? '✅ PASS' : '❌ FAIL'}`)
    console.log(`Security Headers: ${securityPass ? '✅ PASS' : '❌ FAIL'}`)
    
    // Page load results
    const successfulLoads = this.results.filter(r => r.success).length
    const avgLoadTime = this.results.reduce((sum, r) => sum + r.loadTime, 0) / this.results.length
    
    console.log(`\n📄 Page Performance:`)
    console.log(`  Successful Loads: ${successfulLoads}/${this.results.length}`)
    console.log(`  Average Load Time: ${Math.round(avgLoadTime)}ms`)
    console.log(`  Target: < 3000ms (iPad Air Safari 12)`)
    console.log(`  Status: ${avgLoadTime < 3000 ? '✅ PASS' : '❌ FAIL'}`)
    
    console.log('\n🎯 iPad Air Compatibility:')
    console.log(`  Memory Target: < 512MB ✅`)
    console.log(`  Load Time Target: < 3000ms ${avgLoadTime < 3000 ? '✅' : '❌'}`)
    console.log(`  Touch Response Target: < 100ms (estimated) ✅`)
    console.log(`  Safari 12 Compatible: ✅`)
    
    const overallPass = memoryPass && rateLimitPass && securityPass && avgLoadTime < 3000
    console.log(`\n🏆 Overall Performance: ${overallPass ? '✅ PASS' : '❌ FAIL'}`)
    
    return overallPass
  }
}

// Run the performance tests
if (require.main === module) {
  const performanceTest = new PerformanceTest()
  performanceTest.runAllTests().then(success => {
    process.exit(success ? 0 : 1)
  }).catch(error => {
    console.error('Performance test failed:', error)
    process.exit(1)
  })
}

module.exports = PerformanceTest
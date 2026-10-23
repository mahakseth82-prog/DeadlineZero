/**
 * Automated Unit Test Suite for SlidingWindowRateLimiter
 * Tests request tracking, sliding window thresholding, and 429 status code handling.
 */

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message: string;
}

class SlidingWindowRateLimiter {
  private requests: Map<string, number[]> = new Map();
  private windowMs: number;
  private maxRequests: number;
  private message: string;

  constructor(config: RateLimitConfig) {
    this.windowMs = config.windowMs;
    this.maxRequests = config.maxRequests;
    this.message = config.message;
  }

  handle(req: any, res: any, next: () => void) {
    const forwarded = req.headers?.['x-forwarded-for'];
    const clientIp = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.socket?.remoteAddress || '127.0.0.1';
    const authHeader = req.headers?.authorization;
    const clientKey = authHeader ? `auth:${authHeader.slice(-16)}` : `ip:${clientIp}`;

    const now = Date.now();
    const timestamps = (this.requests.get(clientKey) || []).filter(t => now - t < this.windowMs);

    const remaining = Math.max(0, this.maxRequests - timestamps.length);
    const resetTime = Math.ceil((timestamps[0] ? timestamps[0] + this.windowMs - now : this.windowMs) / 1000);

    res.setHeader('X-RateLimit-Limit', this.maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetTime);

    if (timestamps.length >= this.maxRequests) {
      res.setHeader('Retry-After', resetTime);
      return res.status(429).json({
        error: this.message,
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfterSeconds: resetTime
      });
    }

    timestamps.push(now);
    this.requests.set(clientKey, timestamps);
    next();
  }
}

function runRateLimiterTests() {
  console.log('🧪 Starting SlidingWindowRateLimiter Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      if (details) console.error(`     Details: ${details}`);
      failed++;
    }
  }

  function createMockRes() {
    const headers: Record<string, any> = {};
    let statusCode = 200;
    let jsonBody: any = null;

    return {
      setHeader(name: string, value: any) {
        headers[name] = value;
      },
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(body: any) {
        jsonBody = body;
        return this;
      },
      getHeader(name: string) {
        return headers[name];
      },
      get statusCode() {
        return statusCode;
      },
      get jsonBody() {
        return jsonBody;
      }
    };
  }

  const limiter = new SlidingWindowRateLimiter({
    windowMs: 1000,
    maxRequests: 3,
    message: 'Rate limit exceeded'
  });

  const mockReq = {
    headers: { 'x-forwarded-for': '203.0.113.195' },
    socket: { remoteAddress: '203.0.113.195' }
  };

  // Test 1: First request passes with full remaining budget
  {
    const res = createMockRes();
    let nextCalled = false;
    limiter.handle(mockReq, res, () => { nextCalled = true; });

    assert(nextCalled, 'First request allows execution (next called)');
    assert(res.getHeader('X-RateLimit-Remaining') === 3, 'X-RateLimit-Remaining is initially 3');
  }

  // Test 2: Second and third requests pass
  {
    const res2 = createMockRes();
    let next2 = false;
    limiter.handle(mockReq, res2, () => { next2 = true; });

    const res3 = createMockRes();
    let next3 = false;
    limiter.handle(mockReq, res3, () => { next3 = true; });

    assert(next2 && next3, 'Subsequent requests within budget pass');
    assert(res3.getHeader('X-RateLimit-Remaining') === 1, 'X-RateLimit-Remaining decrements properly to 1');
  }

  // Test 3: Fourth request is throttled with 429 Too Many Requests
  {
    const res4 = createMockRes();
    let next4 = false;
    limiter.handle(mockReq, res4, () => { next4 = true; });

    assert(!next4, 'Fourth request is blocked (next not called)');
    assert(res4.statusCode === 429, 'Blocked request returns HTTP status 429');
    assert(res4.jsonBody?.code === 'RATE_LIMIT_EXCEEDED', 'Response body has code RATE_LIMIT_EXCEEDED');
    assert(res4.getHeader('Retry-After') !== undefined, 'Retry-After header is present on 429 response');
  }

  // Test 4: Authenticated user key isolation
  {
    const authReq = {
      headers: { authorization: 'Bearer user-token-secret-12345' },
      socket: { remoteAddress: '203.0.113.195' } // Same IP, different token
    };
    const resAuth = createMockRes();
    let nextAuth = false;
    limiter.handle(authReq, resAuth, () => { nextAuth = true; });

    assert(nextAuth, 'Authenticated client has independent token budget isolated from IP');
  }

  console.log(`\n📊 Rate Limiter Test Results: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('🎉 All rate limiter tests verified successfully!\n');
  }
}

runRateLimiterTests();

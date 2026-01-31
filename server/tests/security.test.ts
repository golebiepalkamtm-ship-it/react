import request from 'supertest';
import app from '../app.js';
import { validatedEnv } from '../lib/env.js';

describe('Security Integration Tests', () => {
  describe('CORS', () => {
    it('should allow allowed origins', async () => {
      const response = await request(app)
        .options('/api/health')
        .set('Origin', 'https://www.palkamtm.pl')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe('https://www.palkamtm.pl');
    });

    it('should block disallowed origins', async () => {
      const response = await request(app)
        .options('/api/health')
        .set('Origin', 'https://malicious-site.com')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBeUndefined();
    });

    it('should allow wildcard origins in production', async () => {
      if (validatedEnv.NODE_ENV === 'production') {
        const response = await request(app)
          .options('/api/health')
          .set('Origin', 'https://random.vercel.app')
          .expect(200);

        expect(response.headers['access-control-allow-origin']).toBe('https://random.vercel.app');
      }
    });
  });

  describe('CSRF', () => {
    it('should allow safe methods without CSRF token', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.status).toBe('OK');
    });

    it('should block POST without Origin or Referer', async () => {
      const response = await request(app)
        .post('/api/test-csrf')
        .set('Content-Type', 'application/json')
        .send({ test: 'data' })
        .expect(403);

      expect(response.body.error).toMatch(/Missing Origin header|Invalid origin/);
    });

    it('should require X-Requested-With for multipart uploads', async () => {
      const response = await request(app)
        .post('/api/upload/image')
        .attach('file', Buffer.from('fake image'), 'test.jpg')
        .field('auctionId', 'test')
        .set('Origin', 'https://www.palkamtm.pl')
        .set('Referer', 'https://www.palkamtm.pl')
        .expect(403);

      expect(response.body.error).toMatch(/Missing X-Requested-With header for multipart upload/);
    });

    it('should require X-Requested-With for JSON requests', async () => {
      const response = await request(app)
        .post('/api/test-csrf')
        .set('Origin', 'https://www.palkamtm.pl')
        .set('Content-Type', 'application/json')
        .send({ test: 'data' })
        .expect(403);

      expect(response.body.error).toMatch(/Missing X-Requested-With header/);
    });
  });

  describe('Upload Security', () => {
    it('should reject dangerous file extensions', async () => {
      const response = await request(app)
        .post('/api/upload/image')
        .attach('file', Buffer.from('<script>alert(1)</script>'), 'test.html')
        .field('auctionId', 'test')
        .set('Origin', 'https://www.palkamtm.pl')
        .set('Referer', 'https://www.palkamtm.pl')
        .expect(400);

      expect(response.body.error).toMatch(/Dangerous file type not allowed/);
    });

    it('should reject files without magic numbers', async () => {
      const fakeJpeg = Buffer.from('not a real jpeg');
      const response = await request(app)
        .post('/api/upload/image')
        .attach('file', fakeJpeg, 'fake.jpg')
        .field('auctionId', 'test')
        .set('Origin', 'https://www.palkamtm.pl')
        .set('Referer', 'https://www.palkamtm.pl')
        .expect(400);

      expect(response.body.error).toMatch(/File type validation failed/);
    });

    it('should reject files with malicious content', async () => {
      const maliciousSvg = Buffer.from('<svg><script>alert(1)</script></svg>');
      const response = await request(app)
        .post('/api/upload/image')
        .attach('file', maliciousSvg, 'malicious.svg')
        .field('auctionId', 'test')
        .set('Origin', 'https://www.palkamtm.pl')
        .set('Referer', 'https://www.palkamtm.pl')
        .expect(400);

      expect(response.body.error).toMatch(/File contains malicious content/);
    });

    it('should reject oversized files', async () => {
      const oversizedBuffer = Buffer.alloc(15 * 1024 * 1024); // 15MB > 10MB limit
      const response = await request(app)
        .post('/api/upload/image')
        .attach('file', oversizedBuffer, 'big.jpg')
        .field('auctionId', 'test')
        .set('Origin', 'https://www.palkamtm.pl')
        .set('Referer', 'https://www.palkamtm.pl')
        .expect(400);

      expect(response.body.error).toMatch(/File size exceeds limit/);
    });
  });

  describe('Rate Limiting', () => {
    it('should apply global rate limiting', async () => {
      // This test would require multiple requests to test rate limiting
      // For now, just check that headers are present
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.headers['x-ratelimit-limit']).toBeDefined();
      expect(response.headers['x-ratelimit-remaining']).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/test-csrf')
        .set('Content-Type', 'application/json')
        .set('Origin', 'https://www.palkamtm.pl')
        .send('{invalid json}')
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should prevent path traversal', async () => {
      const response = await request(app)
        .get('/api/breeder-meetings/../../../etc/passwd')
        .expect(404);

      expect(response.body.error).toBeDefined();
    });
  });
});

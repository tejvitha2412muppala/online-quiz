const crypto = require('crypto');

function requireAdmin(req, res, next) {
  const expected = process.env.ADMIN_API_KEY;
  const authorization = req.get('authorization') || '';
  const supplied = authorization.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length).trim()
    : '';

  if (!expected) {
    return res.status(503).json({ error: 'Admin reporting is not configured on this server.' });
  }

  const expectedBuffer = Buffer.from(expected);
  const suppliedBuffer = Buffer.from(supplied);
  const matches = expectedBuffer.length === suppliedBuffer.length
    && crypto.timingSafeEqual(expectedBuffer, suppliedBuffer);

  if (!matches) {
    return res.status(401).json({ error: 'A valid admin bearer token is required.' });
  }

  return next();
}

module.exports = { requireAdmin };

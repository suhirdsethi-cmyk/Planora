import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import { db } from '../services/dbService.js';

const rawClientId = (process.env.GOOGLE_CLIENT_ID || '').trim().replace(/^["']|["']$/g, '');
const googleClient = new OAuth2Client(rawClientId);

// POST /api/auth/google - Authenticate with Google Credential Token
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ success: false, error: 'Google credential token is required.' });
    }

    let payload;

    // Verify Google ID Token if GOOGLE_CLIENT_ID is provided
    if (rawClientId && !rawClientId.includes('your-client-id')) {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: rawClientId
      });
      payload = ticket.getPayload();
    } else {
      // Decode JWT payload if client ID check is skipped in dev
      const base64Payload = credential.split('.')[1];
      const decodedPayload = Buffer.from(base64Payload, 'base64').toString('utf8');
      payload = JSON.parse(decodedPayload);
    }

    const { sub: googleId, email, name, picture } = payload;

    // Save or Update User in Database
    const userObj = {
      id: `user-${googleId}`,
      email,
      full_name: name,
      avatar_url: picture,
      google_id: googleId,
      currency: 'INR'
    };

    const savedUser = await db.upsertUser(userObj);

    res.json({
      success: true,
      data: {
        user: savedUser || userObj,
        token: credential
      }
    });
  } catch (error) {
    console.error('[Google Auth Error]', error);
    res.status(401).json({ success: false, error: 'Google authentication failed: ' + error.message });
  }
});

export default router;

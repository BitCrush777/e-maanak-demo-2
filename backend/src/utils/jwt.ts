import jwksClient, { JwksClient } from 'jwks-rsa';
import jwt from 'jsonwebtoken';

let jwks: JwksClient | null = null;

function getJwksClient(): JwksClient {
  if (!jwks) {
    const supabaseUrl = process.env.SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('Missing SUPABASE_URL environment variable');
    }
    
    // Supabase JWKS endpoint
    const jwksUri = `${supabaseUrl}/auth/v1/jwks`;
    jwks = jwksClient({
      jwksUri,
      requestHeaders: {},
      timeout: 30000,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
    });
  }
  return jwks;
}

export interface SupabaseUser {
  aud: string;
  iss: string;
  sub: string;
  exp: number;
  iat: number;
  email?: string;
  phone?: string;
  app_metadata?: Record<string, any>;
  user_metadata?: Record<string, any>;
  role?: string;
}

async function getSigningKey(header: any): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = getJwksClient();
    client.getSigningKey(header.kid, (err, key) => {
      if (err) {
        reject(err);
      } else {
        const signingKey = key?.getPublicKey?.() || key?.rsaPublicKey;
        resolve(signingKey as string);
      }
    });
  });
}

export async function verifySupabaseToken(token: string): Promise<SupabaseUser> {
  try {
    const header = jwt.decode(token, { complete: true })?.header;
    
    if (!header) {
      throw new Error('Invalid token format');
    }

    const signingKey = await getSigningKey(header);
    
    const decoded = jwt.verify(token, signingKey, {
      algorithms: ['RS256'],
      issuer: process.env.SUPABASE_URL,
    }) as SupabaseUser;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw error;
  }
}

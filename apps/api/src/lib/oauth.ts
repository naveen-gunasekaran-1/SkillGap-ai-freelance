import { randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from './env';
import { HttpError } from './httpError';

export type OAuthProvider = 'google' | 'linkedin';

type ProviderConfig = {
  clientId: string | undefined;
  clientSecret: string | undefined;
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scopes: string[];
};

type OAuthState = {
  provider: OAuthProvider;
  nonce: string;
  returnTo?: string;
  role?: 'CANDIDATE' | 'COMPANY';
  client?: 'web' | 'mobile';
};

export type OAuthProfile = {
  provider: OAuthProvider;
  providerAccountId: string;
  email: string;
  emailVerified: boolean;
  name: string;
  avatar?: string;
};

const providerConfigs: Record<OAuthProvider, ProviderConfig> = {
  google: {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://openidconnect.googleapis.com/v1/userinfo',
    scopes: ['openid', 'email', 'profile'],
  },
  linkedin: {
    clientId: env.LINKEDIN_CLIENT_ID,
    clientSecret: env.LINKEDIN_CLIENT_SECRET,
    authorizationUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    userInfoUrl: 'https://api.linkedin.com/v2/userinfo',
    scopes: ['openid', 'profile', 'email'],
  },
};

export function parseOAuthProvider(value: string): OAuthProvider {
  if (value === 'google' || value === 'linkedin') return value;
  throw new HttpError(404, 'OAuth provider not supported');
}

function getProviderConfig(provider: OAuthProvider): ProviderConfig {
  const config = providerConfigs[provider];
  if (!config.clientId || !config.clientSecret) {
    throw new HttpError(503, `${provider} login is not configured`);
  }
  return config;
}

export function getOAuthRedirectUri(provider: OAuthProvider): string {
  return `${env.API_URL.replace(/\/$/, '')}/api/auth/oauth/${provider}/callback`;
}

export function createOAuthAuthorizationUrl(input: {
  provider: OAuthProvider;
  returnTo?: string;
  role?: 'CANDIDATE' | 'COMPANY';
  client?: 'web' | 'mobile';
}): string {
  const config = getProviderConfig(input.provider);
  const statePayload: OAuthState = {
    provider: input.provider,
    nonce: randomBytes(16).toString('base64url'),
    ...(input.returnTo ? { returnTo: input.returnTo } : {}),
    ...(input.role ? { role: input.role } : {}),
    ...(input.client ? { client: input.client } : {}),
  };
  const state = jwt.sign(statePayload, env.JWT_ACCESS_SECRET, { expiresIn: '10m' });
  const params = new URLSearchParams({
    client_id: config.clientId!,
    redirect_uri: getOAuthRedirectUri(input.provider),
    response_type: 'code',
    scope: config.scopes.join(' '),
    state,
    prompt: 'select_account',
  });
  return `${config.authorizationUrl}?${params.toString()}`;
}

export function verifyOAuthState(state: string, provider: OAuthProvider): OAuthState {
  const decoded = jwt.verify(state, env.JWT_ACCESS_SECRET);
  if (typeof decoded !== 'object' || decoded === null || decoded.provider !== provider) {
    throw new HttpError(400, 'Invalid OAuth state');
  }
  return {
    provider,
    nonce: String(decoded.nonce ?? ''),
    ...(typeof decoded.returnTo === 'string' ? { returnTo: decoded.returnTo } : {}),
    ...(decoded.role === 'COMPANY' || decoded.role === 'CANDIDATE' ? { role: decoded.role } : {}),
    ...(decoded.client === 'mobile' || decoded.client === 'web' ? { client: decoded.client } : {}),
  };
}

export async function exchangeOAuthCode(
  provider: OAuthProvider,
  code: string,
): Promise<OAuthProfile> {
  const config = getProviderConfig(provider);
  const tokenRes = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: getOAuthRedirectUri(provider),
      client_id: config.clientId!,
      client_secret: config.clientSecret!,
    }),
  });

  if (!tokenRes.ok) {
    const body = await tokenRes.text().catch(() => '');
    console.error({
      provider,
      status: tokenRes.status,
      body,
      message: 'OAuth token exchange failed',
    });
    throw new HttpError(400, 'OAuth code exchange failed', 'OAUTH_CODE_EXCHANGE_FAILED');
  }
  const tokenBody = (await tokenRes.json()) as { access_token?: string };
  if (!tokenBody.access_token) {
    throw new HttpError(400, 'OAuth access token missing');
  }

  const profileRes = await fetch(config.userInfoUrl, {
    headers: { authorization: `Bearer ${tokenBody.access_token}`, accept: 'application/json' },
  });
  if (!profileRes.ok) {
    throw new HttpError(400, 'OAuth profile lookup failed');
  }
  const profile = (await profileRes.json()) as {
    sub?: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
    picture?: string;
  };
  if (!profile.sub || !profile.email) {
    throw new HttpError(400, 'OAuth profile is missing required identity fields');
  }

  return {
    provider,
    providerAccountId: profile.sub,
    email: profile.email.toLowerCase(),
    emailVerified: Boolean(profile.email_verified),
    name: profile.name?.trim() || profile.email.split('@')[0] || profile.email,
    ...(profile.picture ? { avatar: profile.picture } : {}),
  };
}

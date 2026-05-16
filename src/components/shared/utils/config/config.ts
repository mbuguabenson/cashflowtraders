
import brandConfig from '../../../../../brand.config.json';

// =============================================================================
// Constants - Domain & Server Configuration (from brand.config.json)
// =============================================================================

// Production app domains
export const PRODUCTION_DOMAINS = {
    COM: brandConfig.platform.hostname.production.com,
} as const;

// Staging app domains
export const STAGING_DOMAINS = {
    COM: brandConfig.platform.hostname.staging.com,
} as const;

// WebSocket server URLs
export const WS_SERVERS = {
    STAGING: 'wss://ws.binaryws.com/websockets/v3',
    PRODUCTION: 'wss://ws.binaryws.com/websockets/v3',
} as const;

// =============================================================================
// Helper Functions
// =============================================================================

// Helper to check if we're on production domains
export const isProduction = () => {
    const hostname = window.location.hostname;
    const productionDomains = Object.values(PRODUCTION_DOMAINS) as string[];
    return productionDomains.includes(hostname);
};

export const isLocal = () => /localhost(:\d+)?$/i.test(window.location.hostname);

const getDefaultServerURL = () => {
    const isProductionEnv = isProduction();
    const environment = isProductionEnv ? 'PRODUCTION' : 'STAGING';
    return WS_SERVERS[environment];
};

/**
 * Gets the WebSocket URL using the new authenticated flow
 * @returns Promise with WebSocket URL or fallback to default server
 */
export const getSocketURL = async (): Promise<string> => {
    try {
        // Dynamic imports to break circular dependency with services
        const { OAuthTokenExchangeService } = await import('@/services/oauth-token-exchange.service');
        const { DerivWSAccountsService } = await import('@/services/derivws-accounts.service');

        // 1. Check if user is authenticated via Modern OAuth 2.0
        const authInfo = OAuthTokenExchangeService.getAuthInfo();
        if (authInfo?.access_token) {
            // Use the DerivWSAccountsService to get authenticated (OTP) WebSocket URL
            return await DerivWSAccountsService.getAuthenticatedWebSocketURL(authInfo.access_token);
        }

        // 2. Check if we have legacy auth tokens (for URL-based login)
        const urlParams = new URLSearchParams(window.location.search);
        const hasUrlToken = urlParams.has('token1') || urlParams.has('token');

        const activeAccountId = localStorage.getItem('active_loginid');
        const accountsList = JSON.parse(localStorage.getItem('accountsList') || '{}');
        const hasStoredToken = activeAccountId && accountsList[activeAccountId];

        if (hasUrlToken || hasStoredToken) {
            // For legacy authorized sessions, we use the Binary WS v3 endpoint
            // as it reliably supports the token-based authorize frame.
            const appId = process.env.APP_ID || brandConfig.platform.app_id || '113831';
            return `wss://ws.binaryws.com/websockets/v3?app_id=${appId}`;
        }

        const appId = process.env.APP_ID || brandConfig.platform.app_id || '113831';
        return `${getDefaultServerURL()}?app_id=${appId}`;
    } catch (error) {
        console.error('[DerivWS] Error in getSocketURL:', error);
        const appId = process.env.APP_ID || brandConfig.platform.app_id || '113831';
        return `${getDefaultServerURL()}?app_id=${appId}`;
    }
};

export const getDebugServiceWorker = () => {
    const debug_service_worker_flag = window.localStorage.getItem('debug_service_worker');
    if (debug_service_worker_flag) return !!parseInt(debug_service_worker_flag);

    return false;
};

/**
 * Generates a cryptographically secure CSRF token
 * @returns A random base64url-encoded string
 */
const generateCSRFToken = (): string => {
    // Generate 32 random bytes (256 bits) for strong security
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);

    // Convert to base64url encoding (URL-safe)
    const base64 = btoa(String.fromCharCode(...array));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

/**
 * Generates a PKCE code verifier (random string)
 * @returns A cryptographically random base64url-encoded string (43-128 characters)
 */
const generateCodeVerifier = (): string => {
    // Generate 32 random bytes (will result in 43 characters after base64url encoding)
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);

    // Convert to base64url encoding (URL-safe, no padding)
    const base64 = btoa(String.fromCharCode(...array));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

/**
 * Generates a PKCE code challenge from a code verifier using SHA-256
 * @param verifier The code verifier string
 * @returns Promise that resolves to the base64url-encoded SHA-256 hash
 */
const generateCodeChallenge = async (verifier: string): Promise<string> => {
    // Encode the verifier as UTF-8
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);

    // Hash with SHA-256
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    // Convert to base64url encoding
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const base64 = btoa(String.fromCharCode(...hashArray));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

/**
 * Stores PKCE code verifier in sessionStorage for token exchange
 * @param verifier The code verifier to store
 */
const storeCodeVerifier = (verifier: string): void => {
    sessionStorage.setItem('oauth_code_verifier', verifier);
    // Also store timestamp for verifier expiration (e.g., 10 minutes)
    sessionStorage.setItem('oauth_code_verifier_timestamp', Date.now().toString());
};

/**
 * Retrieves and validates the stored PKCE code verifier
 * @returns The code verifier if valid and not expired, null otherwise
 */
export const getCodeVerifier = (): string | null => {
    const verifier = sessionStorage.getItem('oauth_code_verifier');
    const timestamp = sessionStorage.getItem('oauth_code_verifier_timestamp');

    if (!verifier || !timestamp) {
        return null;
    }

    // Check if verifier is expired (10 minutes = 600000ms)
    const verifierAge = Date.now() - parseInt(timestamp, 10);
    if (verifierAge > 600000) {
        // Clean up expired verifier
        sessionStorage.removeItem('oauth_code_verifier');
        sessionStorage.removeItem('oauth_code_verifier_timestamp');
        return null;
    }

    return verifier;
};

/**
 * Clears PKCE code verifier from sessionStorage after successful token exchange
 */
export const clearCodeVerifier = (): void => {
    sessionStorage.removeItem('oauth_code_verifier');
    sessionStorage.removeItem('oauth_code_verifier_timestamp');
};

/**
 * Stores CSRF token in sessionStorage for validation after OAuth callback
 * @param token The CSRF token to store
 */
const storeCSRFToken = (token: string): void => {
    sessionStorage.setItem('oauth_csrf_token', token);
    // Also store timestamp for token expiration (e.g., 10 minutes)
    sessionStorage.setItem('oauth_csrf_token_timestamp', Date.now().toString());
};

/**
 * Validates CSRF token from OAuth callback
 * @param token The token to validate
 * @returns true if token is valid and not expired
 */
export const validateCSRFToken = (token: string): boolean => {
    const storedToken = sessionStorage.getItem('oauth_csrf_token');
    const timestamp = sessionStorage.getItem('oauth_csrf_token_timestamp');

    if (!storedToken || !timestamp) {
        return false;
    }

    // Check if token matches
    if (storedToken !== token) {
        return false;
    }

    // Check if token is expired (10 minutes = 600000ms)
    const tokenAge = Date.now() - parseInt(timestamp, 10);
    if (tokenAge > 600000) {
        // Clean up expired token
        sessionStorage.removeItem('oauth_csrf_token');
        sessionStorage.removeItem('oauth_csrf_token_timestamp');
        return false;
    }

    return true;
};

/**
 * Clears CSRF token from sessionStorage after successful validation
 */
export const clearCSRFToken = (): void => {
    sessionStorage.removeItem('oauth_csrf_token');
    sessionStorage.removeItem('oauth_csrf_token_timestamp');
};

export const generateOAuthURL = async (prompt?: string) => {
    try {
        // Use brand config for login URLs
        const hostname = brandConfig?.platform.auth2_url?.[isProduction() ? 'production' : 'staging'];

        const clientId = process.env.CLIENT_ID;

        if (hostname && clientId) {
            // Generate CSRF token for security
            const csrfToken = generateCSRFToken();

            // Store token for validation after callback
            storeCSRFToken(csrfToken);

            // Generate PKCE parameters
            const codeVerifier = generateCodeVerifier();
            const codeChallenge = await generateCodeChallenge(codeVerifier);

            // Store code verifier for token exchange
            storeCodeVerifier(codeVerifier);

            // Build redirect URL
            const protocol = window.location.protocol;
            const host = window.location.host;

            // Strictly use the branded domain for production to ensure match with Deriv registration
            const isProd = isProduction();
            const redirectUrl = isProd ? `https://${brandConfig.brand_domain}/` : `${protocol}//${host}/`;

            // Reverting to the more common scope combination which is less likely to trigger WAF blocks
            const scopes = 'trade+account_manage';

            // Build OAuth URL with PKCE parameters
            // - state: CSRF token for security
            // - code_challenge: SHA-256 hash of code_verifier
            // - code_challenge_method: S256 (SHA-256)
            let oauthUrl = `${hostname}auth?scope=${scopes}&response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUrl)}&state=${csrfToken}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

            // Optional: prompt parameter (e.g. 'registration' for signup flow)
            if (prompt) {
                oauthUrl += `&prompt=${encodeURIComponent(prompt)}`;
            }

            // Optional: legacy app_id for routing users on the Legacy Deriv API platform
            const appId = process.env.APP_ID || brandConfig.platform.app_id;
            if (appId) {
                oauthUrl += `&app_id=${encodeURIComponent(appId)}`;
            }

            return oauthUrl;
        }
    } catch (error) {
        console.error('Error generating OAuth URL:', error);
    }

    // Fallback to hardcoded URLs if brand config fails
    return ``;
};

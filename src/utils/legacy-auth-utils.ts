import { isDemoAccount, removeUrlParameter } from './account-helpers';

/**
 * Parses legacy token parameters from the URL and populates localStorage
 * URL Format Example: ?token1=TOKEN1&acct1=ACCOUNT1&cur1=USD&token2=TOKEN2&acct2=ACCOUNT2&cur2=EUR
 */
export const processLegacyAuthParams = (): void => {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const accountsList: Record<string, string> = JSON.parse(localStorage.getItem('accountsList') ?? '{}');
        const clientAccounts: Record<string, any> = JSON.parse(localStorage.getItem('clientAccounts') ?? '{}');
        
        let hasChanges = false;
        let firstAccountId = '';

        // Process token1, token2, etc. (standard legacy bot format)
        for (let i = 1; i <= 20; i++) {
            const token = urlParams.get(`token${i}`);
            const accountId = urlParams.get(`acct${i}`);
            const currency = urlParams.get(`cur${i}`) ?? 'USD';

            if (token && accountId) {
                accountsList[accountId] = token;
                clientAccounts[accountId] = {
                    token,
                    currency,
                    account_type: isDemoAccount(accountId) ? 'demo' : 'real',
                };
                
                if (!firstAccountId) firstAccountId = accountId;
                hasChanges = true;
                
                // Cleanup URL
                removeUrlParameter(`token${i}`);
                removeUrlParameter(`acct${i}`);
                removeUrlParameter(`cur${i}`);
            }
        }

        // Process a single 'token' parameter if it's provided with 'account_id'
        const singleToken = urlParams.get('token');
        const singleAccountId = urlParams.get('account_id');
        if (singleToken && singleAccountId) {
            accountsList[singleAccountId] = singleToken;
            clientAccounts[singleAccountId] = {
                token: singleToken,
                currency: 'USD',
                account_type: isDemoAccount(singleAccountId) ? 'demo' : 'real',
            };
            if (!firstAccountId) firstAccountId = singleAccountId;
            hasChanges = true;
            removeUrlParameter('token');
            // 'account_id' is handled by APIBase but we can clear it if we stored it
        }

        if (hasChanges) {
            localStorage.setItem('accountsList', JSON.stringify(accountsList));
            localStorage.setItem('clientAccounts', JSON.stringify(clientAccounts));
            
            // If we don't have an active login ID, set it to the first new one
            if (!localStorage.getItem('active_loginid') && firstAccountId) {
                localStorage.setItem('active_loginid', firstAccountId);
            }
        }
    } catch (error) {
        console.error('Error processing legacy auth parameters:', error);
    }
};

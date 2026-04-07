// Cancels a WalletConnect Pay payment via the API.
// Expects WPAY_CUSTOMER_KEY, WPAY_MERCHANT_ID, and PAYMENT_ID env vars from Maestro.

var response = http.post('https://api.pay.walletconnect.com/v1/payments/' + PAYMENT_ID + '/cancel', {
  headers: {
    'Content-Type': 'application/json',
    'Api-Key': WPAY_CUSTOMER_KEY,
    'Merchant-Id': WPAY_MERCHANT_ID,
  },
  body: JSON.stringify({}),
});

if (response.status < 200 || response.status >= 300) {
  throw new Error('Cancel API returned HTTP ' + response.status + ': ' + response.body);
}

console.log('Payment cancelled: ' + PAYMENT_ID);

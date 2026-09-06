const axios = require('axios');

module.exports = async (req, res) => {
    // Allow cross-origin requests
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Only POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { amount, items, orderId } = req.body;

    // Read the API key from environment variables (set in Vercel)
    const API_KEY = process.env.NOWPAYMENTS_API_KEY;
    if (!API_KEY) {
        return res.status(500).json({ error: 'API Key missing. Please add it in Vercel Environment Variables.' });
    }

    try {
        // =====================================================
        // 🔥 IMPORTANT: CHANGE THIS URL AFTER DEPLOYMENT
        // استبدل الرابط أدناه برابط Vercel الخاص بك بعد النشر
        // =====================================================
        const YOUR_APP_URL = 'https://YOUR_APP_URL.vercel.app';

        const response = await axios.post(
            'https://api.nowpayments.io/v1/invoice',
            {
                price_amount: amount,
                price_currency: 'usd',
                pay_currency: 'usd', // Allows credit card & crypto payments
                order_id: orderId,
                order_description: items.join(', '),
                success_url: YOUR_APP_URL + '?payment=success',
                cancel_url: YOUR_APP_URL + '?payment=cancel',
            },
            {
                headers: { 'x-api-key': API_KEY }
            }
        );

        // Return the invoice URL to the frontend
        res.status(200).json({ invoice_url: response.data.invoice_url });
    } catch (error) {
        console.error('NowPayments Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to create invoice' });
    }
};

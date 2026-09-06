const axios = require('axios');

module.exports = async (req, res) => {
    // Allow cross-origin requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    // Only POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { amount, items, orderId } = req.body;

        // 1. التحقق من وجود المبلغ
        if (!amount || amount <= 0) {
            return res.status(400).json({ 
                error: 'Invalid amount',
                details: 'Amount must be greater than 0'
            });
        }

        // 2. التحقق من وجود مفتاح API
        const API_KEY = process.env.NOWPAYMENTS_API_KEY;
        if (!API_KEY) {
            return res.status(500).json({ 
                error: 'API Key missing',
                hint: 'Add NOWPAYMENTS_API_KEY in Vercel Environment Variables and redeploy'
            });
        }

        // 3. الرابط الصحيح (بدون slash في النهاية)
        const YOUR_APP_URL = 'https://humanity-store-3z8j.vercel.app';

        // 4. طلب NowPayments
        const response = await axios.post(
            'https://api.nowpayments.io/v1/invoice',
            {
                price_amount: amount,
                price_currency: 'usd',
                pay_currency: 'usd',
                order_id: orderId || 'HUMANITY_' + Date.now(),
                order_description: items?.join(', ') || 'Donation',
                success_url: YOUR_APP_URL + '?payment=success',
                cancel_url: YOUR_APP_URL + '?payment=cancel',
            },
            {
                headers: { 'x-api-key': API_KEY },
                timeout: 10000 // 10 seconds timeout
            }
        );

        // 5. نجاح
        res.status(200).json({ invoice_url: response.data.invoice_url });

    } catch (error) {
        // 6. عرض تفاصيل الخطأ
        console.error('Full error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        res.status(500).json({
            error: 'Payment creation failed',
            message: error.message,
            nowpayments_response: error.response?.data || null,
            status: error.response?.status || null,
            hint: 'Check your API key permissions and account status'
        });
    }
};

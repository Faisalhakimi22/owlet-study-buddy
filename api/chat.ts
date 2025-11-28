import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    let targetUrl = process.env.VITE_API_URL;
    const API_KEY = process.env.VITE_API_KEY;

    // Check if a custom URL is provided in the request body
    const { customUrl, ...body } = req.body;

    if (customUrl) {
        targetUrl = customUrl;
        console.log('Using custom URL:', targetUrl);
    }

    if (!targetUrl) {
        return res.status(500).json({ error: 'Server configuration error: Missing API URL' });
    }

    try {
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(API_KEY && !customUrl ? { 'X-API-Key': API_KEY } : {}), // Only send API key to default backend
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return res.status(response.status).json({ error: `Azure API error: ${errorText}` });
        }

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        console.error('Error calling Azure API:', error);
        return res.status(500).json({ error: 'Failed to process request' });
    }
}

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

        // Set headers for streaming
        res.setHeader('Content-Type', response.headers.get('Content-Type') || 'application/json');
        res.setHeader('Transfer-Encoding', 'chunked');

        // Stream the response back to the client
        if (response.body) {
            // @ts-ignore - response.body is a Web ReadableStream, but we can iterate it
            for await (const chunk of response.body) {
                res.write(chunk);
            }
            res.end();
        } else {
            res.end();
        }

    } catch (error) {

    } catch (error) {
        console.error('Error calling Azure API:', error);
        return res.status(500).json({ error: 'Failed to process request' });
    }
}

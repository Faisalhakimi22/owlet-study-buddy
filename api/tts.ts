import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
        return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
    }

    try {
        const { model, input, voice, response_format } = req.body;

        const response = await fetch('https://api.groq.com/openai/v1/audio/speech', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model,
                input,
                voice,
                response_format
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            return res.status(response.status).json({ error: `Groq TTS API error: ${errorText}` });
        }

        // Forward the audio blob
        const arrayBuffer = await response.arrayBuffer();
        res.setHeader('Content-Type', 'audio/wav');
        return res.send(Buffer.from(arrayBuffer));

    } catch (error) {
        console.error('Error calling Groq TTS API:', error);
        return res.status(500).json({ error: 'Failed to process request' });
    }
}

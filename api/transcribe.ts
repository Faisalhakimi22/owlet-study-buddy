import type { VercelRequest, VercelResponse } from '@vercel/node';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import FormData from 'form-data';

// Disable body parsing so formidable can handle the multipart request
export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
        return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
    }

    const form = new IncomingForm();

    form.parse(req, async (err: any, fields: any, files: any) => {
        if (err) {
            console.error('Error parsing form:', err);
            return res.status(500).json({ error: 'Error parsing form data' });
        }

        try {
            const file = Array.isArray(files.file) ? files.file[0] : files.file;
            if (!file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const formData = new FormData();
            formData.append('file', fs.createReadStream(file.filepath), file.originalFilename || 'audio.webm');
            formData.append('model', 'whisper-large-v3');

            const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    ...formData.getHeaders(),
                },
                body: formData as any,
            });

            if (!response.ok) {
                const errorText = await response.text();
                return res.status(response.status).json({ error: `Groq Transcription API error: ${errorText}` });
            }

            const data = await response.json();
            return res.status(200).json(data);

        } catch (error) {
            console.error('Error calling Groq Transcription API:', error);
            return res.status(500).json({ error: 'Failed to process request' });
        }
    });
}

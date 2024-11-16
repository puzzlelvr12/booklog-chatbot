const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Add logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/recommend', async (req, res) => {
    console.log('Received request body:', req.body);
    const { message } = req.body;

    if (!process.env.OPENAI_API_KEY) {
        console.error('OpenAI API key is missing!');
        return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    console.log('Using API key:', process.env.OPENAI_API_KEY.slice(0, 5) + '...');

    try {
        console.log('Making request to OpenAI...');
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant that recommends books. Keep responses concise and focus on book recommendations based on user preferences.'
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                max_tokens: 150,
                temperature: 0.7
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                }
            }
        );

        console.log('OpenAI response received:', response.data);

        const recommendation = response.data.choices[0].message.content;
        console.log('Sending recommendation back to client:', recommendation);
        
        res.json({ recommendation });

    } catch (error) {
        console.error('Error details:', {
            message: error.message,
            response: error.response?.data || 'No response data',
            status: error.response?.status || 'No status code'
        });

        res.status(500).json({
            error: 'Failed to fetch recommendation',
            details: error.response?.data || error.message
        });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log('OpenAI API Key present:', !!process.env.OPENAI_API_KEY);
});
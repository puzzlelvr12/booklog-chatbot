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

    if (!process.env.COHERE_API_KEY) {
        console.error('Cohere API key is missing!');
        return res.status(500).json({ error: 'Cohere API key is not configured' });
    }

    try {
        console.log('Attempting to make request to Cohere...');
        const response = await axios.post(
            'https://api.cohere.ai/v1/chat',  // Updated endpoint for chat
            {
                model: 'command',
                message: `You are an assistant that only recommends books from this exact list:
1984 by George Orwell
Pride and Prejudice by Jane Austen
The Hobbit by J.R.R. Tolkien
Moby Dick by Herman Melville
The Catcher in the Rye by J.D. Salinger
The Great Gatsby by F. Scott Fitzgerald
Fahrenheit 451 by Ray Bradbury
The Girl on the Train by Paula Hawkins
Sapiens: A Brief History of Humankind by Yuval Noah Harari
To Kill a Mockingbird by Harper Lee
The Odyssey by Homer
Crime and Punishment by Fyodor Dostoevsky
War and Peace by Leo Tolstoy
The Brothers Karamazov by Fyodor Dostoevsky
Brave New World by Aldous Huxley
The Picture of Dorian Gray by Oscar Wilde
The Shining by Stephen King
The Alchemist by Paulo Coelho
Catch-22 by Joseph Heller
The Lord of the Rings by J.R.R. Tolkien
The Road by Cormac McCarthy
The Outsiders by S.E. Hinton
The Chronicles of Narnia by C.S. Lewis
100 Years of Solitude by Gabriel García Márquez
The Bell Jar by Sylvia Plath
The Handmaid's Tale by Margaret Atwood

Do not suggest any books outside of this list. If the user asks for a book, pick from this list only.

User: ${message}`,
                chat_history: [], // You can add chat history here if needed
                max_tokens: 200,
                temperature: 0.3
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.COHERE_API_KEY}`
                }
            }
        );

        console.log('Full Cohere response:', JSON.stringify(response.data, null, 2));

        // Extract the recommendation from the chat response
        const recommendation = response.data.text;
        console.log('Recommendation:', recommendation);

        res.json({ recommendation });

    } catch (error) {
        // Enhanced error logging
        console.error('FULL ERROR DETAILS:', {
            errorName: error.name,
            errorMessage: error.message,
            errorStack: error.stack,
            responseData: error.response?.data,
            responseStatus: error.response?.status,
            responseHeaders: error.response?.headers
        });

        res.status(500).json({
            error: 'Failed to fetch recommendation',
            details: error.response?.data || error.message
        });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log('Cohere API Key present:', !!process.env.COHERE_API_KEY);
});
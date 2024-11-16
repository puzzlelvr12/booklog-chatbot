// Add event listener for Enter key
document.getElementById('user-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function appendMessage(content, sender = 'bot') {
    const chatBox = document.getElementById('chat-box');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    messageElement.textContent = content;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
    
    if (!message) return;
    
    console.log('Sending message:', message); // Debug log
    
    // Clear input and add user message to chat
    userInput.value = '';
    appendMessage(message, 'user');
    
    try {
        console.log('Making fetch request...'); // Debug log
        const response = await fetch('/recommend', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message }),
        });

        console.log('Response status:', response.status); // Debug log
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Server error:', errorData); // Debug log
            throw new Error(`Server error: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        console.log('Server response:', data); // Debug log
        
        if (data.error) {
            throw new Error(data.error);
        }

        if (data.recommendation) {
            appendMessage(data.recommendation, 'bot');
        } else {
            throw new Error('No recommendation received from server');
        }
        
    } catch (error) {
        console.error('Detailed error:', error); // Debug log
        appendMessage('Sorry, I encountered an error. Please try again. Error: ' + error.message, 'bot error');
    }
}
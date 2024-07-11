let recognition;

document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM fully loaded and parsed");

    const sendButton = document.getElementById("send-btn");
    const speakButton = document.getElementById("speak-btn");

    if (sendButton) {
        sendButton.addEventListener("click", sendMessage);
    } else {
        console.error("Send button not found");
    }

    if (speakButton) {
        speakButton.addEventListener("click", startSpeechRecognition);
    } else {
        console.error("Speak button not found");
    }


});

async function sendMessage() {
    const messageBox = document.getElementById('message');
    const message = messageBox.value;
    if (!message) return;

    displayMessage(message, 'user-message');
    messageBox.value = '';

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message })
        });

        const data = await response.json();
        displayMessage(data.response, 'bot-message');
        //speakResponse(data.response);
    } catch (error) {
        console.error("Error sending message:", error);
    }
}

function displayMessage(text, className) {
    const chatbox = document.getElementById('chatbox');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${className}`;

    const imageUrlMatch = text.match(/!\[([^\]]+)\]\(([^)]+)\)/);
    if (imageUrlMatch) {
        const imageUrl = imageUrlMatch[2];
        text = text.replace(imageUrlMatch[0], '');
        messageDiv.innerHTML = `
            <div class="message-content">${text}</div>
            <img src="static/${imageUrl}" alt="${imageUrlMatch[1]}" style="max-width: 100%; margin-top: 10px; border-radius: 5px;">
        `;
    } else {
        messageDiv.innerHTML = `<div class="message-content">${text}</div>`;
    }

    chatbox.appendChild(messageDiv);
    chatbox.scrollTop = chatbox.scrollHeight;
}

function toggleChatbot() {
    const chatMessages = document.querySelectorAll('.bot-message, .user-message');
    for (let message of chatMessages) {
        message.classList.toggle('hidden');
    }
}

function startSpeechRecognition() {
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = function() {
            console.log('Speech recognition started...');
            document.getElementById('speak-btn').style.backgroundColor = '#dc3545';
            document.getElementById('loader').style.display = 'inline-block';
        };

        recognition.onresult = async function(event) {
            const transcript = event.results[0][0].transcript;
            document.getElementById('message').value = transcript;
            await sendMessage();
        };

        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            recognition.stop();
            resetSpeechRecognitionUI();
        };

        recognition.onend = function() {
            console.log('Speech recognition ended.');
            document.getElementById('speak-btn').style.backgroundColor = '#FFA500';
            document.getElementById('loader').style.display = 'none';
        };

        recognition.start();
    } else {
        alert('Speech recognition is not supported in your browser. Please use a supported browser like Chrome.');
    }
}

// function speakResponse(text) {
//     const speech = new SpeechSynthesisUtterance();
//     speech.lang = 'en-US';
//     speech.volume = 1;
//     speech.rate = 1;
//     speech.pitch = 1;
//     speech.text = text;

//     const voices = window.speechSynthesis.getVoices();
//     const englishVoice = voices.find(voice => voice.lang === 'en-US');
//     if (englishVoice) {
//         speech.voice = englishVoice;
//     }

//     window.speechSynthesis.speak(speech);
// }

function resetSpeechRecognitionUI() {
    document.getElementById('speak-btn').style.backgroundColor = '#FFA500';
    document.getElementById('loader').style.display = 'none';
}


// scripts.js

document.addEventListener("DOMContentLoaded", function() {
    const fileInput = document.getElementById("fileInput");

    // Trigger file input click when label is clicked
    const fileLabel = document.querySelector(".file-label");
    fileLabel.addEventListener("click", function() {
        fileInput.click();
    });

    // Handle file upload when file input changes
    fileInput.addEventListener("change", function() {
        const formData = new FormData();
        formData.append("file", fileInput.files[0]);

        fetch('/upload/', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            // Optionally, update UI or display message
        })
        .catch((error) => {
            console.error('Error:', error);
            // Optionally, update UI or display error message
        });
    });

    // Example of sending message to chatbot
    const sendBtn = document.getElementById("send-btn");
    const messageInput = document.getElementById("message");
    const chatbox = document.getElementById("chatbox");

    sendBtn.addEventListener("click", function() {
        const userMessage = messageInput.value.trim();

        if (userMessage === "") {
            return;
        }

        sendMessage(userMessage);
        messageInput.value = "";
    });

    function sendMessage(message) {
        const messageElement = document.createElement("div");
        messageElement.classList.add("chatbox-message");
        messageElement.innerHTML = `<strong>You:</strong> ${message}`;
        chatbox.appendChild(messageElement);

        // Example of receiving response from backend
        fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message }),
        })
        .then(response => response.json())
        .then(data => {
            const responseText = data.response;
            const responseElement = document.createElement("div");
            responseElement.classList.add("chatbox-message");
            responseElement.innerHTML = `<strong>Assistant:</strong> ${responseText}`;
            chatbox.appendChild(responseElement);
        })
        .catch(error => console.error('Error:', error));
    }
});


// Function to display selected file name
function displayFileName(input) {
    const fileNameDisplay = document.getElementById('fileNameDisplay');

    if (input.files.length > 0) {
        const fileName = input.files[0].name;
        fileNameDisplay.textContent = ` ${fileName}`;
    } else {
        fileNameDisplay.textContent = '';
    }
}

async function uploadImage(input) {
    const file = input.files[0];
    if (file) {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/upload/', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                document.getElementById('chatbox').innerHTML += `
                    <div class="message">
                        ${result.response}<br>
                        <strong>Filename:</strong> ${result.filename}<br>
                        <strong>Width:</strong> ${result.width}<br>
                        <strong>Height:</strong> ${result.height}<br>
                        <strong>Extracted Text:</strong> ${result.ocr_text}<br>
                        <!-- Uncomment if classification is added -->
                        <!-- <strong>Classification:</strong> ${result.classification}<br> -->
                    </div>
                `;
            } else {
                console.error('Error uploading image');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

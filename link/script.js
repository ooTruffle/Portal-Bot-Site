// Function to extract the access token from the URL parameters
function getAccessToken() {
    const urlParams = new URLSearchParams(window.location.hash.substring(1));
    return urlParams.get('access_token');
}

// Function to check if the user is authenticated
function isAuthenticated() {
    return !!getAccessToken();
}

function showNotification(message, isError = false) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.backgroundColor = isError ? '#ff4444' : '#44ff44';
    notification.style.transform = 'translateX(0)';
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
    }, 3000);
}

function redirectToDiscord() {
    // Replace YOUR_CLIENT_ID and YOUR_REDIRECT_URI with your actual values
    const clientId = '1183641743770517524';
    const redirectUri = 'https://portal-bot.ftp.sh/linkbeta';

    // Build the Discord OAuth URL
    const discordOAuthUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=identify`;

    // Redirect the user to Discord for authentication
    window.location.href = discordOAuthUrl;
}

function sendMessage() {
    const accessToken = getAccessToken();

    // Check if the user is authenticated
    if (!accessToken) {
        // Redirect user to Discord for authentication
        redirectToDiscord();
        return;
    }

    // Fetch user information from Discord API
    fetch('https://discord.com/api/users/@me', {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch user information from Discord API.');
        }
        return response.json();
    })
    .then(user => {
        // Your existing sendMessage function logic here
        const messageInput = document.getElementById('messageInput');
        const messageContent = messageInput.value;

        // Check if the message is not empty
        if (messageContent.trim() !== '') {
            // Define the embed structure with Discord username and profile picture
            const embed = {
                title: 'New Message',
                color: '#0099ff',
                description: messageContent,
                author: {
                    name: user.username,
                    icon_url: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`,
                },
                timestamp: new Date(),
                footer: {
                    text: 'Message from the website', iconURL: 'https://portal-bot.ftp.sh/images/pb.png'
                },
            };

            // Send the message to the Discord bot using a fetch request
            fetch('https://161.97.159.175:2183/sendMessage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ embed: embed }),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to send message to the bot.');
                }
                return response.json();
            })
            .then(data => {
                console.log('Message sent successfully:', data);
                showNotification('Message sent successfully!');
            })
            .catch(error => {
                console.error('Error sending message to the bot:', error);
                showNotification('Failed to send message to the bot.', true);
            });
        } else {
            showNotification('Please enter a message before sending.', true);
        }
    })
    .catch(error => {
        console.error('Error fetching user information:', error);
        showNotification('Failed to fetch user information.', true);
    });
}


// Add an event listener for the "Send Message" button
document.getElementById('sendMessageBtn').addEventListener('click', () => {
    // Check if the user is authenticated
    if (isAuthenticated()) {
        // User is authenticated, proceed to send the message
        sendMessage();
    } else {
        // Redirect user to Discord for authentication
        redirectToDiscord();
    }
});

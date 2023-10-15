document.addEventListener("DOMContentLoaded", function() {
   
    // Establish a connection to the server
    const socket = io.connect('http://' + window.location.hostname + ':' + location.port);

    // Event listener for when the connection is established
    socket.on('connect', function() {
        console.log('Connected to the server');
    });

    // Event listener for receiving a message from the server
    socket.on('update-progress', function(data) {
        console.log('Received an update message:', data);
    });

    socket.on('connect_error', function(error) {
        console.log('Connection error:', error);
    });
    
    socket.on('reconnect_attempt', function() {
        console.log('Attempting to reconnect');
    });

    socket.on('update-message', function(data) {
        console.log('Received an update message:', data);
        const message = data.message;
        addMessageToDiv(message);
    });

    // Event listener for receiving a message from the server
    adjustFlexContainerHeight();
});

  // Function to add a message to the div
  function addMessageToDiv(message) {
    const li = document.createElement("li");
    
    // Get the current time and format it as HH:MM:SS
    const currentTime = new Date();
    const timestamp = currentTime.getHours().toString().padStart(2, '0') + ':'
                    + currentTime.getMinutes().toString().padStart(2, '0') + ':'
                    + currentTime.getSeconds().toString().padStart(2, '0');
    
    // Prepend the timestamp to the message
    li.appendChild(document.createTextNode(`[${timestamp}] ${message}`));
    
    // Add the .message class to the li element
    li.classList.add('message');
    
    // Calculate margin-top based on the existing messages
    const existingMessages = document.querySelectorAll("#messageLogList .message");
    const marginTop = existingMessages.length > 0 ? 10 : 0; // Minimum marginTop value

    // Ensure that marginTop is not less than 0
    li.style.marginTop = `${Math.max(0, marginTop)}px`;
    
    document.getElementById("messageLogList").appendChild(li);
    
    // After the fade-out animation completes, remove the message from the list
    setTimeout(function() {
        li.remove();
    }, 20000); // 5 seconds (adjust based on the duration of your fade-out animation)
}

function adjustBackdrop() {
    const canvas = document.getElementById('matrixCanvas');
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Reset the drops array
        for (let i = 0; i < columns; i++) {
            drops[i] = 1;
        }

        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

    } else {
        console.error('Canvas element not found!');
    }
}

function adjustFlexContainerHeight() {
    // Get the height of the navigation bar
    const navHeight = document.querySelector('nav').offsetHeight;

    // Get the height of the flash messages, if they exist
    const flashMessages = document.querySelector('.flashed-messages');
    const flashHeight = flashMessages ? flashMessages.offsetHeight : 0;

    // Calculate the total height to subtract from 100vh
    const totalHeight = navHeight + flashHeight;

    // Set the height of the flex-container
    const flexContainer = document.querySelector('.flex-container');
    flexContainer.style.height = `calc(100vh - ${totalHeight}px)`;
}
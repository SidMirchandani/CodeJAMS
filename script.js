document.addEventListener('DOMContentLoaded', () => {
    const bookCards = document.querySelectorAll('.book-card'); // All book cards
    const popup = document.getElementById('book-popup'); // Popup container
    const popupTitle = document.getElementById('popup-book-title'); // Popup title
    const popupInput = document.getElementById('popup-username'); // Answer input field
    const popupButton = document.getElementById('popup-link'); // "Check Answer" button
    const closeBtn = document.querySelector('.close-btn'); // Close button for popup
    const starSystem = document.getElementById('star-system'); // Star counter
    const userForm = document.getElementById('user-form'); // Username form
    const usernameInput = document.getElementById('username'); // Username input
    const userMessage = document.getElementById('user-message'); // Message under the form
    let correctAnswer = "95"; // Set the correct answer here
    let starCount = 0; // Initialize star count
    let username = ""; // Initialize username

    // Load saved data from localStorage
    const savedData = localStorage.getItem('userProgress');
    if (savedData) {
        const { savedUsername, savedStars } = JSON.parse(savedData);
        username = savedUsername;
        starCount = savedStars;
        starSystem.textContent = `⭐ ${starCount}`;
        userMessage.textContent = `Welcome back, ${username}! Your progress is being tracked.`;
    }

    // Handle username submission
    userForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const inputUsername = usernameInput.value.trim();
        if (/^\d{7}$/.test(inputUsername)) {
            username = inputUsername;
            starCount = starCount || 0; // Keep current star count or initialize to 0
            localStorage.setItem(
                'userProgress',
                JSON.stringify({ savedUsername: username, savedStars: starCount })
            );
            userMessage.textContent = `Welcome, ${username}! Your progress is now being tracked.`;
        } else {
            userMessage.textContent = 'Please enter a valid 7-digit username.';
            userMessage.style.color = 'red';
            setTimeout(() => (userMessage.textContent = ''), 3000);
        }
    });

    // Show popup on book card click
    bookCards.forEach(card => {
        card.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default link navigation
            if (!username) {
                alert('Please enter your username first to start tracking progress.');
                return;
            }
            const title = card.getAttribute('data-title'); // Get book title from data attribute
            popupTitle.textContent = title; // Set the title in the popup
            popupInput.value = ""; // Clear the input field
            popupInput.style.borderColor = ""; // Reset border color
            popup.classList.add('visible'); // Show popup
        });
    });

    // Close popup
    closeBtn.addEventListener('click', () => {
        popup.classList.remove('visible'); // Hide popup
    });

    // Check Answer
    popupButton.addEventListener('click', (event) => {
        event.preventDefault();
        const userAnswer = popupInput.value.trim(); // Get user's answer
        if (userAnswer === correctAnswer) {
            // Correct answer
            popupInput.style.borderColor = 'green'; // Highlight green
            starCount++; // Increment star count
            starSystem.textContent = `⭐ ${starCount}`; // Update star counter
            // Save updated progress to localStorage
            localStorage.setItem(
                'userProgress',
                JSON.stringify({ savedUsername: username, savedStars: starCount })
            );
        } else {
            // Incorrect answer
            popupInput.style.borderColor = 'red'; // Highlight red
            setTimeout(() => {
                popupInput.style.borderColor = ''; // Reset after a short delay
            }, 500);
        }
    });
});

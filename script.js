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
  let correctAnswer = "95"; // Set the correct answer for the current problem
  let problemID = "problem1"; // Example problem ID
  let username = ""; // Initialize username

  // Handle username submission
  userForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const inputUsername = usernameInput.value.trim();
    if (/^\d{7}$/.test(inputUsername)) { // Validate 7-digit username
      username = inputUsername;
      const userProgress = JSON.parse(localStorage.getItem('userProgress')) || {};
      const userStars = userProgress[username]?.stars || 0; // Retrieve stars for the username or default to 0
      starSystem.textContent = `⭐ ${userStars}`; // Update the star counter
      userMessage.textContent = `Welcome, ${username}! Your progress is now being tracked.`;
      userMessage.style.color = ""; // Reset message color
      if (!userProgress[username]) {
        userProgress[username] = { stars: 0, solvedProblems: [] }; // Initialize progress for new username
        localStorage.setItem('userProgress', JSON.stringify(userProgress)); // Save user data
      }
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
      problemID = card.getAttribute('data-problem-id'); // Get the problem ID from the card
      correctAnswer = card.getAttribute('data-correct-answer'); // Get the correct answer for the problem
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
    const userProgress = JSON.parse(localStorage.getItem('userProgress')) || {};
    const userStars = userProgress[username]?.stars || 0;
    const solvedProblems = userProgress[username]?.solvedProblems || [];

    if (solvedProblems.includes(problemID)) {
      // Problem already solved
      popupInput.style.borderColor = 'orange'; // Highlight orange for warning
      alert("You've already solved this problem and earned a star.");
    } else if (userAnswer === correctAnswer) {
      // Correct answer and problem not solved yet
      popupInput.style.borderColor = 'green'; // Highlight green
      userProgress[username].stars = userStars + 1; // Increment star count
      userProgress[username].solvedProblems.push(problemID); // Mark the problem as solved
      localStorage.setItem('userProgress', JSON.stringify(userProgress)); // Save updated progress
      starSystem.textContent = `⭐ ${userProgress[username].stars}`; // Update star counter
    } else {
      // Incorrect answer
      popupInput.style.borderColor = 'red'; // Highlight red
      setTimeout(() => {
        popupInput.style.borderColor = ''; // Reset after a short delay
      }, 500);
    }
  });

  // Load saved data from localStorage when the page loads
  const savedData = JSON.parse(localStorage.getItem('userProgress')) || {};
  if (username in savedData) {
    const userStars = savedData[username].stars;
    starSystem.textContent = `⭐ ${userStars}`;
    userMessage.textContent = `Welcome back, ${username}! Your progress is being tracked.`;
  }
});

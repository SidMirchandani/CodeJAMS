// script.js
document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const bookCards = document.querySelectorAll(".book-card"); // All book cards
  const topics = document.querySelectorAll(".topic-card"); // All topic cards
  const popup = document.getElementById("book-popup"); // Popup container
  const popupTitle = document.getElementById("popup-book-title"); // Popup title
  const popupInput = document.getElementById("popup-username"); // Answer input field
  const popupButton = document.getElementById("popup-link"); // "Check Answer" button
  const closeBtn = document.querySelector(".close-btn"); // Close button for popup
  const reportButton = document.getElementById("report-button"); // "Report Question" button
  const starSystem = document.getElementById("star-system"); // Star counter
  const userForm = document.getElementById("user-form"); // Username form
  const usernameInput = document.getElementById("username"); // Username input
  const userMessage = document.getElementById("user-message"); // Message under the form
  const leaderboardList = document.getElementById("leaderboard-list"); // Leaderboard list

  let correctAnswer = ""; // Correct answer for current problem
  let problemID = "";     // Current problem ID
  let username = "";      // Current username

  // Helper: Update Leaderboard (Top 10 users by stars)
  async function updateLeaderboard() {
    leaderboardList.innerHTML = ""; // Clear the leaderboard list
    try {
      const snapshot = await db
        .collection("userProgress")
        .orderBy("stars", "desc")
        .limit(10)
        .get();
      snapshot.forEach((doc) => {
        const li = document.createElement("li");
        const data = doc.data();
        li.textContent = `${doc.id}: ${data.stars} star${data.stars !== 1 ? "s" : ""}`;
        leaderboardList.appendChild(li);
      });
    } catch (error) {
      console.error("Error updating leaderboard:", error);
    }
  }

  // Handle username submission
  userForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const inputUsername = usernameInput.value.trim();
    if (/^\d{7}$/.test(inputUsername)) { // Validate username as a 7-digit number
      username = inputUsername;
      const userDocRef = db.collection("userProgress").doc(username);
      try {
        const docSnap = await userDocRef.get();
        if (docSnap.exists) {
          // User exists – load their progress
          const userData = docSnap.data();
          starSystem.textContent = `⭐ ${userData.stars}`;
          userMessage.textContent = `Welcome back, ${username}! Your progress is being tracked.`;
        } else {
          // New user – initialize progress
          await userDocRef.set({ stars: 0, solvedProblems: [] });
          starSystem.textContent = `⭐ 0`;
          userMessage.textContent = `Welcome, ${username}! Your progress is now being tracked.`;
        }
        userMessage.style.color = ""; // Reset message color
        // Update leaderboard after login
        updateLeaderboard();
      } catch (error) {
        console.error("Error accessing user progress:", error);
      }
    } else {
      userMessage.textContent = "Please enter a valid 7-digit username.";
      userMessage.style.color = "red";
      setTimeout(() => (userMessage.textContent = ""), 3000);
    }
  });

  // Expand/collapse topics when clicking on a topic title
  topics.forEach((topic) => {
    const title = topic.querySelector(".topic-title");
    const content = topic.querySelector(".topic-content");
    title.addEventListener("click", () => {
      content.classList.toggle("hidden");
    });
  });

  // Show popup on book-card click
  bookCards.forEach((card) => {
    card.addEventListener("click", (event) => {
      event.preventDefault(); // Prevent default navigation
      if (!username) {
        alert("Please enter your username first to start tracking progress.");
        return;
      }
      problemID = card.getAttribute("data-problem-id");
      correctAnswer = card.getAttribute("data-correct-answer");
      const title = card.getAttribute("data-title");
      popupTitle.textContent = title;
      popupInput.value = "";
      popupInput.style.borderColor = "";
      popup.classList.add("visible"); // Show the popup
    });
  });

  // Close popup when clicking the close button
  closeBtn.addEventListener("click", () => {
    popup.classList.remove("visible");
  });

  // Check Answer and update user progress online
  popupButton.addEventListener("click", async (event) => {
    event.preventDefault();
    const userAnswer = popupInput.value.trim();
    if (!username) {
      alert("Please log in with your username first.");
      return;
    }
    const userDocRef = db.collection("userProgress").doc(username);
    try {
      const docSnap = await userDocRef.get();
      const userData = docSnap.data();
      // If problem has already been solved
      if (userData.solvedProblems.includes(problemID)) {
        popupInput.style.borderColor = "orange";
      } else if (userAnswer === correctAnswer) {
        // Correct answer
        popupInput.style.borderColor = "green";
        const newStars = userData.stars + 1;
        const newSolved = [...userData.solvedProblems, problemID];
        // Update Firestore with new progress
        await userDocRef.update({ stars: newStars, solvedProblems: newSolved });
        starSystem.textContent = `⭐ ${newStars}`;
        updateLeaderboard(); // Refresh leaderboard after progress change
      } else {
        // Incorrect answer
        popupInput.style.borderColor = "red";
        setTimeout(() => {
          popupInput.style.borderColor = "";
        }, 500);
      }
    } catch (error) {
      console.error("Error updating user progress:", error);
    }
  });

  // Report Question Functionality
  reportButton.addEventListener("click", async () => {
    if (!username) {
      alert("Please log in with your username to report a question.");
      return;
    }
    const reportMessage = `The question "${popupTitle.textContent}" has been reported. Thank you!`;
    alert(reportMessage);
    try {
      await db.collection("reportedQuestions").add({
        username: username,
        question: popupTitle.textContent,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error("Error reporting question:", error);
    }
  });

  // Optionally, update the leaderboard on page load
  updateLeaderboard();
});

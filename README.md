Application Overview
Typing Adventure is a gamified typing tutor designed to make learning to type more engaging and rewarding. The core of the application is a standard typing test, but it is enhanced with a persistent user profile system that includes unlockable achievements, a virtual currency, and a "mon" collection and leveling system.

The application is built with a modern tech stack, featuring a React frontend that communicates with a Node.js and PostgreSQL backend, all orchestrated with Docker for consistent development and deployment environments.

Version Control & Architectural Milestones
The application has undergone a significant architectural refactor to move from a prototype using browser localStorage to a robust, server-based system.

Initial State (Version 1.0): The application began as a frontend-only prototype. All user data, cards, and achievements were stored in the browser's localStorage using a "mock API." This was great for rapid development but was not scalable, secure, or persistent across devices.

Backend Integration (Version 2.0): We introduced a Node.js/PostgreSQL backend and began migrating features one by one. This phase involved creating real API endpoints for users, cards, and other resources.

Architectural Refactor (Version 3.0 - Current): We have just completed a major refactor to implement a clean, top-down data flow.

Central API Service: All API calls are now centralized in a single apiCall.js file, making network requests easy to manage.

Single Source of Truth: The main App.js component is now the "brain" of the application. It fetches all data from the server and holds it in its state, passing it down to child components as needed.

"Dumb" Components: All other components, especially those in the AdminPanel, have been refactored to be "presentational." They no longer contain their own API logic and simply display data and report user actions up to App.js. This has resolved a whole class of bugs related to state management and UI updates.

Common Bugs & Debugging Solutions
We have successfully navigated several challenging bugs by using a systematic debugging process.

The "Blob" URL Issue:

Symptom: Uploaded images would appear temporarily but would be gone on refresh, and the database would contain a blob: URL.

Cause: The frontend was using URL.createObjectURL(), which creates a temporary, local-only link to a file. The actual file was never being sent to the server.

Solution: We implemented a proper file upload system. We created a reusable MediaInput.js component that sends the file data to a dedicated /api/upload endpoint on the backend. The backend saves the file to a Docker volume and returns a permanent path (e.g., /uploads/image.png), which is then saved to the database.

The "Silent Save" Bug (UI Not Updating):

Symptom: An admin would edit a card or assign a category, click "Save," the modal would close, but the changes would not be reflected in the UI until a manual refresh.

Cause: A "broken wire" in the component prop chain. A child component (like AchievementManager) was calling a function, but its parent (AdminPanel) was not correctly passing that function down from the main App.js.

Solution: We fixed this by implementing a strict top-down data flow. App.js now contains all the master "handler" functions (e.g., handleSaveCard). These are passed down through the AdminPanel with consistent prop names (onSave, onDelete) to the manager components, ensuring the "chain of command" is never broken.

The Card Completion Loop (Race Condition):

Symptom: After completing a typing test, the test would immediately restart from the beginning instead of showing the completion screen.

Cause: A "race condition" in App.js. The handleComplete function was updating the local user state and also calling fetchData() immediately after. The setUser call would trigger a re-render of App.js, which would pass a new card object to TypingTest.js. The useEffect hook in the typing test (which was watching the entire card object) would see this "new" object and reset the test.

Solution: We made the useEffect hook in TypingTest.js more specific by having it watch only card.id for changes. This ensures the test only resets when the user is truly on a new card.

Features To Be Completed
While the core systems are now stable, several features from our original vision are not yet fully integrated for the user.

Quest System: The QuestManager in the admin panel is functional, but there is no user-facing page for players to see or accept available quests. The logic to track quest progress and grant rewards is also not yet implemented in the backend.

Reward System: Similar to quests, the RewardManager works, but there is no "Reward Shop" for users to spend their in-game money. The process for approving and delivering rewards is also not yet built out.

"Mon" Evolution: We have successfully built the system for defining evolution chains in the PokedexManager. However, the backend logic to actually check a "mon's" level and perform the evolution after a typing test is still pending.

Suggested Future Features
Now that the foundation is solid, here are a few ideas that could greatly enhance the player experience:

Typist Leveling Rewards: The trainer leveling system is in place, but it doesn't do anything yet. We could grant users special rewards (like a unique avatar frame, bonus currency, or a rare "mon egg") every time they level up.

"Active Mon" System: Currently, all XP gained from a typing test is given to the user's first "mon." A great next step would be to allow the user to select an "active" or "training" mon on their profile page. This would give them a strategic choice and a greater sense of agency.

Daily & Weekly Leaderboards: A simple leaderboard system that resets daily or weekly could introduce a fun, competitive element. It could track stats like "most words typed," "highest WPM," or "most cards completed."

Sound & Theme Customization: In the SiteSettingsManager, you have fields for custom sounds. We could expand this into a "shop" where users can spend their in-game money to unlock new sound packs or visual themes for their typing interface.
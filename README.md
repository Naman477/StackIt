# StackIt – A Minimal Q&A Forum Platform

## Overview

StackIt is a minimal, user-friendly question-and-answer platform designed to foster collaborative learning and structured knowledge sharing within a community. It focuses on providing a streamlined experience for asking questions, posting answers, and interacting through comments and a reputation system.

## Features

*   **User Authentication:** Secure registration and login for users.
*   **User Roles:** Differentiated permissions for Guests (view), Users (post, vote, comment), and Admins (moderate).
*   **Question Management:** Users can ask questions with titles, rich text descriptions, and multi-select tags.
*   **Rich Text Editor:** Integrated `react-draft-wysiwyg` for rich text formatting in question descriptions and answers (bold, italic, lists, links, etc.).
*   **Answer Management:** Users can post answers to questions, formatted with the rich text editor.
*   **Voting System:** Upvote and downvote answers.
*   **Accepted Answers:** Question owners can mark one answer as accepted.
*   **Tagging System:** Questions can be categorized with relevant tags.
*   **Notification System:** Real-time notifications for new answers, comments, and mentions, displayed via a bell icon with unread counts.
*   **User Profiles:** Dedicated profile pages displaying user's questions, answers, and reputation.
*   **Search Functionality:** Search questions by keywords in title or description.
*   **Sorting & Filtering:** Sort questions by creation date or answer count, and filter by tags.
*   **Comments System:** Add comments to both questions and answers.
*   **User Reputation:** A basic reputation system where users gain/lose points based on votes and accepted answers.

## Technologies Used

**Frontend:**
*   **React:** A JavaScript library for building user interfaces.
*   **React Router DOM:** For declarative routing.
*   **Axios:** For making HTTP requests to the backend API.
*   **Bootstrap 5:** For responsive and attractive UI components.
*   **react-draft-wysiwyg & Draft.js:** For rich text editing capabilities.
*   **Socket.IO Client:** For real-time notifications.

**Backend:**
*   **Node.js:** JavaScript runtime environment.
*   **Express.js:** Fast, unopinionated, minimalist web framework for Node.js.
*   **MongoDB:** NoSQL database for data storage.
*   **Mongoose:** MongoDB object data modeling (ODM) for Node.js.
*   **mongoose-paginate-v2:** Mongoose plugin for pagination.
*   **bcryptjs:** For password hashing.
*   **jsonwebtoken:** For implementing JSON Web Tokens for authentication.
*   **dotenv:** For managing environment variables.
*   **Socket.IO:** For real-time, bidirectional event-based communication.

## Setup and Installation

Follow these steps to get the project up and running on your local machine.

### Prerequisites

*   Node.js (LTS version recommended)
*   npm (Node Package Manager)
*   MongoDB (running locally or accessible via a connection string)

### 1. Clone the Repository

If you haven't already, clone the project from your GitHub repository:

```bash
git clone [YOUR_REPOSITORY_URL]
cd StackIt
```

### 2. Backend Setup

Navigate to the `backend` directory, install dependencies, and set up environment variables.

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with the following content:

```
MONGO_URI=mongodb://localhost:27017/stackit
PORT=5000
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:3000
```

Replace `your_super_secret_jwt_key` with a strong, random string.

### 3. Frontend Setup

Navigate to the `frontend` directory, install dependencies, and set up environment variables.

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` directory with the following content:

```
REACT_APP_API_URL=http://localhost:5000
```

### 4. Run the Application

#### Start the Backend Server

Open a terminal and navigate to the `backend` directory:

```bash
cd C:\Users\Lenovo\Desktop\StackIt\backend
node server.js
```

You should see messages indicating MongoDB connection and server startup.

#### Start the Frontend Development Server

Open a **new** terminal and navigate to the `frontend` directory:

```bash
cd C:\Users\Lenovo\Desktop\StackIt\frontend
npm start
```

This will open the application in your web browser, usually at `http://localhost:3000`.

## Usage

1.  **Register/Login:** Create an account or sign in using the links in the navigation bar.
2.  **Ask a Question:** Click "Ask Question" in the navbar to submit a new question.
3.  **Browse Questions:** The homepage displays all questions. Use the search bar, sort, and filter options to find specific questions.
4.  **View Question Details:** Click on a question title to see its full description, answers, and comments.
5.  **Answer Questions:** On the question detail page, logged-in users can post answers.
6.  **Vote and Accept Answers:** Upvote/downvote answers. Question owners can accept an answer.
7.  **Comment:** Add comments to questions and answers.
8.  **Notifications:** The bell icon in the navbar will show real-time notifications for new answers and comments.
9.  **User Profiles:** Click on a username to view their profile, including their questions and answers.

## Contributing

Feel free to fork the repository and contribute! Pull requests are welcome.

## License

This project is licensed under the MIT License.

## Contact

For any questions or feedback, please open an issue in the GitHub repository.

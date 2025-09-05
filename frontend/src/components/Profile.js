import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';

const Profile = () => {
  const { id } = useParams(); // Get user ID from URL if viewing another user's profile
  const [profileUser, setProfileUser] = useState(null);
  const [userQuestions, setUserQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const currentUserId = localStorage.getItem('userId');

  const userIdToFetch = id || currentUserId; // Use ID from URL or current user's ID

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!userIdToFetch) return; // Don't fetch if no user ID is available

      try {
        // Fetch user details
        const userRes = await axios.get(`/api/users/${userIdToFetch}`);
        setProfileUser(userRes.data);

        // Fetch user's questions
        const questionsRes = await axios.get(`/api/users/${userIdToFetch}/questions`);
        setUserQuestions(questionsRes.data);

        // Fetch user's answers
        const answersRes = await axios.get(`/api/users/${userIdToFetch}/answers`);
        setUserAnswers(answersRes.data);

      } catch (err) {
        console.error(err);
      }
    };
    fetchProfileData();
  }, [userIdToFetch]);

  if (!profileUser) {
    return <div className="text-center mt-5">Loading profile...</div>;
  }

  return (
    <div className="container mt-4">
      <div className="card shadow-sm p-4 mb-4">
        <h1 className="mb-3 text-primary">{profileUser.username}'s Profile</h1>
        <p className="text-muted">Email: {profileUser.email}</p>
        <p className="text-muted">Role: {profileUser.role}</p>
        <p className="text-muted">Reputation: <span className="badge bg-primary">{profileUser.reputation}</span></p>
        <p className="text-muted">Joined: {new Date(profileUser.createdAt).toLocaleDateString()}</p>
      </div>

      <h2 className="mb-3">Questions by {profileUser.username}</h2>
      {userQuestions.length > 0 ? (
        userQuestions.map((question) => (
          <div key={question._id} className="card mb-3 shadow-sm question-item">
            <div className="card-body">
              <Link to={`/question/${question._id}`} className="text-decoration-none">
                <h5 className="card-title text-primary">{question.title}</h5>
              </Link>
              <p className="card-text text-muted mb-1">Asked on {new Date(question.createdAt).toLocaleDateString()}</p>
              <p className="card-text">
                <span className="badge bg-info text-dark me-1">Tags:</span>
                {question.tags.map(tag => (
                  <span key={tag._id} className="badge bg-secondary me-1">{tag.name}</span>
                ))}
              </p>
              <p className="card-text">
                <span className="badge bg-success">Answers: {question.answersCount}</span>
              </p>
            </div>
          </div>
        ))
      ) : (
        <p className="text-muted">No questions asked by this user yet.</p>
      )}

      <h2 className="mb-3 mt-4">Answers by {profileUser.username}</h2>
      {userAnswers.length > 0 ? (
        userAnswers.map((answer) => (
          <div key={answer._id} className="card mb-3 shadow-sm answer-item">
            <div className="card-body">
              <p className="card-text">Answer to: <Link to={`/question/${answer.question._id}`}>{answer.question.title}</Link></p>
              <div className="card-text" dangerouslySetInnerHTML={{ __html: answer.content }} />
              <p className="card-text text-muted mb-1">Answered on {new Date(answer.createdAt).toLocaleDateString()}</p>
              <p className="card-text">
                <span className="badge bg-success">Votes: {answer.upvotes - answer.downvotes}</span>
                {answer.isAccepted && <span className="badge bg-success ms-2"><i className="fas fa-check-circle"></i> Accepted</span>}
              </p>
            </div>
          </div>
        ))
      ) : (
        <p className="text-muted">No answers provided by this user yet.</p>
      )}
    </div>
  );
};

export default Profile;
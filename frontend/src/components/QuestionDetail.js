import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState } from 'draft-js';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { stateToHTML } from 'draft-js-export-html';
import { toast } from 'react-toastify';

const QuestionDetail = () => {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswerEditorState, setNewAnswerEditorState] = useState(EditorState.createEmpty());
  const [questionComments, setQuestionComments] = useState([]);
  const [newQuestionComment, setNewQuestionComment] = useState('');
  const [answerFormErrors, setAnswerFormErrors] = useState({});
  const [questionCommentFormErrors, setQuestionCommentFormErrors] = useState({});

  const onAnswerEditorStateChange = (editorState) => {
    setNewAnswerEditorState(editorState);
  };

  const fetchQuestionData = useCallback(async () => {
    try {
      const questionRes = await axios.get(`/api/questions/${id}`);
      setQuestion(questionRes.data);

      const answersRes = await axios.get(`/api/answers/${id}`);
      setAnswers(answersRes.data);

      const commentsRes = await axios.get(`/api/comments/question/${id}`);
      setQuestionComments(commentsRes.data);

    } catch (err) {
      console.error(err);
      toast.error('Failed to load question data.');
    }
  }, [id]); // `id` is a dependency for `fetchQuestionData`

  useEffect(() => {
    fetchQuestionData();
  }, [fetchQuestionData]); // `fetchQuestionData` is now stable due to useCallback

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    setAnswerFormErrors({}); // Clear previous errors
    try {
      const answerHTML = stateToHTML(newAnswerEditorState.getCurrentContent());

      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token'),
        },
      };
      const res = await axios.post(
        `/api/answers/${id}`,
        { content: answerHTML },
        config
      );
      setAnswers([...answers, res.data]);
      setNewAnswerEditorState(EditorState.createEmpty()); // Clear the editor
      toast.success('Answer posted successfully!');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.errors) {
        const newErrors = {};
        err.response.data.errors.forEach(error => {
          newErrors[error.param] = error.msg;
          toast.error(error.msg);
        });
        setAnswerFormErrors(newErrors);
      } else if (err.response && err.response.data && err.response.data.msg) {
        setAnswerFormErrors({ general: err.response.data.msg });
        toast.error(err.response.data.msg);
      } else {
        setAnswerFormErrors({ general: 'Server error' });
        toast.error('Server error');
      }
      console.error(err.response.data);
    }
  };

  const handleVote = async (answerId, type) => {
    try {
      const config = {
        headers: {
          'x-auth-token': localStorage.getItem('token'),
        },
      };
      await axios.put(`/api/answers/vote/${answerId}/${type}`, {}, config);
      // Refresh answers to show updated votes
      const answersRes = await axios.get(`/api/answers/${id}`);
      setAnswers(answersRes.data);
      toast.success(`Answer ${type}d successfully!`);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.msg) {
        toast.error(err.response.data.msg);
      } else {
        toast.error('Failed to vote.');
      }
      console.error(err.response.data);
    }
  };

  const handleAcceptAnswer = async (answerId) => {
    try {
      const config = {
        headers: {
          'x-auth-token': localStorage.getItem('token'),
        },
      };
      await axios.put(`/api/answers/accept/${answerId}`, {}, config);
      // Refresh answers to show accepted status
      const answersRes = await axios.get(`/api/answers/${id}`);
      setAnswers(answersRes.data);
      toast.success('Answer accepted/unaccepted successfully!');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.msg) {
        toast.error(err.response.data.msg);
      } else {
        toast.error('Failed to accept answer.');
      }
      console.error(err.response.data);
    }
  };

  const handleQuestionCommentSubmit = async (e) => {
    e.preventDefault();
    setQuestionCommentFormErrors({}); // Clear previous errors
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token'),
        },
      };
      const res = await axios.post(
        `/api/comments/question/${id}`,
        { content: newQuestionComment },
        config
      );
      setQuestionComments([...questionComments, res.data]);
      setNewQuestionComment('');
      toast.success('Comment added successfully!');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.errors) {
        const newErrors = {};
        err.response.data.errors.forEach(error => {
          newErrors[error.param] = error.msg;
          toast.error(error.msg);
        });
        setQuestionCommentFormErrors(newErrors);
      } else if (err.response && err.response.data && err.response.data.msg) {
        setQuestionCommentFormErrors({ general: err.response.data.msg });
        toast.error(err.response.data.msg);
      } else {
        setQuestionCommentFormErrors({ general: 'Server error' });
        toast.error('Server error');
      }
      console.error(err.response.data);
    }
  };

  const handleAnswerCommentSubmit = async (answerId, commentContent, setCommentContent, answerComments, setAnswerComments, setAnswerCommentFormErrors) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token'),
        },
      };
      const res = await axios.post(
        `/api/comments/answer/${answerId}`,
        { content: commentContent },
        config
      );
      setAnswerComments([...answerComments, res.data]);
      setCommentContent('');
      toast.success('Comment added successfully!');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.errors) {
        const newErrors = {};
        err.response.data.errors.forEach(error => {
          newErrors[error.param] = error.msg;
          toast.error(error.msg);
        });
        setAnswerCommentFormErrors(newErrors);
      } else if (err.response && err.response.data && err.response.data.msg) {
        setAnswerCommentFormErrors({ general: err.response.data.msg });
        toast.error(err.response.data.msg);
      } else {
        setAnswerCommentFormErrors({ general: 'Server error' });
        toast.error('Server error');
      }
      console.error(err.response.data);
    }
  };

  if (!question) {
    return <div className="text-center mt-5">Loading question...</div>;
  }

  return (
    <div className="container mt-4">
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h1 className="card-title text-primary">{question.title}</h1>
          <p className="card-text text-muted mb-2">
            Asked by <Link to={`/profile/${question.author._id}`}>{question.author.username}</Link> (<span className="badge bg-info">{question.author.reputation}</span>) on {new Date(question.createdAt).toLocaleDateString()}
          </p>
          <div className="card-text" dangerouslySetInnerHTML={{ __html: question.description }} />
          <p className="card-text">
            <span className="badge bg-info text-dark me-1">Tags:</span>
            {question.tags.map(tag => (
              <span key={tag._id} className="badge bg-secondary me-1">{tag.name}</span>
            ))}
          </p>

          {/* Question Comments */}
          <div className="mt-4">
            <h5 className="mb-2">Comments</h5>
            {questionComments.length > 0 ? (
              questionComments.map(comment => (
                <div key={comment._id} className="card card-body bg-light mb-2">
                  <p className="mb-1">{comment.content}</p>
                  <small className="text-muted">By <Link to={`/profile/${comment.author._id}`}>{comment.author.username}</Link> on {new Date(comment.createdAt).toLocaleDateString()}</small>
                </div>
              ))
            ) : (
              <p className="text-muted">No comments yet.</p>
            )}
            <form onSubmit={handleQuestionCommentSubmit} className="mt-3">
              <div className="mb-2">
                <textarea
                  className={`form-control ${questionCommentFormErrors.content ? 'is-invalid' : ''}`}
                  rows="2"
                  placeholder="Add a comment..."
                  value={newQuestionComment}
                  onChange={(e) => setNewQuestionComment(e.target.value)}
                ></textarea>
                {questionCommentFormErrors.content && <div className="invalid-feedback">{questionCommentFormErrors.content}</div>}
              </div>
              {questionCommentFormErrors.general && <div className="alert alert-danger">{questionCommentFormErrors.general}</div>}
              <button type="submit" className="btn btn-sm btn-outline-primary">Add Comment</button>
            </form>
          </div>
        </div>
      </div>

      <h2 className="mb-3">Answers</h2>
      {answers.length > 0 ? (
        answers.map((answer) => (
          <AnswerItem
            key={answer._id}
            answer={answer}
            questionAuthorId={question.author._id}
            handleVote={handleVote}
            handleAcceptAnswer={handleAcceptAnswer}
            handleAnswerCommentSubmit={handleAnswerCommentSubmit}
          />
        ))
      ) : (
        <p className="text-center text-muted">No answers yet. Be the first to answer!</p>
      )}

      <h2 className="mb-3 mt-4">Your Answer</h2>
      <div className="card shadow-sm p-4 mb-5">
        <form onSubmit={handleAnswerSubmit}>
          <div className="mb-3">
            <Editor
              editorState={newAnswerEditorState}
              wrapperClassName="demo-wrapper"
              editorClassName={`demo-editor form-control ${answerFormErrors.content ? 'is-invalid' : ''}`}
              onEditorStateChange={onAnswerEditorStateChange}
              placeholder="Write your answer..."
              toolbar={{ // Customize toolbar options
                options: ['inline', 'list', 'link', 'image', 'history', 'textAlign'],
                inline: { options: ['bold', 'italic', 'strikethrough'] },
                list: { options: ['unordered', 'ordered'] },
                textAlign: { options: ['left', 'center', 'right'] },
              }}
            />
            {answerFormErrors.content && <div className="invalid-feedback">{answerFormErrors.content}</div>}
          </div>
          {answerFormErrors.general && <div className="alert alert-danger">{answerFormErrors.general}</div>}
          <button type="submit" className="btn btn-primary">Post Your Answer</button>
        </form>
      </div>
    </div>
  );
};

// New component for individual answers to handle comments within them
const AnswerItem = ({ answer, questionAuthorId, handleVote, handleAcceptAnswer, handleAnswerCommentSubmit }) => {
  const [answerComments, setAnswerComments] = useState([]);
  const [newAnswerComment, setNewAnswerComment] = useState('');
  const [answerCommentFormErrors, setAnswerCommentFormErrors] = useState({});

  useEffect(() => {
    const fetchAnswerComments = async () => {
      try {
        const res = await axios.get(`/api/comments/answer/${answer._id}`);
        setAnswerComments(res.data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load comments for answer.');
      }
    };
    fetchAnswerComments();
  }, [answer._id]);

  return (
    <div className="card mb-3 shadow-sm answer-item">
      <div className="card-body">
        <div className="card-text" dangerouslySetInnerHTML={{ __html: answer.content }} />
        <p className="card-text text-muted mb-2">
          Answered by <Link to={`/profile/${answer.author._id}`}>{answer.author.username}</Link> (<span className="badge bg-info">{answer.author.reputation}</span>) on {new Date(answer.createdAt).toLocaleDateString()}
        </p>
        <div className="d-flex align-items-center">
          <span className="me-3">Votes: {answer.upvotes - answer.downvotes}</span>
          <button className="btn btn-outline-success btn-sm me-2" onClick={() => handleVote(answer._id, 'up')}>
            <i className="fas fa-arrow-up"></i> Upvote
          </button>
          <button className="btn btn-outline-danger btn-sm me-2" onClick={() => handleVote(answer._id, 'down')}>
            <i className="fas fa-arrow-down"></i> Downvote
          </button>
          {answer.isAccepted && (
            <span className="badge bg-success ms-auto"><i className="fas fa-check-circle"></i> Accepted Answer</span>
          )}
          {questionAuthorId === localStorage.getItem('userId') && !answer.isAccepted && (
            <button className="btn btn-info btn-sm ms-auto" onClick={() => handleAcceptAnswer(answer._id)}>
              Accept Answer
            </button>
          )}
        </div>

        {/* Answer Comments */}
        <div className="mt-4">
          <h6 className="mb-2">Comments</h6>
          {answerComments.length > 0 ? (
            answerComments.map(comment => (
              <div key={comment._id} className="card card-body bg-light mb-2">
                <p className="mb-1">{comment.content}</p>
                <small className="text-muted">By <Link to={`/profile/${comment.author._id}`}>{comment.author.username}</Link> on {new Date(comment.createdAt).toLocaleDateString()}</small>
              </div>
            ))
          ) : (
            <p className="text-muted">No comments yet.</p>
          )}
          <form onSubmit={(e) => { e.preventDefault(); handleAnswerCommentSubmit(answer._id, newAnswerComment, setNewAnswerComment, answerComments, setAnswerComments, setAnswerCommentFormErrors); }} className="mt-3">
            <div className="mb-2">
              <textarea
                className={`form-control ${answerCommentFormErrors.content ? 'is-invalid' : ''}`}
                rows="2"
                placeholder="Add a comment..."
                value={newAnswerComment}
                onChange={(e) => setNewAnswerComment(e.target.value)}
              ></textarea>
              {answerCommentFormErrors.content && <div className="invalid-feedback">{answerCommentFormErrors.content}</div>}
            </div>
            {answerCommentFormErrors.general && <div className="alert alert-danger">{answerCommentFormErrors.general}</div>}
            <button type="submit" className="btn btn-sm btn-outline-primary">Add Comment</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetail;
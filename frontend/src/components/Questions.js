import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [filterTags, setFilterTags] = useState('');
  const limit = 10; // Number of questions per page
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const searchQuery = params.get('q');
        const pageParam = params.get('page') || 1;
        const sortByParam = params.get('sortBy') || 'createdAt';
        const orderParam = params.get('order') || 'desc';
        const tagsParam = params.get('tags') || '';

        setCurrentPage(parseInt(pageParam, 10));
        setSortBy(sortByParam);
        setOrder(orderParam);
        setFilterTags(tagsParam);
        
        let url = `/api/questions?page=${pageParam}&limit=${limit}&sortBy=${sortByParam}&order=${orderParam}`;
        if (searchQuery) {
          url += `&q=${searchQuery}`;
        }
        if (tagsParam) {
          url += `&tags=${tagsParam}`;
        }

        const res = await axios.get(url);
        setQuestions(res.data && res.data.docs ? res.data.docs : []);
        setTotalPages(res.data && res.data.totalPages ? res.data.totalPages : 1);
      } catch (err) {
        console.error(err);
        setQuestions([]); // Ensure questions is an empty array on error
        setTotalPages(1); // Reset total pages on error
      }
    };
    fetchQuestions();
  }, [location.search]); // Re-fetch questions when URL search params change

  const handlePageChange = (pageNumber) => {
    const params = new URLSearchParams(location.search);
    params.set('page', pageNumber);
    navigate(`?${params.toString()}`);
  };

  const handleSortChange = (e) => {
    const newSortBy = e.target.value;
    const params = new URLSearchParams(location.search);
    params.set('sortBy', newSortBy);
    params.set('page', 1); // Reset to first page on sort change
    navigate(`?${params.toString()}`);
  };

  const handleOrderChange = (e) => {
    const newOrder = e.target.value;
    const params = new URLSearchParams(location.search);
    params.set('order', newOrder);
    params.set('page', 1); // Reset to first page on order change
    navigate(`?${params.toString()}`);
  };

  const handleFilterTagsChange = (e) => {
    setFilterTags(e.target.value);
  };

  const applyTagFilter = () => {
    const params = new URLSearchParams(location.search);
    if (filterTags.trim()) {
      params.set('tags', filterTags.trim());
    } else {
      params.delete('tags');
    }
    params.set('page', 1); // Reset to first page on filter change
    navigate(`?${params.toString()}`);
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4 text-center">All Questions</h1>

      {/* Sorting and Filtering Controls */}
      <div className="row mb-4">
        <div className="col-md-4">
          <label htmlFor="sortBy" className="form-label">Sort By:</label>
          <select id="sortBy" className="form-select" value={sortBy} onChange={handleSortChange}>
            <option value="createdAt">Date Created</option>
            <option value="answersCount">Number of Answers</option>
          </select>
        </div>
        <div className="col-md-4">
          <label htmlFor="order" className="form-label">Order:</label>
          <select id="order" className="form-select" value={order} onChange={handleOrderChange}>
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
        <div className="col-md-4">
          <label htmlFor="filterTags" className="form-label">Filter by Tags (comma separated):</label>
          <div className="input-group">
            <input
              type="text"
              id="filterTags"
              className="form-control"
              value={filterTags}
              onChange={handleFilterTagsChange}
              placeholder="e.g., react, javascript"
            />
            <button className="btn btn-outline-secondary" type="button" onClick={applyTagFilter}>Apply Filter</button>
          </div>
        </div>
      </div>

      {questions && questions.length > 0 ? (
        questions.map((question) => (
          <div key={question._id} className="card mb-3 shadow-sm question-item">
            <div className="card-body">
              <Link to={`/question/${question._id}`} className="text-decoration-none">
                <h2 className="card-title text-primary">{question.title}</h2>
              </Link>
              <p className="card-text text-muted mb-1">
                Asked by <Link to={`/profile/${question.author._id}`}>{question.author.username}</Link> (<span className="badge bg-info">{question.author.reputation}</span>) on {new Date(question.createdAt).toLocaleDateString()}
              </p>
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
        <p className="text-center text-muted">No questions yet. Be the first to ask!</p>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <nav aria-label="Page navigation example" className="mt-4">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>Previous</button>
            </li>
            {[...Array(totalPages)].map((_, index) => (
              <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                <button className="page-link" onClick={() => handlePageChange(index + 1)}>{index + 1}</button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>Next</button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default Questions;
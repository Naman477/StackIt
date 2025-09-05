import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState } from 'draft-js';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { stateToHTML } from 'draft-js-export-html';
import { toast } from 'react-toastify';

const AskQuestion = () => {
  const [title, setTitle] = useState('');
  const [descriptionEditorState, setDescriptionEditorState] = useState(EditorState.createEmpty());
  const [tags, setTags] = useState(''); // Comma separated tags for now
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const onEditorStateChange = (editorState) => {
    setDescriptionEditorState(editorState);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors
    try {
      const descriptionHTML = stateToHTML(descriptionEditorState.getCurrentContent());

      const newQuestion = {
        title,
        description: descriptionHTML,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      };
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token'), // Assuming token is stored in localStorage
        },
      };
      const res = await axios.post('/api/questions', newQuestion, config);
      console.log(res.data);
      toast.success('Question posted successfully!');
      navigate('/'); // Redirect to home page
    } catch (err) {
      if (err.response && err.response.data && err.response.data.errors) {
        const newErrors = {};
        err.response.data.errors.forEach(error => {
          newErrors[error.param] = error.msg;
          toast.error(error.msg);
        });
        setErrors(newErrors);
      } else if (err.response && err.response.data && err.response.data.msg) {
        setErrors({ general: err.response.data.msg });
        toast.error(err.response.data.msg);
      } else {
        setErrors({ general: 'Server error' });
        toast.error('Server error');
      }
      console.error(err.response.data);
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-sm p-4">
        <h1 className="mb-4 text-center">Ask a Question</h1>
        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <input
              type="text"
              placeholder="Question Title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className={`form-control ${errors.title ? 'is-invalid' : ''}`}
            />
            {errors.title && <div className="invalid-feedback">{errors.title}</div>}
          </div>
          <div className="mb-3">
            <Editor
              editorState={descriptionEditorState}
              wrapperClassName="demo-wrapper"
              editorClassName={`demo-editor form-control ${errors.description ? 'is-invalid' : ''}`}
              onEditorStateChange={onEditorStateChange}
              placeholder="Question Description"
              toolbar={{ // Customize toolbar options
                options: ['inline', 'list', 'link', 'image', 'history', 'textAlign'],
                inline: { options: ['bold', 'italic', 'strikethrough'] },
                list: { options: ['unordered', 'ordered'] },
                textAlign: { options: ['left', 'center', 'right'] },
              }}
            />
            {errors.description && <div className="invalid-feedback">{errors.description}</div>}
          </div>
          <div className="mb-3">
            <input
              type="text"
              placeholder="Tags (comma separated)"
              name="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className={`form-control ${errors.tags ? 'is-invalid' : ''}`}
            />
            {errors.tags && <div className="invalid-feedback">{errors.tags}</div>}
          </div>
          {errors.general && <div className="alert alert-danger">{errors.general}</div>}
          <div className="d-grid">
            <input type="submit" value="Ask Question" className="btn btn-primary" />
          </div>
        </form>
      </div>
    </div>
  );
};

export default AskQuestion;
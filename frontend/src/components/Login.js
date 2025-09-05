import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const { email, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors
    try {
      const user = { email, password };
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
      const body = JSON.stringify(user);
      const res = await axios.post('/api/auth/login', body, config);
      console.log(res.data); // This will contain the token
      localStorage.setItem('token', res.data.token);
      // Decode token to get user ID and store it
      const decodedToken = JSON.parse(atob(res.data.token.split('.')[1]));
      localStorage.setItem('userId', decodedToken.user.id);
      toast.success('Logged in successfully!');
      navigate('/'); // Redirect to home page
    } catch (err) {
      if (err.response && err.response.data && err.response.data.errors) {
        const newErrors = {};
        err.response.data.errors.forEach(error => {
          newErrors[error.param] = error.msg;
          toast.error(error.msg); // Show toast for each validation error
        });
        setErrors(newErrors);
      } else if (err.response && err.response.data && err.response.data.msg) {
        setErrors({ general: err.response.data.msg });
        toast.error(err.response.data.msg); // Show toast for general error
      } else {
        setErrors({ general: 'Server error' });
        toast.error('Server error');
      }
      console.error(err.response.data);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-4">
        <div className="card shadow-sm p-4 mt-5">
          <h1 className="text-center mb-4">Sign In</h1>
          <p className="text-center text-muted mb-4">Sign into your account</p>
          <form onSubmit={onSubmit}>
            <div className="mb-3">
              <input
                type="email"
                placeholder="Email Address"
                name="email"
                value={email}
                onChange={onChange}
                required
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>
            <div className="mb-3">
              <input
                type="password"
                placeholder="Password"
                name="password"
                value={password}
                onChange={onChange}
                minLength="6"
                required
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              />
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>
            {errors.general && <div className="alert alert-danger">{errors.general}</div>}
            <div className="d-grid">
              <input type="submit" value="Login" className="btn btn-primary" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
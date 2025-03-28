import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { baseApiURL } from "./App";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";

function Register(){
  const [user, setUser] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    const { username, password, confirmPassword } = user;

    if (!username) {
      newErrors.username = "Field must be filled";
    } else if (!username.includes('@')) {
      newErrors.username = "Enter correct e-mail"
    }

    if (!password) {
      newErrors.password = "Field must be filled";
    } else if (password.length < 6) {
      newErrors.password = "Password must contain at least 6 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Field must be filled";
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = "Passwords must be matching";
    }
    return newErrors;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      const response = await axios.post(`${baseApiURL}/register`, user, { withCredentials: true });
      
      if (response.status === 201) {
        setErrors({});
        setServerError("");
        navigate("/notebook");
      } else {
        setServerError("Registration failed. Try again.");
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setServerError(error.response.data.message);
      } else {
        setServerError("Something went wrong. Try again later.");
      }
    }
  };

  const handleOAuth = () => {
    window.open(`${baseApiURL}/auth/google`, "_self");
  }

  return (
    <div>
      <div className="container mt-5">
        <h1>Register</h1>

        <div className="row">
          <div className="col-sm-8">
            <div className="card">
              <div className="card-body">

                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      name="username"
                      onChange={(e) => setUser({...user, username: e.target.value})}
                      value={user.username}
                    />
                    {errors.username && <div style={{ color: 'red' }}>{errors.username}</div>}
                  </div>
                  <div class="form-group">
                    <label htmlFor="password">Password</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      name="password"
                      onChange={(e) => setUser({...user, password: e.target.value})}
                      value={user.password}
                    />
                    {errors.password && <div style={{ color: 'red' }}>{errors.password}</div>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="password">Confirm Password</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      name="confirmPassword"
                      onChange={(e) => setUser({...user, confirmPassword: e.target.value})}
                      value={user.confirmPassword}
                    />
                    {errors.confirmPassword && <div style={{ color: 'red' }}>{errors.confirmPassword}</div>}
                  </div>
                  <button type="submit" className="btn btn-dark">Register</button>
                </form>

              </div>
            </div>
          </div>

          <div className="col-sm-4">
            <div className="card social-block">
              <div className="card-body linkGoogle">
                <a className="btn btn-block" onClick={handleOAuth} role="button">
                  <FontAwesomeIcon icon={faGoogle} size="2x" />
                  <p>Sign In with Google</p>
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );

}

export default Register;
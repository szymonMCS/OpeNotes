import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { baseApiURL } from "./App";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";

function Login({ setUser }) {
  const [user, setUserData] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${baseApiURL}/login`,
        {
          username: user.username,
          password: user.password,
        },
        { withCredentials: true }
      );
      if (response.status === 200) {
        setUser(response.data.user);
        navigate("/notebook");
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          setErrors({ password: "Invalid credentials" });
        } else if (error.response.status === 429) {
          setErrors({ password: error.response.data.message });
        } else {
          setErrors({ password: "An error occurred. Please try again." });
        }
      } else {
        console.error("Error during login process:", error);
      }
    }
  };

  const handleOAuth = () => {
    window.open(`${baseApiURL}/auth/google`, "_self");
  };

  return (
    <div>
      <div className="container mt-5">
        <h1>Login</h1>
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
                      onChange={(e) => setUserData({ ...user, username: e.target.value })}
                      value={user.username}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      name="password"
                      onChange={(e) => setUserData({ ...user, password: e.target.value })}
                      value={user.password}
                    />
                    {errors.password && (
                      <div style={{ color: "red" }}>{errors.password}</div>
                    )}
                  </div>
                  <button type="submit" className="btn btn-dark">
                    Login
                  </button>
                </form>
              </div>
            </div>
          </div>
          <div className="col-sm-4">
            <div className="card">
              <div className="card-body">
                <a className="btn btn-block linkGoogle" onClick={handleOAuth} role="button">
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

export default Login;
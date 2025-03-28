import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faNoteSticky } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="main-content">
      <div className="jumbotron-centered">
        <div className="container text-center">
          <FontAwesomeIcon icon={faNoteSticky} size="6x" />
          <h1 className="display-3">Your personal notes app</h1>
          <p className="lead">Place where you can keep your notes organized</p>
          <hr />
          <div className="button-group">
            <Link className="btn btn-light btn-lg" to="/register" role="button">Register</Link>
            <Link className="btn btn-dark btn-lg" to="/login" role="button">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
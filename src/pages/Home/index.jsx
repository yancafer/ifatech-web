import React from "react";
import "./style.css";

function Home() {
  return (
    <ul className="container">
      <li>
        <a className="button" href="/login">
          Login
        </a>
      </li>
      <li>
        <a className="button-space" href="/signup">
          Sign Up
        </a>
      </li>
    </ul>
  );
}

export default Home;

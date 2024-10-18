import React from "react";
import "./Logo.css";

const Logo = () => {
  return (
    <div className="logo">
      {/* Linha 1: Círculo e dois quadrados */}
      <div className="row">
        <div className="block circle"></div>
        <div className="block square"></div>
        <div className="block square"></div>
      </div>

      {/* Linha 2: Dois quadrados */}
      <div className="row">
        <div className="block square"></div>
        <div className="block square"></div>
      </div>

      {/* Linha 3: Três quadrados */}
      <div className="row">
        <div className="block square"></div>
        <div className="block square"></div>
        <div className="block square"></div>
      </div>

      {/* Linha 4: Dois quadrados */}
      <div className="row">
        <div className="block square"></div>
        <div className="block square"></div>
      </div>
    </div>
  );
};

export default Logo;

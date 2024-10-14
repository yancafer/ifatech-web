import React from "react";
import { Link } from "react-router-dom";
import { auth } from "../connections/firebaseConnections";
import { signOut } from "firebase/auth";
import "./menu.css";

function Menu() {

  async function handleLogout() {
    await signOut(auth);
  }

  return (
    <div className="container-menu-component">
      <ul className="menu-container">
        <li>
          <Link className="menu-font" to="/reports">Relatórios</Link>
        </li>
        <li>
          <Link className="menu-font" to="/checkqrcode">Verificar QR Code</Link>
        </li>
        <li>
          <Link className="menu-font" to="/filesstudents">Registros</Link>
        </li>
        <li>
          <Link className="menu-font" to="/registerstudets">Cadastrar</Link>
        </li>
        <li>
          <Link onClick={handleLogout} className="menu-font">Sair</Link>
        </li>
      </ul>
    </div>
  );
}

export default Menu;

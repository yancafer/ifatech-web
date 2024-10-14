import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../connections/supabaseClient"; // Importando a conexão do Supabase
import "./menu.css";

function Menu() {
  const navigate = useNavigate();

  async function handleLogout() {
    // Realiza o logout utilizando o método do Supabase
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.log("Erro ao fazer logout:", error.message);
    } else {
      // Redireciona para a página de login após o logout
      navigate("/login");
    }
  }

  return (
    <div className="container-menu-component">
      <ul className="menu-container">
        <li>
          <Link className="menu-font" to="/reports">
            Relatórios
          </Link>
        </li>
        <li>
          <Link className="menu-font" to="/checkqrcode">
            Verificar QR Code
          </Link>
        </li>
        <li>
          <Link className="menu-font" to="/filesstudents">
            Registros
          </Link>
        </li>
        <li>
          <Link className="menu-font" to="/registerstudets">
            Cadastrar
          </Link>
        </li>
        <li>
          <Link onClick={handleLogout} className="menu-font">
            Sair
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default Menu;

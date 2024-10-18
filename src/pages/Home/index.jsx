import React from "react";
import "./style.css";
import Logo from "../../components/Logo/Logo";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const goToLogin = () => {
    navigate("/login");
  };

  const goToSignUp = () => {
    navigate("/signup");
  };

  return (
    <div className="container">
      <div className="container-box">
        <div className="logo-image">
          <Logo alt="Logo Ifac" />
        </div>

        <div className="div-home">
          <div className="titles-home">
            <h1 className="title">Bem-vindo ao Ifatech</h1>
            <h2>
              O sistema que facilita o controle de fichas de lanches,
              <br />
              garantindo praticidade e eficiência para alunos e administradores
            </h2>
          </div>

          <div>
            <button className="button-home" onClick={goToLogin}>
              Entrar
            </button>

            <button className="button-home" onClick={goToSignUp}>
              Cadastrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

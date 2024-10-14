import { useState, useEffect } from "react";
import { auth } from "../connections/firebaseConnections";
import { onAuthStateChanged } from "firebase/auth";
import { Navigate } from "react-router-dom";
import Menu from "../components/Menu";

export default function Private({ children }) {
  const [loading, setLoading] = useState(true);
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    async function checkLogin() {
      const unsub = onAuthStateChanged(auth, (user) => {
        if (user) {
          const userData = {
            uid: user.uid,
            email: user.email,
          };

          localStorage.setItem("@detailUser", JSON.stringify(userData));

          setLoading(false);
          setSigned(true);
        } else {
          setLoading(false);
          setSigned(false);
        }
      });
    }
    checkLogin();
  }, []);

  if (loading) {
    return (
      <div>Carregando...</div>
    );
  }

  if (!signed) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <Menu />
      {children}
    </div>
  );
}

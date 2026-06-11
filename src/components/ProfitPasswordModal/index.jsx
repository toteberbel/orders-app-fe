import { useState } from "react";
import BaseModal from "../BaseModal";
import TextField from "../TextField";
import Button from "../Button";
import "./index.scss";

const mainClass = "profit-password";

// hardcoded gate for the profit module — see ProfitPasswordModal usage in Home
const PROFIT_PASSWORD = "eloyblas1";
export const PROFIT_AUTH_KEY = "profit-auth";

const ProfitPasswordModal = ({ handleClose, onSuccess }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    if (password === PROFIT_PASSWORD) {
      sessionStorage.setItem(PROFIT_AUTH_KEY, "1");
      onSuccess();
    } else {
      setError("Contraseña incorrecta");
    }
  };

  return (
    <BaseModal handleClose={handleClose} size="small" showCloseIcon>
      <form className={mainClass} onSubmit={onSubmit}>
        <h3 className={mainClass + "__title"}>Ganancias</h3>
        <p className={mainClass + "__hint"}>
          Ingresá la contraseña para ver las ganancias.
        </p>

        <TextField
          label="Contraseña"
          error={error}
          inputProps={{
            type: "password",
            autoFocus: true,
            value: password,
            onChange: (e) => {
              setPassword(e.target.value);
              if (error) setError("");
            },
          }}
        />

        <div className={mainClass + "__actions"}>
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit">Entrar</Button>
        </div>
      </form>
    </BaseModal>
  );
};

export default ProfitPasswordModal;

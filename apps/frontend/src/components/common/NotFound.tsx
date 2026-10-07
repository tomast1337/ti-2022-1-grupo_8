import { Link } from "react-router";
import styles from "./NotFound.module.scss";

export const NotFound = () => (
    <div className={styles.notFound}>
        <h1>NEM UMA PIZZA POR AQUI!</h1>
        <Link to="/login">Voltar para o início 🍕 😋</Link>
    </div>
);

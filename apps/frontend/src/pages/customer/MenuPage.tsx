import { Link } from "react-router";
import { CustomerNav } from "../../components/customer/CustomerNav";
import { ProductCard } from "../../components/customer/ProductCard";
import {
    errorMessage,
    useGetPizzasQuery,
    useGetProductsQuery,
} from "../../services/api";
import styles from "./MenuPage.module.scss";

const BuildPizzaSection = () => (
    <div className="row justify-content-center mt-2">
        <div className="col-md-4">
            <div className="card text-center">
                <div className="card-header">Crie sua própria pizza</div>
                <div className="card-body">
                    <h5 className="card-title">Do seu jeitinho</h5>
                    <Link
                        to="/customer/build-pizza"
                        className="btn btn-primary"
                    >
                        Clique aqui
                    </Link>
                </div>
            </div>
        </div>
    </div>
);

export const MenuPage = () => {
    const pizzas = useGetPizzasQuery();
    const products = useGetProductsQuery();

    return (
        <div className={styles.body}>
            <CustomerNav current="menu" />
            {pizzas.isLoading || products.isLoading ? (
                <p className="text-center mt-4">Carregando...</p>
            ) : null}
            {pizzas.error ? (
                <p className="text-center text-danger mt-4">
                    {errorMessage(pizzas.error)}
                </p>
            ) : null}
            {products.error ? (
                <p className="text-center text-danger mt-4">
                    {errorMessage(products.error)}
                </p>
            ) : null}

            <div className="container mb-2 p-1 bg-transparent">
                <div className="row">
                    <h1 className="text-center">Mais pedidas 😋</h1>
                </div>
                <div className={styles.horizontalScroll}>
                    <div className="row">
                        {(pizzas.data ?? []).slice(0, 4).map((pizza) => (
                            <ProductCard
                                key={pizza.id}
                                kind="pizza"
                                item={pizza}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <hr />
            <div className="container mb-2 p-1 bg-transparent">
                <BuildPizzaSection />
            </div>
            <div className="container mb-2 p-1 bg-transparent">
                <div className="row mt-2">
                    <h3 className="text-center">Bebidas e Outros Produtos</h3>
                </div>
                <div
                    style={{
                        overflow: "auto",
                        display: "flex",
                        flexWrap: "nowrap",
                    }}
                >
                    {(products.data ?? []).map((product) => (
                        <div style={{ margin: "1rem" }} key={product.id}>
                            <ProductCard kind="product" item={product} />
                        </div>
                    ))}
                </div>
            </div>
            <hr />
            <div className="container mb-2 p-1 bg-transparent">
                <div className="row mt-2">
                    <h3 className="text-center">Todos os Sabores 🤔</h3>
                </div>
                <div className="row">
                    {(pizzas.data ?? []).map((pizza) => (
                        <ProductCard key={pizza.id} kind="pizza" item={pizza} />
                    ))}
                </div>
            </div>
            <hr />
        </div>
    );
};

import type { Order, OrderStatus } from "@pizzaria/dtos";
import { Link } from "react-router";
import { CustomerNav } from "../../components/customer/CustomerNav";
import { formatDateTime, formatMoney } from "../../lib/format";
import { errorMessage, useGetMyOrdersQuery } from "../../services/api";
import styles from "./MyOrdersPage.module.scss";

const STATUS_COLOR: Record<OrderStatus, string> = {
    placed: "danger",
    in_progress: "warning",
    completed: "success",
};

const STATUS_LABEL: Record<OrderStatus, string> = {
    placed: "Pendente",
    in_progress: "Preparando",
    completed: "Pronto",
};

const OrderCard = ({ order }: { order: Order }) => {
    const total = order.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
    );

    return (
        <div className="card" style={{ width: "18rem" }}>
            <div className="card-header text-center">
                <h5 className="card-title" style={{ fontSize: "1.15rem" }}>
                    Pedido #{order.id.slice(0, 8)}
                </h5>
                <p style={{ marginBottom: 0 }}>
                    {formatDateTime(order.createdAt)}
                </p>
            </div>
            <div
                className="card-body"
                style={{
                    fontFamily: "BenchNine",
                    fontSize: "1.25rem",
                    lineHeight: "1.1",
                    padding: "0.75rem 0.5rem",
                }}
            >
                <ul className="list-group list-group-flush">
                    {order.items.map((item) => (
                        <li key={item.id} className="list-group-item">
                            <div style={{ float: "left" }}>
                                <strong>{item.quantity}x </strong>
                                {item.name}
                            </div>
                            <div style={{ float: "right" }}>
                                <strong>
                                    {formatMoney(item.price * item.quantity)}
                                </strong>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="card-footer">
                <p
                    style={{
                        display: "inline-block",
                        float: "right",
                        marginBottom: 5,
                    }}
                >
                    Total: <strong>{formatMoney(total)}</strong>
                </p>
                <div
                    className={`badge rounded-pill bg-${STATUS_COLOR[order.status]}`}
                >
                    {STATUS_LABEL[order.status]}
                </div>
            </div>
        </div>
    );
};

export const MyOrdersPage = () => {
    const { data: orders, isLoading, error } = useGetMyOrdersQuery();

    return (
        <div className={styles.body}>
            <CustomerNav current="orders" />
            <div className="container mt-2 mb-2 p-0">
                <div className="row">
                    <h1 className="text-center">Meus Pedidos</h1>
                </div>
                {isLoading ? (
                    <p className="text-center">Carregando...</p>
                ) : null}
                {error ? (
                    <p className="text-center text-danger">
                        {errorMessage(error)}
                    </p>
                ) : null}
                <div className="row">
                    {orders && orders.length > 0 ? (
                        orders.map((order) => (
                            <div
                                key={order.id}
                                className="col-sm-12 col-md-6 col-lg-4 col-xl-3"
                            >
                                <OrderCard order={order} />
                            </div>
                        ))
                    ) : orders ? (
                        <div className="text-center text-white">
                            <h2>Poxa, nenhum pedido! 😱</h2>
                            <h5>
                                Por que não{" "}
                                <Link to="/customer/menu">fazer um agora</Link>?
                                😋
                            </h5>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

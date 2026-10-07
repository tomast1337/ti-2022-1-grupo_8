import type { Order } from "@pizzaria/dtos";
import { formatDateTime, ORDER_STATUS_LABEL } from "../../lib/format";

interface OrderCardProps {
    order: Order;
    /** When set, shows an "advance" button (employee queue). Hidden for completed orders. */
    onAdvance?: () => void;
    advancing?: boolean;
}

export const OrderCard = ({ order, onAdvance, advancing }: OrderCardProps) => (
    <div className="card" style={{ width: "18rem", lineHeight: "1" }}>
        <div className="card-header text-center">
            <h5 className="card-title" style={{ fontSize: "1.15rem" }}>
                Pedido #{order.id.slice(0, 8)}
            </h5>
            <p style={{ marginBottom: 0 }}>{formatDateTime(order.createdAt)}</p>
        </div>
        <div className="card-body">
            <p className="card-text">
                <strong>E-mail:</strong> {order.userEmail}
            </p>
            <p className="card-text">
                <strong>Endereço:</strong> {order.address}
            </p>
        </div>
        <ul className="list-group list-group-flush">
            {order.items.map((item) => (
                <li key={item.id} className="list-group-item">
                    <strong>{item.quantity}x </strong>
                    {item.name}
                </li>
            ))}
        </ul>
        <div className="card-footer">
            {onAdvance && order.status !== "completed" ? (
                <button
                    type="button"
                    className="btn btn-primary float-end"
                    onClick={onAdvance}
                    disabled={advancing}
                >
                    {"Avançar >"}
                </button>
            ) : (
                ORDER_STATUS_LABEL[order.status]
            )}
        </div>
    </div>
);

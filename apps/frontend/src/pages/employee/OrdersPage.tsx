import type { OrderStatus } from "@pizzaria/dtos";
import { useEffect } from "react";
import { OrderCard } from "../../components/common/OrderCard";
import { EmployeeNav } from "../../components/employee/EmployeeNav";
import {
    errorMessage,
    useCompleteOrderMutation,
    useGetEmployeeOrdersQuery,
    useStartOrderMutation,
} from "../../services/api";
import styles from "./OrdersPage.module.scss";

const POLLING_INTERVAL_MS = 15_000;
const MAX_COMPLETED_SHOWN = 4;

interface ColumnProps {
    status: OrderStatus;
    title: string;
    color: "danger" | "warning" | "success";
    emptyText: string;
    limit?: number;
    onAdvance?: (id: string) => void;
    advancing: boolean;
}

const OrderColumn = ({
    status,
    title,
    color,
    emptyText,
    limit,
    onAdvance,
    advancing,
}: ColumnProps) => {
    const { data, isLoading, error } = useGetEmployeeOrdersQuery(status, {
        pollingInterval: POLLING_INTERVAL_MS,
    });
    // the API lists oldest first: completed shows only the latest ones
    const orders = limit ? data?.slice(-limit) : data;

    return (
        <div className="col-md-4">
            <div className={`card text-center text-${color} border-${color}`}>
                <div className="card-body">
                    <h4 className="card-title">{title}</h4>
                </div>
            </div>
            {isLoading && (
                <div className="card">
                    <div className="card-body text-center">Carregando...</div>
                </div>
            )}
            {error && (
                <div className="alert alert-danger">{errorMessage(error)}</div>
            )}
            {orders?.map((order) => (
                <OrderCard
                    key={order.id}
                    order={order}
                    advancing={advancing}
                    onAdvance={
                        onAdvance ? () => onAdvance(order.id) : undefined
                    }
                />
            ))}
            {orders?.length === 0 && (
                <div className="card">
                    <div className="card-body">
                        <p className="text-center">{emptyText}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export const OrdersPage = () => {
    const [startOrder, start] = useStartOrderMutation();
    const [completeOrder, complete] = useCompleteOrderMutation();
    const mutationError = start.error ?? complete.error;

    useEffect(() => {
        document.title = "Pizzaria ON - Pedidos";
    }, []);

    const advancing = start.isLoading || complete.isLoading;

    return (
        <div className={styles.page}>
            <EmployeeNav />
            <h2 className="text-center">Pedidos</h2>
            <div className="container">
                {mutationError && (
                    <div className="alert alert-danger">
                        {errorMessage(mutationError)}
                    </div>
                )}
                <div className="row" style={{ padding: "20px" }}>
                    <OrderColumn
                        status="placed"
                        title="Pendentes"
                        color="danger"
                        emptyText="Nenhum pedido pendente!"
                        onAdvance={(id) => void startOrder(id)}
                        advancing={advancing}
                    />
                    <OrderColumn
                        status="in_progress"
                        title="Em andamento"
                        color="warning"
                        emptyText="Nenhum pedido em andamento!"
                        onAdvance={(id) => void completeOrder(id)}
                        advancing={advancing}
                    />
                    <OrderColumn
                        status="completed"
                        title="Prontos"
                        color="success"
                        emptyText="Nenhum pedido concluído!"
                        limit={MAX_COMPLETED_SHOWN}
                        advancing={advancing}
                    />
                </div>
            </div>
        </div>
    );
};

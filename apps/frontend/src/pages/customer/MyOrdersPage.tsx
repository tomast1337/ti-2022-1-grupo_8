import type { Order } from "@pizzaria/dtos";
import { Receipt, SmilePlus } from "lucide-react";
import { Link } from "react-router";
import { OrderStatusBadge } from "../../components/common/OrderStatusBadge";
import { CustomerNav } from "../../components/customer/CustomerNav";
import { CustomerPage } from "../../components/customer/CustomerPage";
import { Alert } from "../../components/ui/Alert";
import { buttonClass } from "../../components/ui/Button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../../components/ui/card";
import { Panel } from "../../components/ui/Panel";
import { formatDateTime, formatMoney } from "../../lib/format";
import { errorMessage, useGetMyOrdersQuery } from "../../services/api";

const OrderCard = ({ order }: { order: Order }) => {
    const total = order.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
    );

    return (
        <Card data-slot="order">
            <CardHeader>
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className="whitespace-nowrap">
                        Pedido #{order.id.slice(0, 8)}
                    </CardTitle>
                    <OrderStatusBadge status={order.status} />
                </div>
                <p className="m-0 text-sm font-semibold text-ink/60">
                    {formatDateTime(order.createdAt)}
                </p>
            </CardHeader>
            <CardContent>
                <ul className="m-0 list-none divide-y divide-ink/10 p-0">
                    {order.items.map((item) => (
                        <li
                            key={item.id}
                            className="flex justify-between gap-3 py-2 text-base text-ink"
                        >
                            <span>
                                <strong>{item.quantity}x</strong> {item.name}
                            </span>
                            <strong className="shrink-0">
                                {formatMoney(item.price * item.quantity)}
                            </strong>
                        </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter className="justify-end border-t border-ink/10 pt-4">
                <span className="text-lg text-ink">
                    Total: <strong>{formatMoney(total)}</strong>
                </span>
            </CardFooter>
        </Card>
    );
};

export const MyOrdersPage = () => {
    const { data: orders, isLoading, error } = useGetMyOrdersQuery();

    return (
        <CustomerPage>
            <CustomerNav current="orders" />
            <main className="mx-auto w-full max-w-7xl px-4 pt-6 pb-16">
                <h1 className="mb-8 flex items-center justify-center gap-3 text-center text-4xl font-extrabold tracking-wide text-white uppercase [text-shadow:1px_2px_6px_rgb(0_0_0/0.55)] sm:text-5xl">
                    <Receipt className="size-9" aria-hidden />
                    Meus Pedidos
                </h1>
                {isLoading ? (
                    <p className="text-center text-lg font-semibold">
                        Carregando...
                    </p>
                ) : null}
                {error ? <Alert>{errorMessage(error)}</Alert> : null}
                {orders && orders.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {orders.map((order) => (
                            <OrderCard key={order.id} order={order} />
                        ))}
                    </div>
                ) : orders ? (
                    <Panel className="mx-auto max-w-xl py-10 text-center">
                        <SmilePlus
                            className="mx-auto size-14 text-ink/30"
                            aria-hidden
                        />
                        <h2 className="mt-4 mb-2 text-3xl font-extrabold text-ink [text-shadow:none]">
                            Poxa, nenhum pedido!
                        </h2>
                        <p className="mb-6 text-lg text-ink/70">
                            Por que não fazer um agora?
                        </p>
                        <Link
                            to="/customer/menu"
                            className={buttonClass({ variant: "primary" })}
                        >
                            Ver o menu
                        </Link>
                    </Panel>
                ) : null}
            </main>
        </CustomerPage>
    );
};

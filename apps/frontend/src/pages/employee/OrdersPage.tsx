import type { OrderStatus } from "@pizzaria/dtos";
import { ChefHat, CircleCheck, Clock, type LucideIcon } from "lucide-react";
import { useEffect } from "react";
import { OrderCard } from "../../components/common/OrderCard";
import { EmployeeNav } from "../../components/employee/EmployeeNav";
import { EmployeePage } from "../../components/employee/EmployeePage";
import { Alert } from "../../components/ui/Alert";
import { Badge } from "../../components/ui/badge";
import { cn } from "../../components/ui/cn";
import {
    errorMessage,
    useCompleteOrderMutation,
    useGetEmployeeOrdersQuery,
    useStartOrderMutation,
} from "../../services/api";

const POLLING_INTERVAL_MS = 15_000;
const MAX_COMPLETED_SHOWN = 4;

type Tone = "danger" | "warning" | "success";

const TONE_STYLE: Record<Tone, { header: string; icon: string }> = {
    danger: {
        header: "border-tomato-600 text-tomato-700",
        icon: "bg-tomato-600",
    },
    warning: {
        header: "border-cheese-500 text-ink",
        icon: "bg-cheese-500 !text-ink",
    },
    success: {
        header: "border-basil-600 text-basil-700",
        icon: "bg-basil-600",
    },
};

interface ColumnProps {
    status: OrderStatus;
    title: string;
    tone: Tone;
    icon: LucideIcon;
    emptyText: string;
    limit?: number;
    onAdvance?: (id: string) => void;
    advancing: boolean;
}

const OrderColumn = ({
    status,
    title,
    tone,
    icon: Icon,
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
    const style = TONE_STYLE[tone];

    return (
        <section data-slot="column" aria-label={title} className="space-y-4">
            <header
                className={cn(
                    "flex items-center gap-3 rounded-2xl border-b-4 bg-white/90 px-4 py-3 shadow-panel backdrop-blur-md",
                    style.header,
                )}
            >
                <span
                    className={cn(
                        "flex size-9 items-center justify-center rounded-xl text-white",
                        style.icon,
                    )}
                >
                    <Icon className="size-5" aria-hidden />
                </span>
                <h2 className="m-0 flex-1 font-sans text-2xl font-extrabold tracking-normal text-current normal-case [text-shadow:none]">
                    {title}
                </h2>
                {data ? <Badge data-slot="count">{data.length}</Badge> : null}
            </header>
            {isLoading ? (
                <p className="text-center text-lg font-semibold">
                    Carregando...
                </p>
            ) : null}
            {error ? <Alert>{errorMessage(error)}</Alert> : null}
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
                <p className="rounded-2xl bg-white/70 px-4 py-6 text-center text-lg font-semibold text-ink/70">
                    {emptyText}
                </p>
            )}
        </section>
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
        <EmployeePage>
            <EmployeeNav />
            <main className="mx-auto w-full max-w-7xl px-4 pt-6 pb-16">
                <h1 className="mb-6 text-center text-4xl font-extrabold tracking-wide text-white uppercase [text-shadow:1px_2px_6px_rgb(0_0_0/0.55)] sm:text-5xl">
                    Pedidos
                </h1>
                {mutationError ? (
                    <div className="mb-4">
                        <Alert>{errorMessage(mutationError)}</Alert>
                    </div>
                ) : null}
                <div className="grid items-start gap-6 md:grid-cols-3">
                    <OrderColumn
                        status="placed"
                        title="Pendentes"
                        tone="danger"
                        icon={Clock}
                        emptyText="Nenhum pedido pendente!"
                        onAdvance={(id) => void startOrder(id)}
                        advancing={advancing}
                    />
                    <OrderColumn
                        status="in_progress"
                        title="Em andamento"
                        tone="warning"
                        icon={ChefHat}
                        emptyText="Nenhum pedido em andamento!"
                        onAdvance={(id) => void completeOrder(id)}
                        advancing={advancing}
                    />
                    <OrderColumn
                        status="completed"
                        title="Prontos"
                        tone="success"
                        icon={CircleCheck}
                        emptyText="Nenhum pedido concluído!"
                        limit={MAX_COMPLETED_SHOWN}
                        advancing={advancing}
                    />
                </div>
                <p className="mt-8 text-center text-sm font-semibold text-white [text-shadow:1px_1px_3px_black]">
                    Atualiza sozinho a cada {POLLING_INTERVAL_MS / 1000}{" "}
                    segundos. Em "Prontos" aparecem os {MAX_COMPLETED_SHOWN}{" "}
                    mais recentes.
                </p>
            </main>
        </EmployeePage>
    );
};

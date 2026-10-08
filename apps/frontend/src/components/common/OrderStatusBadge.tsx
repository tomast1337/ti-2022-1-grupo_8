import type { OrderStatus } from "@pizzaria/dtos";
import { ChefHat, CircleCheck, Clock, type LucideIcon } from "lucide-react";
import { Badge } from "../ui/badge";

const STATUS_STYLE: Record<
    OrderStatus,
    { tone: "danger" | "warning" | "success"; icon: LucideIcon }
> = {
    placed: { tone: "danger", icon: Clock },
    in_progress: { tone: "warning", icon: ChefHat },
    completed: { tone: "success", icon: CircleCheck },
};

/** Wording shown to customers (the employee queue has its own column titles). */
const CUSTOMER_LABEL: Record<OrderStatus, string> = {
    placed: "Pendente",
    in_progress: "Preparando",
    completed: "Pronto",
};

export const OrderStatusBadge = ({ status }: { status: OrderStatus }) => {
    const { tone, icon: Icon } = STATUS_STYLE[status];
    return (
        <Badge tone={tone}>
            <Icon className="size-4" aria-hidden />
            {CUSTOMER_LABEL[status]}
        </Badge>
    );
};

import type { OrderStatus } from "@pizzaria/dtos";
import { ChefHat, CircleCheck, Clock, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "../ui/badge";

const STATUS_STYLE: Record<
    OrderStatus,
    { tone: "danger" | "warning" | "success"; icon: LucideIcon }
> = {
    placed: { tone: "danger", icon: Clock },
    in_progress: { tone: "warning", icon: ChefHat },
    completed: { tone: "success", icon: CircleCheck },
};

export const OrderStatusBadge = ({ status }: { status: OrderStatus }) => {
    const { t } = useTranslation();
    const { tone, icon: Icon } = STATUS_STYLE[status];
    return (
        <Badge tone={tone}>
            <Icon className="size-4" aria-hidden />
            {t(`customerStatus.${status}`)}
        </Badge>
    );
};

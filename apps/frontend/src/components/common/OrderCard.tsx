import type { Order } from "@pizzaria/dtos";
import { ArrowRight, CircleCheck, Mail, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatDateTime, formatMoney } from "../../i18n/format";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { Badge } from "../ui/badge";
import { Button } from "../ui/Button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../ui/card";

interface OrderCardProps {
    order: Order;
    /** When set, shows an "advance" button (employee queue). Hidden for completed orders. */
    onAdvance?: () => void;
    advancing?: boolean;
}

/** Order as the kitchen sees it: who, where and what to prepare. */
export const OrderCard = ({ order, onAdvance, advancing }: OrderCardProps) => {
    const { t } = useTranslation();
    const total = order.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
    );

    return (
        <Card data-slot="order">
            <CardHeader>
                <CardTitle className="whitespace-nowrap">
                    {t("order.title", { id: order.id.slice(0, 8) })}
                </CardTitle>
                <p className="m-0 text-sm font-semibold text-ink/60">
                    {formatDateTime(order.createdAt)}
                </p>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="space-y-1 text-base text-ink">
                    <p className="m-0 flex items-start gap-2">
                        <Mail
                            className="mt-0.5 size-4 shrink-0 text-ink/50"
                            aria-hidden
                        />
                        <span className="min-w-0 break-words">
                            {order.userEmail}
                        </span>
                    </p>
                    <p className="m-0 flex items-start gap-2">
                        <MapPin
                            className="mt-0.5 size-4 shrink-0 text-ink/50"
                            aria-hidden
                        />
                        <span className="min-w-0 break-words">
                            {order.address}
                        </span>
                    </p>
                </div>
                <ul className="m-0 list-none divide-y divide-ink/10 border-t border-ink/10 p-0">
                    {order.items.map((item) => (
                        <li key={item.id} className="py-2 text-base text-ink">
                            <strong>{item.quantity}x</strong> {item.name}
                            {item.type === "custom_pizza" &&
                            item.description ? (
                                <span className="block text-sm text-ink/60">
                                    {item.description}
                                </span>
                            ) : null}
                        </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter className="border-t border-ink/10 pt-4">
                <span className="text-base text-ink">
                    {t("total")} <strong>{formatMoney(total)}</strong>
                </span>
                {onAdvance && order.status !== "completed" ? (
                    <Button size="sm" onClick={onAdvance} disabled={advancing}>
                        {t("advance")}
                        <ArrowRight className="size-4" aria-hidden />
                    </Button>
                ) : order.status === "completed" ? (
                    <Badge tone="success">
                        <CircleCheck className="size-4" aria-hidden />
                        {t("completed")}
                    </Badge>
                ) : (
                    <OrderStatusBadge status={order.status} />
                )}
            </CardFooter>
        </Card>
    );
};

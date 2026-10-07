import type { OrderStatus, PizzaSize } from "@pizzaria/dtos";

const currency = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
});

export const formatMoney = (value: number): string => currency.format(value);

export const formatDateTime = (iso: string | undefined): string => {
    if (!iso) return "Sem Data";
    const date = new Date(iso);
    const day = date.toLocaleDateString("pt-BR");
    const time = date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
    });
    return `${day} às ${time}`;
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
    placed: "Feito",
    in_progress: "Em andamento",
    completed: "Concluído",
};

export const PIZZA_SIZE_LABEL: Record<PizzaSize, string> = {
    small: "Pequena",
    medium: "Média",
    large: "Grande",
    family: "Família",
};

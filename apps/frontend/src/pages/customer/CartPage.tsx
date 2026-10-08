import type { CartItem } from "@pizzaria/dtos";
import {
    ArrowLeft,
    CupSoda,
    Minus,
    Pizza,
    Plus,
    ShoppingCart,
    Trash2,
    WandSparkles,
    type LucideIcon,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { CustomerNav } from "../../components/customer/CustomerNav";
import { CustomerPage } from "../../components/customer/CustomerPage";
import { Alert } from "../../components/ui/Alert";
import { Button, buttonClass } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Panel } from "../../components/ui/Panel";
import {
    addressChanged,
    cartCleared,
    itemRemoved,
    quantityChanged,
    selectAddress,
    selectCartItems,
    selectCartTotal,
} from "../../features/cart/cartSlice";
import { useTranslation } from "react-i18next";
import { formatMoney } from "../../i18n/format";
import { errorMessage, usePlaceOrderMutation } from "../../services/api";

const ITEM_ICON: Record<CartItem["type"], LucideIcon> = {
    pizza: Pizza,
    custom_pizza: WandSparkles,
    product: CupSoda,
};

const iconButton =
    "inline-flex size-9 cursor-pointer items-center justify-center rounded-lg border-0 bg-ink/5 text-ink transition hover:bg-ink/10 disabled:cursor-not-allowed disabled:opacity-40";

const CartRow = ({ item }: { item: CartItem }) => {
    const { t } = useTranslation("customer");
    const dispatch = useAppDispatch();
    const Icon = ITEM_ICON[item.type];
    const setQuantity = (quantity: number) =>
        dispatch(quantityChanged({ id: item.id, quantity }));

    return (
        <li
            data-slot="cart-item"
            className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl bg-white p-4 shadow-sm"
        >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-cheese-500/25 text-tomato-600">
                <Icon className="size-6" aria-hidden />
            </span>
            <div className="min-w-0 flex-1 basis-40">
                <p className="m-0 text-lg leading-tight font-extrabold text-ink">
                    {item.name}
                </p>
                {item.type === "custom_pizza" && item.description ? (
                    <p className="m-0 text-sm leading-snug text-ink/60">
                        {item.description}
                    </p>
                ) : null}
                <p className="m-0 text-sm font-semibold text-ink/60">
                    {t("cart.each", { price: formatMoney(item.price) })}
                </p>
            </div>
            <div
                className="flex items-center gap-2"
                role="group"
                aria-label={t("cart.quantityOf", { name: item.name })}
            >
                <button
                    type="button"
                    className={iconButton}
                    aria-label={t("cart.decrease")}
                    disabled={item.quantity === 1}
                    onClick={() => setQuantity(item.quantity - 1)}
                >
                    <Minus className="size-4" aria-hidden />
                </button>
                <span
                    data-slot="quantity"
                    className="w-8 text-center text-lg font-extrabold"
                >
                    {item.quantity}
                </span>
                <button
                    type="button"
                    className={iconButton}
                    aria-label={t("cart.increase")}
                    onClick={() => setQuantity(item.quantity + 1)}
                >
                    <Plus className="size-4" aria-hidden />
                </button>
            </div>
            <p
                data-slot="subtotal"
                className="m-0 w-24 text-right text-lg font-extrabold text-ink"
            >
                {formatMoney(item.price * item.quantity)}
            </p>
            <button
                type="button"
                className={`${iconButton} text-tomato-700 hover:bg-tomato-50`}
                aria-label={t("cart.remove", { name: item.name })}
                onClick={() => dispatch(itemRemoved(item.id))}
            >
                <Trash2 className="size-4" aria-hidden />
            </button>
        </li>
    );
};

export const CartPage = () => {
    const { t } = useTranslation("customer");
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const items = useAppSelector(selectCartItems);
    const total = useAppSelector(selectCartTotal);
    const address = useAppSelector(selectAddress);
    const [placeOrder, { isLoading, error }] = usePlaceOrderMutation();

    const handleCheckout = async () => {
        if (items.length === 0 || address.trim() === "") return;
        try {
            await placeOrder({ address, items }).unwrap();
        } catch {
            return; // the error is shown from the mutation state
        }
        dispatch(cartCleared());
        void navigate("/customer/orders");
    };

    return (
        <CustomerPage>
            <CustomerNav current="cart" />
            <main className="mx-auto w-full max-w-6xl px-4 pt-6 pb-16">
                <h1 className="mb-8 flex items-center justify-center gap-3 text-center text-4xl font-extrabold tracking-wide text-white uppercase [text-shadow:1px_2px_6px_rgb(0_0_0/0.55)] sm:text-5xl">
                    <ShoppingCart className="size-9" aria-hidden />
                    {t("cart.title")}
                </h1>

                {items.length === 0 ? (
                    <Panel className="mx-auto max-w-xl py-10 text-center">
                        <ShoppingCart
                            className="mx-auto size-14 text-ink/30"
                            aria-hidden
                        />
                        <h2 className="mt-4 mb-2 text-3xl font-extrabold text-ink [text-shadow:none]">
                            {t("cart.emptyTitle")}
                        </h2>
                        <p className="mb-6 text-lg text-ink/70">
                            {t("cart.emptyText")}
                        </p>
                        <Link
                            to="/customer/menu"
                            className={buttonClass({ variant: "primary" })}
                        >
                            {t("cart.backToMenu")}
                        </Link>
                    </Panel>
                ) : (
                    <div className="grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
                        <ul className="m-0 flex list-none flex-col gap-3 p-0">
                            {items.map((item) => (
                                <CartRow key={item.id} item={item} />
                            ))}
                        </ul>

                        <Panel className="space-y-4 lg:sticky lg:top-20">
                            <div className="flex items-baseline justify-between">
                                <span className="text-lg font-bold text-ink/70">
                                    {t("cart.total")}
                                </span>
                                <span
                                    data-slot="total"
                                    className="text-4xl font-extrabold text-ink"
                                >
                                    {formatMoney(total)}
                                </span>
                            </div>
                            <div className="space-y-2">
                                <label
                                    htmlFor="address"
                                    className="block text-lg font-extrabold text-ink"
                                >
                                    {t("cart.addressLabel")}
                                </label>
                                <Input
                                    id="address"
                                    type="text"
                                    placeholder={t("cart.addressPlaceholder")}
                                    autoComplete="street-address"
                                    value={address}
                                    onChange={(e) =>
                                        dispatch(addressChanged(e.target.value))
                                    }
                                />
                            </div>
                            {error ? (
                                <Alert>{errorMessage(error)}</Alert>
                            ) : null}
                            <Button
                                block
                                variant="secondary"
                                onClick={() => void handleCheckout()}
                                disabled={isLoading || address.trim() === ""}
                            >
                                {t("cart.checkout")}
                            </Button>
                            <div className="flex gap-3">
                                <Link
                                    to="/customer/menu"
                                    className={`${buttonClass({ variant: "ghost", size: "sm" })} flex-1`}
                                >
                                    <ArrowLeft className="size-4" aria-hidden />
                                    {t("cart.back")}
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex-1 whitespace-nowrap text-tomato-700"
                                    onClick={() => dispatch(cartCleared())}
                                    disabled={isLoading}
                                >
                                    <Trash2 className="size-4" aria-hidden />
                                    {t("cart.clear")}
                                </Button>
                            </div>
                        </Panel>
                    </div>
                )}
            </main>
        </CustomerPage>
    );
};

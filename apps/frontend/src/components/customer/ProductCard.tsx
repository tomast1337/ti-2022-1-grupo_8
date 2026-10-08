import type { Pizza, Product } from "@pizzaria/dtos";
import { Check, ImageOff, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { itemAdded, selectCartItems } from "../../features/cart/cartSlice";
import { formatMoney } from "../../lib/format";
import { imageUrl } from "../../lib/images";
import { Badge } from "../ui/badge";
import { Button } from "../ui/Button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardMedia,
    CardTitle,
} from "../ui/card";
import { cn } from "../ui/cn";

type ProductCardProps = { className?: string } & (
    { kind: "pizza"; item: Pizza } | { kind: "product"; item: Product }
);

export const ProductCard = ({ kind, item, className }: ProductCardProps) => {
    const dispatch = useAppDispatch();
    const inCart = useAppSelector(selectCartItems).some(
        (cartItem) => cartItem.id === item.id,
    );

    const [imageFailed, setImageFailed] = useState(false);

    const handleAdd = () => {
        dispatch(
            itemAdded({
                type: kind,
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: 1,
            }),
        );
    };

    return (
        <Card className={cn("h-full", className)}>
            <CardMedia>
                {item.image && !imageFailed ? (
                    <img
                        src={imageUrl(item.image)}
                        alt={item.name}
                        loading="lazy"
                        onError={() => setImageFailed(true)}
                        className="size-full object-cover transition duration-500 group-hover/card:scale-105"
                    />
                ) : (
                    <div
                        role="img"
                        aria-label={item.name}
                        className="flex size-full items-center justify-center text-ink/30"
                    >
                        <ImageOff className="size-12" aria-hidden />
                    </div>
                )}
            </CardMedia>
            <CardHeader>
                <CardTitle>{item.name}</CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription>{item.description}</CardDescription>
            </CardContent>
            <CardFooter>
                <span className="text-2xl font-extrabold">
                    {formatMoney(item.price)}
                </span>
                {inCart ? (
                    <Badge tone="success">
                        <Check className="size-4" aria-hidden />
                        Produto no carrinho!
                    </Badge>
                ) : (
                    <Button
                        variant="secondary"
                        size="sm"
                        className="whitespace-nowrap"
                        onClick={handleAdd}
                    >
                        <ShoppingCart className="size-4" aria-hidden />
                        Adicionar ao carrinho
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
};

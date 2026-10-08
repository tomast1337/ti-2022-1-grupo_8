import { useTranslation } from "react-i18next";
import { Check, ImageOff } from "lucide-react";
import { useState } from "react";
import { formatMoney } from "../../i18n/format";
import { imageUrl } from "../../lib/images";
import { Button } from "../ui/Button";
import { Card, CardContent, CardMedia, CardTitle } from "../ui/card";
import { cn } from "../ui/cn";

interface CatalogCardProps {
    name: string;
    image: string;
    price?: number;
    selected: boolean;
    onToggle: () => void;
}

/** Catalog entry in the admin lists: pick it to load it into the form below. */
export const CatalogCard = ({
    name,
    image,
    price,
    selected,
    onToggle,
}: CatalogCardProps) => {
    const { t } = useTranslation("admin");
    const [failed, setFailed] = useState(false);

    return (
        <Card
            className={cn(
                "w-56 shrink-0 snap-start",
                selected && "ring-4 ring-cheese-500",
            )}
        >
            <CardMedia className="aspect-square">
                {image && !failed ? (
                    <img
                        src={imageUrl(image)}
                        alt={name}
                        loading="lazy"
                        onError={() => setFailed(true)}
                        className="size-full object-cover"
                    />
                ) : (
                    <div
                        role="img"
                        aria-label={name}
                        className="flex size-full items-center justify-center text-ink/30"
                    >
                        <ImageOff className="size-10" aria-hidden />
                    </div>
                )}
            </CardMedia>
            <CardContent className="space-y-1 pt-4">
                <CardTitle className="text-lg">{name}</CardTitle>
                {price === undefined ? null : (
                    <p className="m-0 font-bold text-ink/70">
                        {formatMoney(price)}
                    </p>
                )}
            </CardContent>
            <div className="px-5 pb-5">
                <Button
                    block
                    size="sm"
                    variant={selected ? "accent" : "secondary"}
                    onClick={onToggle}
                >
                    {selected ? <Check className="size-4" aria-hidden /> : null}
                    {selected ? t("catalog.unselect") : t("catalog.select")}
                </Button>
            </div>
        </Card>
    );
};

/** Horizontal scroller that holds catalog cards. */
export const CatalogRow = ({ children }: { children: React.ReactNode }) => (
    <div className="flex snap-x gap-4 overflow-x-auto pb-3">{children}</div>
);

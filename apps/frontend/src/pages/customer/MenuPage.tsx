import { useTranslation } from "react-i18next";
import { Flame, GlassWater, Pizza, Wand2 } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { CustomerNav } from "../../components/customer/CustomerNav";
import { CustomerPage } from "../../components/customer/CustomerPage";
import { ProductCard } from "../../components/customer/ProductCard";
import { buttonClass } from "../../components/ui/Button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../../components/ui/card";
import {
    errorMessage,
    useGetPizzasQuery,
    useGetProductsQuery,
} from "../../services/api";

const SectionTitle = ({
    icon,
    children,
}: {
    icon: ReactNode;
    children: ReactNode;
}) => (
    <h2 className="mt-10 mb-6 flex items-center justify-center gap-3 text-center text-3xl font-extrabold tracking-wide text-white uppercase [text-shadow:1px_2px_6px_rgb(0_0_0/0.55)] sm:text-4xl">
        {icon}
        {children}
    </h2>
);

const Grid = ({ children }: { children: ReactNode }) => (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {children}
    </div>
);

const BuildPizzaSection = () => {
    const { t } = useTranslation("customer");
    return (
        <Card className="mx-auto max-w-md text-center">
            <CardHeader className="items-center">
                <Wand2 className="size-8 text-tomato-600" aria-hidden />
                <CardTitle>{t("menu.buildTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription>{t("menu.buildSubtitle")}</CardDescription>
            </CardContent>
            <CardFooter className="justify-center">
                <Link
                    to="/customer/build-pizza"
                    className={buttonClass({ variant: "primary" })}
                >
                    {t("menu.buildCta")}
                </Link>
            </CardFooter>
        </Card>
    );
};

const Message = ({
    error,
    children,
}: {
    error?: boolean;
    children: ReactNode;
}) => (
    <p
        className={`mt-6 text-center text-lg font-semibold ${error ? "text-tomato-700" : "text-ink"}`}
    >
        {children}
    </p>
);

export const MenuPage = () => {
    const { t } = useTranslation("customer");
    const pizzas = useGetPizzasQuery();
    const products = useGetProductsQuery();

    return (
        <CustomerPage>
            <CustomerNav current="menu" />
            <main className="mx-auto w-full max-w-7xl px-4 pb-16">
                {pizzas.isLoading || products.isLoading ? (
                    <Message>{t("loading")}</Message>
                ) : null}
                {pizzas.error ? (
                    <Message error>{errorMessage(pizzas.error)}</Message>
                ) : null}
                {products.error ? (
                    <Message error>{errorMessage(products.error)}</Message>
                ) : null}

                <SectionTitle icon={<Flame className="size-8" aria-hidden />}>
                    {t("menu.popular")}
                </SectionTitle>
                <Grid>
                    {(pizzas.data ?? []).slice(0, 4).map((pizza) => (
                        <ProductCard key={pizza.id} kind="pizza" item={pizza} />
                    ))}
                </Grid>

                <div className="mt-12">
                    <BuildPizzaSection />
                </div>

                <SectionTitle
                    icon={<GlassWater className="size-8" aria-hidden />}
                >
                    {t("menu.drinks")}
                </SectionTitle>
                <div className="-mx-4 flex snap-x gap-6 overflow-x-auto px-4 pb-4">
                    {(products.data ?? []).map((product) => (
                        <div
                            key={product.id}
                            className="w-72 shrink-0 snap-start"
                        >
                            <ProductCard kind="product" item={product} />
                        </div>
                    ))}
                </div>

                <SectionTitle icon={<Pizza className="size-8" aria-hidden />}>
                    {t("menu.allFlavors")}
                </SectionTitle>
                <Grid>
                    {(pizzas.data ?? []).map((pizza) => (
                        <ProductCard key={pizza.id} kind="pizza" item={pizza} />
                    ))}
                </Grid>
            </main>
        </CustomerPage>
    );
};

import type { ReportRow } from "@pizzaria/dtos";
import { BarChart3, TrendingUp } from "lucide-react";
import { useState } from "react";
import { AdminNav } from "../../components/admin/AdminNav";
import { AdminPage } from "../../components/admin/AdminPage";
import { Alert } from "../../components/ui/Alert";
import { Field } from "../../components/ui/Field";
import { Input } from "../../components/ui/Input";
import { PageTitle } from "../../components/ui/PageTitle";
import { Panel } from "../../components/ui/Panel";
import { formatMoney } from "../../lib/format";
import { errorMessage, useGetReportQuery } from "../../services/api";

interface ReportTableProps {
    title: string;
    quantityLabel: string;
    revenueLabel: string;
    rows: ReportRow[];
}

const ReportTable = ({
    title,
    quantityLabel,
    revenueLabel,
    rows,
}: ReportTableProps) => (
    <Panel data-slot="report" className="space-y-4">
        <h2 className="m-0 flex items-center gap-2 font-sans text-2xl font-extrabold tracking-normal text-ink normal-case [text-shadow:none]">
            <TrendingUp className="size-6 text-tomato-600" aria-hidden />
            {title}
        </h2>
        <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-base text-ink">
                <thead>
                    <tr className="border-b-2 border-ink/15">
                        <th scope="col" className="py-2 pr-4">
                            Nome
                        </th>
                        <th scope="col" className="px-4 py-2 text-right">
                            {quantityLabel}
                        </th>
                        <th scope="col" className="py-2 pl-4 text-right">
                            {revenueLabel}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr
                            key={row.id}
                            className="border-b border-ink/10 hover:bg-ink/5"
                        >
                            <td className="py-2 pr-4">{row.name}</td>
                            <td className="px-4 py-2 text-right">
                                {row.quantity}
                            </td>
                            <td className="py-2 pl-4 text-right">
                                {formatMoney(row.revenue)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <p className="m-0 text-right text-lg text-ink/70">
            Total:{" "}
            <strong className="text-3xl text-ink">
                {formatMoney(
                    rows.reduce((total, row) => total + row.revenue, 0),
                )}
            </strong>
        </p>
    </Panel>
);

/** Administrator home: sales report, optionally filtered by date range. */
export const AdminHomePage = () => {
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const {
        data: report,
        isLoading,
        error,
    } = useGetReportQuery({
        from: from || undefined,
        to: to || undefined,
    });

    return (
        <AdminPage>
            <AdminNav current="home" />
            <main className="mx-auto w-full max-w-5xl space-y-6 px-4 pb-16">
                <PageTitle>
                    <BarChart3 className="size-9" aria-hidden />
                    Relatórios
                </PageTitle>
                <Panel className="grid gap-4 sm:grid-cols-2">
                    <Field label="De" htmlFor="from">
                        <Input
                            type="date"
                            id="from"
                            value={from}
                            max={to || undefined}
                            onChange={(e) => setFrom(e.target.value)}
                        />
                    </Field>
                    <Field label="Até" htmlFor="to">
                        <Input
                            type="date"
                            id="to"
                            value={to}
                            min={from || undefined}
                            onChange={(e) => setTo(e.target.value)}
                        />
                    </Field>
                </Panel>
                {isLoading && (
                    <p className="text-center text-lg font-semibold text-white">
                        Carregando...
                    </p>
                )}
                {error && <Alert>{errorMessage(error)}</Alert>}
                {report && (
                    <>
                        <ReportTable
                            title="Pizzas Mais Compradas"
                            quantityLabel="Quantidade"
                            revenueLabel="Lucro"
                            rows={report.pizzas}
                        />
                        <ReportTable
                            title="Ingredientes Mais Utilizados"
                            quantityLabel="Porções"
                            revenueLabel="Custo"
                            rows={report.ingredients}
                        />
                        <ReportTable
                            title="Produtos Mais Comprados"
                            quantityLabel="Quantidade"
                            revenueLabel="Lucro"
                            rows={report.products}
                        />
                    </>
                )}
            </main>
        </AdminPage>
    );
};

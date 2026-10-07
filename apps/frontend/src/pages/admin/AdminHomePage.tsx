import { useState } from "react";
import type { ReportRow } from "@pizzaria/dtos";
import { AdminNav } from "../../components/admin/AdminNav";
import { errorMessage, useGetReportQuery } from "../../services/api";
import { formatMoney } from "../../lib/format";
import styles from "./AdminHomePage.module.scss";

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
    <>
        <div className="row">
            <h2 className="text-center">{title}</h2>
        </div>
        <div className="row" style={{ width: "90%", margin: "auto" }}>
            <table className="table table-striped table-dark">
                <thead>
                    <tr>
                        <th scope="col">Nome</th>
                        <th scope="col">{quantityLabel}</th>
                        <th scope="col">{revenueLabel}</th>
                    </tr>
                </thead>
                <tbody className="table-hover">
                    {rows.map((row) => (
                        <tr key={row.id}>
                            <td>{row.name}</td>
                            <td>{row.quantity}</td>
                            <td>{formatMoney(row.revenue)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <h3 style={{ fontSize: "1.5rem", textAlign: "right" }}>
                Total:{" "}
                <span style={{ fontSize: "2.5rem" }}>
                    {formatMoney(
                        rows.reduce((total, row) => total + row.revenue, 0),
                    )}
                </span>
            </h3>
        </div>
    </>
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
        <div className={styles.body}>
            <AdminNav current="home" />
            <div className="container mb-2 p-1 bg-transparent">
                <div className="row">
                    <h1 className="text-center">Relatórios</h1>
                </div>
                <div className="row section mb-3 mx-auto">
                    <div className="col-md-6">
                        <label htmlFor="from">De</label>
                        <input
                            type="date"
                            className="form-control"
                            id="from"
                            value={from}
                            max={to || undefined}
                            onChange={(e) => setFrom(e.target.value)}
                        />
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="to">Até</label>
                        <input
                            type="date"
                            className="form-control"
                            id="to"
                            value={to}
                            min={from || undefined}
                            onChange={(e) => setTo(e.target.value)}
                        />
                    </div>
                </div>
                {isLoading && <p className="text-center">Carregando...</p>}
                {error && (
                    <div className="alert alert-danger" role="alert">
                        {errorMessage(error)}
                    </div>
                )}
                {report && (
                    <>
                        <ReportTable
                            title="Pizzas Mais Compradas 📈"
                            quantityLabel="Quantidade"
                            revenueLabel="Lucro"
                            rows={report.pizzas}
                        />
                        <hr />
                        <ReportTable
                            title="Ingredientes Mais Utilizados 📈"
                            quantityLabel="Porções"
                            revenueLabel="Custo"
                            rows={report.ingredients}
                        />
                        <hr />
                        <ReportTable
                            title="Produtos Mais Comprados 📈"
                            quantityLabel="Quantidade"
                            revenueLabel="Lucro"
                            rows={report.products}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

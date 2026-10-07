import { useState } from "react";
import type { Role } from "@pizzaria/dtos";
import { AdminNav } from "../../components/admin/AdminNav";
import { OrderCard } from "../../components/common/OrderCard";
import {
    errorMessage,
    useDeleteUserMutation,
    useGetUserQuery,
    useGetUsersQuery,
    useSetUserRoleMutation,
} from "../../services/api";
import styles from "./ManageUsersPage.module.scss";

const ROLE_LABEL: Record<Role, string> = {
    customer: "Usuário",
    admin: "Administrador",
    employee: "Funcionário",
};
const ROLES: Role[] = ["customer", "admin", "employee"];

interface UserDetailsProps {
    userId: string;
    onBack: () => void;
}

const UserDetails = ({ userId, onBack }: UserDetailsProps) => {
    const { data: user, isLoading, error } = useGetUserQuery(userId);
    const [setUserRole, { isLoading: saving }] = useSetUserRoleMutation();
    const [deleteUser, { isLoading: deleting }] = useDeleteUserMutation();
    const [pickedRole, setPickedRole] = useState<Role | null>(null);
    const [actionError, setActionError] = useState("");

    if (isLoading) return <p>Carregando...</p>;
    if (error || !user) {
        return (
            <div className="alert alert-danger" role="alert">
                {error
                    ? errorMessage(error)
                    : "Usuário não encontrado. Tente novamente!"}
            </div>
        );
    }

    const role = pickedRole ?? user.role;

    const confirmRole = async () => {
        try {
            await setUserRole({ id: user.id, role }).unwrap();
            setPickedRole(null);
            setActionError("");
        } catch (err) {
            setActionError(errorMessage(err));
        }
    };

    const remove = async () => {
        if (!window.confirm(`Deseja realmente excluir ${user.email}?`)) return;
        try {
            await deleteUser(user.id).unwrap();
            onBack();
        } catch (err) {
            setActionError(errorMessage(err));
        }
    };

    return (
        <>
            {actionError && (
                <div className="alert alert-danger" role="alert">
                    {actionError}
                </div>
            )}
            <div className="row section mt-2">
                <h3>Nome:</h3>
                <div>{user.name}</div>
            </div>

            <div className="row section mt-2">
                <h3>Email:</h3>
                <div>{user.email}</div>
            </div>

            <div className="row section mt-2">
                <h3>Tipo:</h3>
                <div style={{ fontSize: "1.3em" }}>
                    <div className="form-check form-switch">
                        {ROLES.map((option) => (
                            <div key={option}>
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="role"
                                    id={`role-${option}`}
                                    value={option}
                                    checked={role === option}
                                    onChange={() => setPickedRole(option)}
                                />
                                <label
                                    className="form-check-label"
                                    htmlFor={`role-${option}`}
                                >
                                    {ROLE_LABEL[option]}
                                </label>
                            </div>
                        ))}
                        <div className="d-grid gap-2 col-2 mx-auto">
                            <button
                                type="button"
                                className="btn btn-success"
                                onClick={confirmRole}
                                disabled={saving || role === user.role}
                            >
                                Confirmar
                            </button>
                            <button
                                type="button"
                                className="btn btn-warning"
                                onClick={onBack}
                            >
                                Voltar
                            </button>
                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={remove}
                                disabled={deleting}
                            >
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row section mt-2">
                <h3>Pedidos Registrados:</h3>
            </div>
            <div className="row section mt-2 mx-auto">
                {user.orders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                ))}
            </div>
        </>
    );
};

/** Admin page to list users, change their role, delete them and see orders. */
export const ManageUsersPage = () => {
    const { data: users = [], isLoading, error } = useGetUsersQuery();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    const term = search.trim().toLowerCase();
    const filtered = users.filter(
        (user) =>
            user.email.toLowerCase().includes(term) ||
            user.name.toLowerCase().includes(term),
    );

    return (
        <div className={styles.body}>
            <AdminNav current="users" />
            <div className="container mb-2 p-1 bg-transparent">
                {selectedId ? (
                    <UserDetails
                        key={selectedId}
                        userId={selectedId}
                        onBack={() => setSelectedId(null)}
                    />
                ) : (
                    <div className="row section mt-2 mx-auto">
                        <div
                            className="form-group"
                            style={{ fontSize: "1.5em" }}
                        >
                            <label htmlFor="search">Email</label>
                            <input
                                type="search"
                                className="form-control"
                                id="search"
                                placeholder="Email"
                                autoComplete="off"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        {isLoading && <p className="mt-2">Carregando...</p>}
                        {error && (
                            <div
                                className="alert alert-danger mt-2"
                                role="alert"
                            >
                                {errorMessage(error)}
                            </div>
                        )}
                        <table className="table table-hover mt-2">
                            <thead>
                                <tr>
                                    <th scope="col">Nome</th>
                                    <th scope="col">Email</th>
                                    <th scope="col">Tipo</th>
                                    <th scope="col" />
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((user) => (
                                    <tr key={user.id}>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>{ROLE_LABEL[user.role]}</td>
                                        <td>
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                onClick={() =>
                                                    setSelectedId(user.id)
                                                }
                                            >
                                                Selecionar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

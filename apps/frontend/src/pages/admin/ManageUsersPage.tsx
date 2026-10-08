import { useState } from "react";
import type { Role } from "@pizzaria/dtos";
import { ArrowLeft, Check, Trash2, Users } from "lucide-react";
import { AdminNav } from "../../components/admin/AdminNav";
import { AdminPage } from "../../components/admin/AdminPage";
import { OrderCard } from "../../components/common/OrderCard";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { Input } from "../../components/ui/Input";
import { PageTitle } from "../../components/ui/PageTitle";
import { Panel } from "../../components/ui/Panel";
import { cn } from "../../components/ui/cn";
import {
    errorMessage,
    useDeleteUserMutation,
    useGetUserQuery,
    useGetUsersQuery,
    useSetUserRoleMutation,
} from "../../services/api";

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

    if (isLoading) {
        return (
            <p className="text-center text-lg font-semibold text-white">
                Carregando...
            </p>
        );
    }
    if (error || !user) {
        return (
            <Alert>
                {error
                    ? errorMessage(error)
                    : "Usuário não encontrado. Tente novamente!"}
            </Alert>
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
        <div className="space-y-6">
            {actionError && <Alert>{actionError}</Alert>}
            <Panel className="space-y-5">
                <dl className="m-0 grid gap-4 sm:grid-cols-2">
                    <div>
                        <dt className="text-sm font-bold text-ink/60">Nome</dt>
                        <dd className="m-0 text-xl font-extrabold text-ink">
                            {user.name}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-sm font-bold text-ink/60">Email</dt>
                        <dd className="m-0 text-xl font-extrabold break-all text-ink">
                            {user.email}
                        </dd>
                    </div>
                </dl>
                <fieldset className="m-0 mt-5 min-w-0 border-0 p-0">
                    <legend className="mb-2 p-0 text-base font-extrabold text-ink">
                        Tipo
                    </legend>
                    <div className="grid gap-3 sm:grid-cols-3">
                        {ROLES.map((option) => (
                            <div key={option}>
                                <input
                                    className="peer sr-only"
                                    type="radio"
                                    name="role"
                                    id={`role-${option}`}
                                    value={option}
                                    checked={role === option}
                                    onChange={() => setPickedRole(option)}
                                />
                                <label
                                    htmlFor={`role-${option}`}
                                    className={cn(
                                        "flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-transparent bg-white px-4 py-3 text-lg font-bold text-ink shadow-sm transition",
                                        "peer-focus-visible:outline-2 peer-focus-visible:outline-tomato-600",
                                        role === option &&
                                            "border-tomato-600 text-tomato-700",
                                    )}
                                >
                                    {role === option ? (
                                        <Check className="size-5" aria-hidden />
                                    ) : null}
                                    {ROLE_LABEL[option]}
                                </label>
                            </div>
                        ))}
                    </div>
                </fieldset>
                <div className="mt-5 flex flex-wrap gap-3">
                    <Button
                        variant="secondary"
                        onClick={() => void confirmRole()}
                        disabled={saving || role === user.role}
                    >
                        <Check className="size-5" aria-hidden />
                        Confirmar
                    </Button>
                    <Button variant="ghost" onClick={onBack}>
                        <ArrowLeft className="size-5" aria-hidden />
                        Voltar
                    </Button>
                    <Button
                        className="ml-auto"
                        onClick={() => void remove()}
                        disabled={deleting}
                    >
                        <Trash2 className="size-5" aria-hidden />
                        Excluir
                    </Button>
                </div>
            </Panel>
            <h2 className="m-0 text-center font-sans text-3xl font-extrabold tracking-normal text-white normal-case [text-shadow:1px_2px_6px_rgb(0_0_0/0.55)]">
                Pedidos Registrados
            </h2>
            {user.orders.length === 0 ? (
                <p className="text-center text-lg font-semibold text-white">
                    Nenhum pedido ainda.
                </p>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {user.orders.map((order) => (
                        <OrderCard key={order.id} order={order} />
                    ))}
                </div>
            )}
        </div>
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
        <AdminPage>
            <AdminNav current="users" />
            <main className="mx-auto w-full max-w-5xl space-y-6 px-4 pb-16">
                <PageTitle>
                    <Users className="size-9" aria-hidden />
                    Usuários
                </PageTitle>
                {selectedId ? (
                    <UserDetails
                        key={selectedId}
                        userId={selectedId}
                        onBack={() => setSelectedId(null)}
                    />
                ) : (
                    <Panel className="space-y-4">
                        <Field label="Email" htmlFor="search">
                            <Input
                                type="search"
                                id="search"
                                placeholder="Email"
                                autoComplete="off"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </Field>
                        {isLoading && <p>Carregando...</p>}
                        {error && <Alert>{errorMessage(error)}</Alert>}
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left text-base text-ink">
                                <thead>
                                    <tr className="border-b-2 border-ink/15">
                                        <th scope="col" className="py-2 pr-4">
                                            Nome
                                        </th>
                                        <th scope="col" className="px-4 py-2">
                                            Email
                                        </th>
                                        <th scope="col" className="px-4 py-2">
                                            Tipo
                                        </th>
                                        <th scope="col" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="border-b border-ink/10 hover:bg-ink/5"
                                        >
                                            <td className="py-2 pr-4">
                                                {user.name}
                                            </td>
                                            <td className="px-4 py-2">
                                                {user.email}
                                            </td>
                                            <td className="px-4 py-2">
                                                {ROLE_LABEL[user.role]}
                                            </td>
                                            <td className="py-2 pl-4 text-right">
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        setSelectedId(user.id)
                                                    }
                                                >
                                                    Selecionar
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Panel>
                )}
            </main>
        </AdminPage>
    );
};

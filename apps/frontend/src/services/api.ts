import i18next from "i18next";
import {
    createApi,
    fetchBaseQuery,
    type BaseQueryFn,
    type FetchArgs,
    type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type {
    Ingredient,
    LoginInput,
    LoginResponse,
    Order,
    OrderStatus,
    PlaceOrderInput,
    Pizza,
    Product,
    RegisterInput,
    Report,
    Role,
    User,
} from "@pizzaria/dtos";
import { API_URL } from "../lib/config";
import { signedIn, signedOut } from "../features/session/sessionSlice";
import { refreshSession } from "./refresh";

interface TokenState {
    session: { token: string | null };
}

const rawBaseQuery = fetchBaseQuery({
    baseUrl: API_URL,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as TokenState).session.token;
        if (token) headers.set("authorization", `Bearer ${token}`);
        return headers;
    },
});

/**
 * Access tokens are short-lived: on a 401 it refreshes the session once and
 * retries the request, and signs the user out only if that fails too.
 */
const baseQuery: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    let result = await rawBaseQuery(args, api, extraOptions);
    const isAuthEndpoint =
        typeof args === "object" && args.url.startsWith("/auth/");
    if (result.error?.status === 401 && !isAuthEndpoint) {
        const session = await refreshSession();
        if (session) {
            api.dispatch(signedIn(session));
            result = await rawBaseQuery(args, api, extraOptions);
        } else {
            api.dispatch(signedOut());
        }
    }
    return result;
};

/**
 * User-facing text for an API error. The API sends a stable `code` (and
 * `params`) that is translated here; without a known code its English
 * `error` message is shown as is.
 */
export const errorMessage = (error: unknown): string => {
    const data = (error as { data?: unknown } | undefined)?.data;
    if (!data || typeof data !== "object")
        return i18next.t("common:errors.unknown");
    const {
        code,
        params,
        error: message,
    } = data as {
        code?: string;
        params?: Record<string, string>;
        error?: unknown;
    };
    if (code && i18next.exists(`common:errors.${code}`)) {
        const translated = Object.fromEntries(
            Object.entries(params ?? {}).map(([key, value]) => [
                key,
                i18next.exists(`common:errors.entities.${value}`)
                    ? i18next.t(`common:errors.entities.${value}` as never)
                    : value,
            ]),
        );
        return i18next.t(`common:errors.${code}` as never, translated);
    }
    return message ? String(message) : i18next.t("common:errors.unknown");
};

export type UserWithOrders = User & { orders: Order[] };

type SaveArgs = { id?: string; form: FormData };

export const api = createApi({
    reducerPath: "api",
    baseQuery,
    tagTypes: ["Ingredient", "Pizza", "Product", "Order", "User"],
    endpoints: (build) => ({
        /* ---------- auth ---------- */
        login: build.mutation<LoginResponse, LoginInput>({
            query: (body) => ({ url: "/auth/login", method: "POST", body }),
        }),
        register: build.mutation<User, RegisterInput>({
            query: (body) => ({ url: "/auth/register", method: "POST", body }),
        }),

        /* ---------- catalog (any logged user) ---------- */
        getIngredients: build.query<Ingredient[], void>({
            query: () => "/catalog/ingredients",
            providesTags: ["Ingredient"],
        }),
        getPizzas: build.query<Pizza[], void>({
            query: () => "/catalog/pizzas",
            providesTags: ["Pizza"],
        }),
        getProducts: build.query<Product[], void>({
            query: () => "/catalog/products",
            providesTags: ["Product"],
        }),

        /* ---------- customer ---------- */
        getMyOrders: build.query<Order[], void>({
            query: () => "/customer/orders",
            providesTags: ["Order"],
        }),
        placeOrder: build.mutation<Order, PlaceOrderInput>({
            query: (body) => ({
                url: "/customer/orders",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Order"],
        }),

        /* ---------- employee ---------- */
        getEmployeeOrders: build.query<Order[], OrderStatus | void>({
            query: (status) =>
                status
                    ? `/employee/orders?status=${status}`
                    : "/employee/orders",
            providesTags: ["Order"],
        }),
        startOrder: build.mutation<Order, string>({
            query: (id) => ({
                url: `/employee/orders/${id}/start`,
                method: "POST",
            }),
            invalidatesTags: ["Order"],
        }),
        completeOrder: build.mutation<Order, string>({
            query: (id) => ({
                url: `/employee/orders/${id}/complete`,
                method: "POST",
            }),
            invalidatesTags: ["Order"],
        }),

        /* ---------- admin: users ---------- */
        getUsers: build.query<User[], void>({
            query: () => "/admin/users",
            providesTags: ["User"],
        }),
        getUser: build.query<UserWithOrders, string>({
            query: (id) => `/admin/users/${id}`,
            providesTags: ["User", "Order"],
        }),
        setUserRole: build.mutation<User, { id: string; role: Role }>({
            query: ({ id, role }) => ({
                url: `/admin/users/${id}/role`,
                method: "PATCH",
                body: { role },
            }),
            invalidatesTags: ["User"],
        }),
        deleteUser: build.mutation<User, string>({
            query: (id) => ({ url: `/admin/users/${id}`, method: "DELETE" }),
            invalidatesTags: ["User"],
        }),

        /* ---------- admin: catalog (multipart forms, fields: see dtos *Input) ---------- */
        saveIngredient: build.mutation<Ingredient, SaveArgs>({
            query: ({ id, form }) => ({
                url: id ? `/admin/ingredients/${id}` : "/admin/ingredients",
                method: id ? "PUT" : "POST",
                body: form,
            }),
            // pizza prices depend on ingredient prices
            invalidatesTags: ["Ingredient", "Pizza"],
        }),
        deleteIngredient: build.mutation<Ingredient, string>({
            query: (id) => ({
                url: `/admin/ingredients/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Ingredient", "Pizza"],
        }),
        savePizza: build.mutation<Pizza, SaveArgs>({
            query: ({ id, form }) => ({
                url: id ? `/admin/pizzas/${id}` : "/admin/pizzas",
                method: id ? "PUT" : "POST",
                body: form,
            }),
            invalidatesTags: ["Pizza"],
        }),
        deletePizza: build.mutation<Pizza, string>({
            query: (id) => ({ url: `/admin/pizzas/${id}`, method: "DELETE" }),
            invalidatesTags: ["Pizza"],
        }),
        saveProduct: build.mutation<Product, SaveArgs>({
            query: ({ id, form }) => ({
                url: id ? `/admin/products/${id}` : "/admin/products",
                method: id ? "PUT" : "POST",
                body: form,
            }),
            invalidatesTags: ["Product"],
        }),
        deleteProduct: build.mutation<Product, string>({
            query: (id) => ({ url: `/admin/products/${id}`, method: "DELETE" }),
            invalidatesTags: ["Product"],
        }),

        /* ---------- admin: reports ---------- */
        getReport: build.query<Report, { from?: string; to?: string } | void>({
            query: (range) => {
                const params = new URLSearchParams();
                if (range?.from) params.set("from", range.from);
                if (range?.to) params.set("to", range.to);
                const qs = params.toString();
                return `/admin/reports${qs ? `?${qs}` : ""}`;
            },
            providesTags: ["Order"],
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useGetIngredientsQuery,
    useGetPizzasQuery,
    useGetProductsQuery,
    useGetMyOrdersQuery,
    usePlaceOrderMutation,
    useGetEmployeeOrdersQuery,
    useStartOrderMutation,
    useCompleteOrderMutation,
    useGetUsersQuery,
    useGetUserQuery,
    useSetUserRoleMutation,
    useDeleteUserMutation,
    useSaveIngredientMutation,
    useDeleteIngredientMutation,
    useSavePizzaMutation,
    useDeletePizzaMutation,
    useSaveProductMutation,
    useDeleteProductMutation,
    useGetReportQuery,
} = api;

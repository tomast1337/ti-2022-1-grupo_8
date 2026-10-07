import { BrowserRouter, Route, Routes } from "react-router";
import { HomeRedirect, RequireRole } from "./components/common/RequireRole";
import { NotFound } from "./components/common/NotFound";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { AdminHomePage } from "./pages/admin/AdminHomePage";
import { ManageIngredientsPage } from "./pages/admin/ManageIngredientsPage";
import { ManagePizzasPage } from "./pages/admin/ManagePizzasPage";
import { ManageProductsPage } from "./pages/admin/ManageProductsPage";
import { ManageUsersPage } from "./pages/admin/ManageUsersPage";
import { BuildPizzaPage } from "./pages/customer/BuildPizzaPage";
import { CartPage } from "./pages/customer/CartPage";
import { MenuPage } from "./pages/customer/MenuPage";
import { MyOrdersPage } from "./pages/customer/MyOrdersPage";
import { OrdersPage } from "./pages/employee/OrdersPage";

const App = () => (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route element={<RequireRole role="customer" />}>
                <Route path="/customer/menu" element={<MenuPage />} />
                <Route
                    path="/customer/build-pizza"
                    element={<BuildPizzaPage />}
                />
                <Route path="/customer/cart" element={<CartPage />} />
                <Route path="/customer/orders" element={<MyOrdersPage />} />
            </Route>

            <Route element={<RequireRole role="employee" />}>
                <Route path="/employee/orders" element={<OrdersPage />} />
            </Route>

            <Route element={<RequireRole role="admin" />}>
                <Route path="/admin" element={<AdminHomePage />} />
                <Route
                    path="/admin/ingredients"
                    element={<ManageIngredientsPage />}
                />
                <Route path="/admin/pizzas" element={<ManagePizzasPage />} />
                <Route
                    path="/admin/products"
                    element={<ManageProductsPage />}
                />
                <Route path="/admin/users" element={<ManageUsersPage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
        </Routes>
    </BrowserRouter>
);

export default App;

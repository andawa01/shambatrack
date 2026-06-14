import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/auth/Login";

import ProtectedRoute from "./routes/ProtectedRoute";

import AdminLayout from "./components/layout/AdminLayout";
import SystemAdminLayout from "./components/layout/SystemAdminLayout";

import Dashboard from "./pages/admin/Dashboard";
import Farmer from "./pages/admin/Farmer";
import Products from "./pages/admin/Products";
import Deliveries from "./pages/admin/Deliveries";
import Loans from "./pages/admin/Loans";
import Wallets from "./pages/admin/Wallets";
import Notifications from "./pages/admin/Notifications";
import AuditLogsCoop from "./pages/admin/AuditLogsCoop";

import FarmerDashboard from "./pages/farmer/Dashboard";
import FarmerLayout from "./components/farmer/FarmerLayout";
import FarmerDeliveries from "./pages/farmer/FarmerDeliveries";
import FarmerPayments from "./pages/farmer/FarmerPayments";
import FarmerWallet from "./pages/farmer/FarmerWallet";
import FarmerLoans from "./pages/farmer/FarmerLoans";
import FarmerNotifications from "./pages/farmer/FarmerNotifications";
import FarmerProfile from "./pages/farmer/FarmerProfile";
import FarmerAuditLogs from "./pages/farmer/FarmerAuditLogs";

import SystemDashboard from "./pages/systemAdmin/Dashboard";
import Cooperatives from "./pages/systemAdmin/Cooperatives";
import CoopAdmins from "./pages/systemAdmin/CoopAdmins";
import AuditLogs from "./pages/systemAdmin/AuditLogs";

import { Toaster } from "react-hot-toast";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Login />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          {/* Cooperative Admin Layout */}
          <Route element={<AdminLayout />}>
            <Route
              path="/cooperative-admin/dashboard"
              element={<Dashboard />}
            />
            <Route path="/cooperative-admin/farmers" element={<Farmer />} />
            <Route path="/cooperative-admin/products" element={<Products />} />
            <Route
              path="/cooperative-admin/deliveries"
              element={<Deliveries />}
            />
            <Route path="/cooperative-admin/loans" element={<Loans />} />

            <Route path="/cooperative-admin/wallets" element={<Wallets />} />

            <Route
              path="/cooperative-admin/notifications"
              element={<Notifications />}
            />

            <Route
              path="/cooperative-admin/audit-logs"
              element={<AuditLogsCoop />}
            />
          </Route>
        </Route>

        {/* Farmer Pages */}
        <Route element={<ProtectedRoute allowedRoles={["farmer"]} />}>
          <Route element={<FarmerLayout />}>
            <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
            <Route path="/farmer/deliveries" element={<FarmerDeliveries />} />
            <Route path="/farmer/payments" element={<FarmerPayments />} />
            <Route path="/farmer/wallet" element={<FarmerWallet />} />
            <Route path="/farmer/loans" element={<FarmerLoans />} />
            <Route
              path="/farmer/notifications"
              element={<FarmerNotifications />}
            />
            <Route path="/farmer/profile" element={<FarmerProfile />} />
            <Route path="/farmer/auditLogs" element={<FarmerAuditLogs />} />
          </Route>
        </Route>

        {/* system admin pages */}
        <Route element={<ProtectedRoute allowedRoles={["system_admin"]} />}>
          <Route element={<SystemAdminLayout />}>
            <Route
              path="/system-admin/dashboard"
              element={<SystemDashboard />}
            />
            <Route
              path="/system-admin/cooperatives"
              element={<Cooperatives />}
            />
            <Route path="/system-admin/coop-admins" element={<CoopAdmins />} />

            <Route path="/system-admin/audit-logs" element={<AuditLogs />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

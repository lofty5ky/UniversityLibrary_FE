import { Routes, Route, Navigate } from "react-router-dom";
import SigninPage from "../pages/SigninPage";
import DashboardLayout from "../components/DashboardLayout";

// Client Pages
import ClientDashboard from "../pages/client/ClientDashboard";
import ReservationHistory from "../pages/client/ReservationHistory";
import BorrowHistory from "../pages/client/BorrowHistory";
import Feedback from "../pages/client/Feedback";
import ViolationHistory from "../pages/client/ViolationHistory";

// Admin Pages
import Statistics from "../pages/admin/Statistics";
import MemberList from "../pages/admin/MemberList";
import BorrowManagement from "../pages/admin/BorrowManagement";
import CardManagement from "../pages/admin/CardManagement";
import ViolationManagement from "../pages/admin/ViolationManagement";
import UserFeedback from "../pages/admin/UserFeedback";
import BookManagement from "../pages/admin/BookManagement";
import CategoryList from "../pages/admin/CategoryList";
import AuthorList from "../pages/admin/AuthorList";
import PublisherList from "../pages/admin/PublisherList";
import ForbiddenPage from "../pages/ForbiddenPage";
import ProtectedRoute from "../components/ProtectedRoute";
import Notifications from "../pages/admin/Notifications";
import BookDetailPage from "../pages/client/BookDetailPage";
import ReservationRequest from "../pages/admin/ReservationRequest";

const AppRouter = () => {
  const token = localStorage.getItem("token");
  let defaultRoute = "/login";

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      defaultRoute = payload.roles.includes("admin")
        ? "/admin/book-management"
        : "/client/home";
    } catch (error) {
      console.error("Token không hợp lệ:", error);
      localStorage.removeItem("token");
    }
  }

  return (
    <Routes>
      {/* Route mặc định, điều hướng đến trang tương ứng */}
      <Route path="/" element={<Navigate to={defaultRoute} replace />} />

      {/* Route mặc định cho các đường dẫn không hợp lệ */}
      <Route path="*" element={<div>404 - Page Not Found</div>} />

      {/* Không có quyền */}
      <Route path="/403" element={<ForbiddenPage />} />

      {/* Đăng nhập */}
      <Route path="/login" element={<SigninPage />} />

      {/* Client Routes */}
      <Route
        path="/client/home"
        element={
          <ProtectedRoute allowedRoles={["user", "admin"]}>
            <DashboardLayout userType="client">
              <ClientDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/book/:id"
        element={
          <ProtectedRoute allowedRoles={["user", "admin"]}>
            <DashboardLayout userType="client">
              <BookDetailPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/reservation"
        element={
          <ProtectedRoute allowedRoles={["user", "admin"]}>
            <DashboardLayout userType="client">
              <ReservationHistory />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/borrow"
        element={
          <ProtectedRoute allowedRoles={["user", "admin"]}>
            <DashboardLayout userType="client">
              <BorrowHistory />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/feedback"
        element={
          <ProtectedRoute allowedRoles={["user", "admin"]}>
            <DashboardLayout userType="client">
              <Feedback />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/violation-history"
        element={
          <ProtectedRoute allowedRoles={["user", "admin"]}>
            <DashboardLayout userType="client">
              <ViolationHistory />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/statistics"
        element={
          <DashboardLayout userType="admin">
            <Statistics />
          </DashboardLayout>
        }
      />
      <Route
        path="/admin/member-list"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DashboardLayout userType="admin">
              <MemberList />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/borrow-management"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DashboardLayout userType="admin">
              <BorrowManagement />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reservations"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DashboardLayout userType="admin">
              <ReservationRequest />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/card-management"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DashboardLayout userType="admin">
              <CardManagement />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/violation-management"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DashboardLayout userType="admin">
              <ViolationManagement />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/user-feedback"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DashboardLayout userType="admin">
              <UserFeedback />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/book-management"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DashboardLayout userType="admin">
              <BookManagement />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/category-list"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DashboardLayout userType="admin">
              <CategoryList />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/author-list"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DashboardLayout userType="admin">
              <AuthorList />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/publisher-list"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DashboardLayout userType="admin">
              <PublisherList />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/notifications"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DashboardLayout userType="admin">
              <Notifications />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRouter;

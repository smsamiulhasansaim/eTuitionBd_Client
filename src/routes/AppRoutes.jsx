import React, { Suspense, lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

// --- Route Protection ---
import PrivateRoute from "./PrivateRoute";

// --- Layouts ---
import MainLayout from "../layouts/MainLayout";
import StudentDashboardLayout from "../layouts/StudentDashboardLayout";
import TutorDashboardLayout from "../layouts/TutorDashboardLayout";
import AdminDashboardLayout from "../layouts/AdminDashboardLayout"; 

// --- Common Components ---
import Loading from "../components/common/Loading";
import NotFound from "../pages/common/NotFound";

// --- Lazy Loading Pages (Performance Optimization) ---
// Public Pages
const Home = lazy(() => import("../pages/dashboard/Student/Home"));
const Contact = lazy(() => import("../pages/dashboard/Student/Contact"));
const About = lazy(() => import("../pages/dashboard/Student/About"));
const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
const ViewProfile = lazy(() => import("../pages/dashboard/Student/ViewProfile"));
const TuitionDetails = lazy(() => import("../components/partialsPages/TuitionDetails"));

// Restricted General Pages
const AllTuitions = lazy(() => import("../pages/dashboard/Student/AllTuitions"));
const AllTutors = lazy(() => import("../pages/dashboard/Student/AllTutors"));

// Student Dashboard Pages
const StudentDashboardHome = lazy(() => import("../pages/dashboard/Student/DashboardHome"));
const MyTuitions = lazy(() => import("../pages/dashboard/Student/MyTuitions"));
const PostTuition = lazy(() => import("../pages/dashboard/Student/PostTuition"));
const AppliedTutors = lazy(() => import("../pages/dashboard/Student/AppliedTutors"));
const StudentOngoingTuitions = lazy(() => import("../pages/dashboard/Student/OngoingTuitions"));
const StudentSettings = lazy(() => import("../pages/dashboard/Student/Settings"));
const PaymentHistory = lazy(() => import("../pages/dashboard/Student/PaymentHistory"));

// Tutor Dashboard Pages
const TutorDashboardHome = lazy(() => import("../pages/dashboard/Tutor/DashboardHome"));
const MyApplications = lazy(() => import("../pages/dashboard/Tutor/MyApplications"));
const TutorOngoingTuitions = lazy(() => import("../pages/dashboard/Tutor/OngoingTuitions"));
const RevenueHistory = lazy(() => import("../pages/dashboard/Tutor/RevenueHistory"));
const BrowseTuitions = lazy(() => import("../pages/dashboard/Tutor/BrowseTuitions"));
const TutorProfile = lazy(() => import("../pages/dashboard/Tutor/Profile"));
const TutorReviews = lazy(() => import("../pages/dashboard/Tutor/Reviews"));

// Admin Dashboard Pages
const AdminDashboardHome = lazy(() => import("../pages/dashboard/Admin/DashboardHome"));
const UserManagement = lazy(() => import("../pages/dashboard/Admin/UserManagement"));
const TuitionManagement = lazy(() => import("../pages/dashboard/Admin/TuitionManagement"));
const ApplicationManagement = lazy(() => import("../pages/dashboard/Admin/ApplicationManagement"));
const Reports = lazy(() => import("../pages/dashboard/Admin/ReportsAnalytics"));
const AdminSettings = lazy(() => import("../pages/dashboard/Admin/PlatformSettings"));
const AdminProfile = lazy(() => import("../pages/dashboard/Admin/AdminProfile"));
const Transactions = lazy(() => import("../pages/dashboard/Admin/Transactions"));

// --- Helper for Lazy Loaded Components ---
const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<Loading />}>
    {children}
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <NotFound />,
    children: [
        // === PUBLIC ROUTES ===
        { path: "/", element: <SuspenseWrapper><Home /></SuspenseWrapper> },
        { path: "/login", element: <SuspenseWrapper><Login /></SuspenseWrapper> },
        { path: "/register", element: <SuspenseWrapper><Register /></SuspenseWrapper> },
        { path: "/contact", element: <SuspenseWrapper><Contact /></SuspenseWrapper> },
        { path: "/about", element: <SuspenseWrapper><About /></SuspenseWrapper> },
        
        // Detail Pages
        { path: "/tuition-details/:slug", element: <SuspenseWrapper><TuitionDetails /></SuspenseWrapper> }, 
        { path: "/profile/:slug", element: <SuspenseWrapper><ViewProfile /></SuspenseWrapper> },
        
        // === PRIVATE ROUTES (Login Required) ===
        {
            element: <PrivateRoute />, 
            children: [
                { path: "/all-tuitions", element: <SuspenseWrapper><AllTuitions /></SuspenseWrapper> },
                { path: "/all-tutors", element: <SuspenseWrapper><AllTutors /></SuspenseWrapper> },
            ]
        }
    ]
  },

  // === STUDENT DASHBOARD ===
  {
    path: "/student-dashboard",
    element: (
        <PrivateRoute allowedRoles={['student']}>
            <StudentDashboardLayout />
        </PrivateRoute>
    ),
    errorElement: <NotFound />,
    children: [
        { path: "", element: <SuspenseWrapper><StudentDashboardHome /></SuspenseWrapper> },
        { path: "my-tuitions", element: <SuspenseWrapper><MyTuitions /></SuspenseWrapper> },
        { path: "post-tuition", element: <SuspenseWrapper><PostTuition /></SuspenseWrapper> },
        { path: "applied-tutors", element: <SuspenseWrapper><AppliedTutors /></SuspenseWrapper> },
        { path: "ongoing-tuitions", element: <SuspenseWrapper><StudentOngoingTuitions /></SuspenseWrapper> },
        { path: "payment-history", element: <SuspenseWrapper><PaymentHistory /></SuspenseWrapper> },
        { path: "settings", element: <SuspenseWrapper><StudentSettings /></SuspenseWrapper> }
    ]
  },

  // === TUTOR DASHBOARD ===
  {
    path: "/tutor-dashboard",
    element: (
        <PrivateRoute allowedRoles={['tutor']}>
            <TutorDashboardLayout />
        </PrivateRoute>
    ),
    errorElement: <NotFound />,
    children: [
        { path: "", element: <SuspenseWrapper><TutorDashboardHome /></SuspenseWrapper> },
        { path: "my-applications", element: <SuspenseWrapper><MyApplications /></SuspenseWrapper> },
        { path: "ongoing-tuitions", element: <SuspenseWrapper><TutorOngoingTuitions /></SuspenseWrapper> },
        { path: "revenue", element: <SuspenseWrapper><RevenueHistory /></SuspenseWrapper> },
        { path: "browse-tuitions", element: <SuspenseWrapper><BrowseTuitions /></SuspenseWrapper> },
        { path: "profile", element: <SuspenseWrapper><TutorProfile /></SuspenseWrapper> },
        { path: "reviews", element: <SuspenseWrapper><TutorReviews /></SuspenseWrapper> }
    ]
  },

  // === ADMIN DASHBOARD ===
  {
    path: "/admin", 
    element: (
        <PrivateRoute allowedRoles={['admin']}>
            <AdminDashboardLayout />
        </PrivateRoute>
    ),
    errorElement: <NotFound />,
    children: [
        { path: "", element: <Navigate to="dashboard" replace /> },
        { path: "dashboard", element: <SuspenseWrapper><AdminDashboardHome /></SuspenseWrapper> },
        { path: "users", element: <SuspenseWrapper><UserManagement /></SuspenseWrapper> },
        { path: "users/:type", element: <SuspenseWrapper><UserManagement /></SuspenseWrapper> },
        { path: "tuitions", element: <SuspenseWrapper><TuitionManagement /></SuspenseWrapper> },
        { path: "applications", element: <SuspenseWrapper><ApplicationManagement /></SuspenseWrapper> },
        { path: "reports", element: <SuspenseWrapper><Reports /></SuspenseWrapper> },
        { path: "reports/:type", element: <SuspenseWrapper><Reports /></SuspenseWrapper> },
        { path: "transactions", element: <SuspenseWrapper><Transactions /></SuspenseWrapper> },
        { path: "settings", element: <SuspenseWrapper><AdminSettings /></SuspenseWrapper> },
        { path: "profile", element: <SuspenseWrapper><AdminProfile /></SuspenseWrapper> }
    ]
  }
]);
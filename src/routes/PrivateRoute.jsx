import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import Unauthorized from '../pages/common/Unauthorized'; 
/**
 * PrivateRoute Component
 * Handles authentication and role-based authorization protection.
 */
const PrivateRoute = ({ children, allowedRoles }) => {
    const location = useLocation();
    
    // Retrieve user data safely
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    // 1. Check Authentication: If no user, redirect to login
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 2. Check Authorization: If role doesn't match, show Unauthorized page
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Unauthorized />;
    }

    // 3. Access Granted: Render children or Outlet
    return children ? children : <Outlet />;
};

export default PrivateRoute;
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import Unauthorized from '../pages/common/Unauthorized'; 
import Loading from '../components/common/Loading';

/**
 * PrivateRoute Component
 * Handles authentication and role-based authorization protection.
 */
const PrivateRoute = ({ children, allowedRoles }) => {
    const location = useLocation();
    const [isChecking, setIsChecking] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const checkAuth = () => {
            let parsedUser = null;
            let authenticated = false;
            
            try {
                const userStr = localStorage.getItem('user');
                const token = localStorage.getItem('token');
                
                if (userStr && token) {
                    parsedUser = JSON.parse(userStr);
                    authenticated = true;
                }
            } catch (error) {
                console.error('Authentication error:', error);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            } finally {
                setUser(parsedUser);
                setIsAuthenticated(authenticated);
                setIsChecking(false);
            }
        };

        checkAuth();
    }, []);

    // Show loading while checking auth
    if (isChecking) {
        return <Loading />;
    }

    // 1. Check Authentication: Redirect to login if not authenticated
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 2. Check Authorization: Show Unauthorized page if role doesn't match
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Unauthorized />;
    }

    // 3. Access Granted: Render children or Outlet
    return children ? children : <Outlet context={{ user }} />;
};

export default PrivateRoute;
import { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute({children}) {
    const [user, setUser] = useState(false);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/me', {
                    method: "GET",
                    credentials: "include"
                });

                if (!res.ok) {
                    throw new Error("Not authenticated")
                }

                setUser(true);
                
            } catch (err) {
                setUser(null);
            } 
            finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    if (loading) {
        return <div>Loading...</div>
    };

    if (!user) {
        return <Navigate to='/' />
    }

    return children;
}

export default ProtectedRoute;
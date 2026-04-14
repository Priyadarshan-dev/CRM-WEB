import React from 'react';
import { useAuth } from './AuthContext';
import { Navigate } from 'react-router-dom';

export const RoleGate = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center">Loading permissions...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex flex-col h-screen items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="text-slate-600 mt-2">You do not have permission to view this page.</p>
        <button 
          onClick={() => window.history.back()}
          className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  return children;
};

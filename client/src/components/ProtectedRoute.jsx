import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'

function ProtectedRoute() {
  const { userData } = useSelector((state) => state.user)

  // userData is null until App.jsx resolves the /current-user call.
  // null  → not authenticated → redirect to /auth
  // truthy → authenticated    → render the child route
  if (!userData) {
    return <Navigate to="/auth" replace />
  }

  return <Outlet />
}

export default ProtectedRoute

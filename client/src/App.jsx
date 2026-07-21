import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import AppShell from './components/Layout/AppShell'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ClientList from './pages/ClientList'
import ClientProfile from './pages/ClientProfile'
import AddClient from './pages/AddClient'
import EditClient from './pages/EditClient'
import Search from './pages/Search'
import Users from './pages/Users'
import AuditLog from './pages/AuditLog'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="clients" element={<ClientList />} />
        <Route path="clients/new" element={<AddClient />} />
        <Route path="clients/:id" element={<ClientProfile />} />
        <Route path="clients/:id/edit" element={<EditClient />} />
        <Route path="search" element={<Search />} />
        <Route path="users" element={<ProtectedRoute adminOnly><Users /></ProtectedRoute>} />
        <Route path="audit" element={<ProtectedRoute adminOnly><AuditLog /></ProtectedRoute>} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#112236',
              color: 'var(--text-main)',
              border: '1px solid rgba(30, 111, 217, 0.2)',
              borderRadius: '10px',
              fontSize: '0.875rem',
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

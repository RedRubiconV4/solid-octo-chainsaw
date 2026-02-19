import { Routes, Route } from 'react-router-dom'
import './App.css'
import Login from './components/login'
import SignUp from './components/signup'
import Dashboard from './components/dashboard'
import ProtectedRoute from './components/ProtectedRoute'

function App() {

  return (
    <Routes>
      <Route path='/' element={<Login />}/>
      <Route path='/signup' element={<SignUp />}/>
      <Route path='/dashboard' element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default App

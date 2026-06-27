import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Header from './Header'
import Login from './Login'
import Signup from './Signup'
import Resetpassword from './Resetpassword'
import Forgetpassword from './Forgetpassword'
import InactiveTask from './InactiveTask'
import Home from './Home'
import ProtectedRoute from './ProtectedRoute'
import AddTask from './AddTask'
import "./App.css"


function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path='/tasks' element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path='/inactive' element={
          <ProtectedRoute>
            <InactiveTask/>
          </ProtectedRoute>
        } />
        <Route path='/reset' element={
          <ProtectedRoute>
            <Resetpassword />
          </ProtectedRoute>
        } />

        <Route path='/signup' element={<Signup />} />
        <Route path='/login' element={<Login />} />
        <Route path='/forget' element={<Forgetpassword />} />
        <Route path='/addtask' element={<AddTask />} />
        
      </Routes>
    </BrowserRouter>
  )
}

export default App
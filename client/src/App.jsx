import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Auth from './pages/Auth'
import { useEffect } from 'react'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { setUserData } from './redux/userSlice'
import InterviewPage from './pages/InterviewPage'
import InterviewHistory from './pages/InterviewHistory'
import Pricing from './pages/Pricing'
import InterviewReport from './pages/InterviewReport'
import ProtectedRoute from './components/ProtectedRoute'

export const ServerUrl  = "http://localhost:8000"

function App() {

  const dispatch = useDispatch()
  useEffect(()=>{
    const getUser = async () => {
      try {
        const result = await axios.get(ServerUrl + "/api/user/current-user", {withCredentials:true})
        dispatch(setUserData(result.data))
      } catch (error) {
        console.log(error)
        dispatch(setUserData(null))
      }
    }
    getUser()

  },[dispatch])
  return (
    <Routes>
      {/* Public routes */}
      <Route path='/' element={<Home/>}/>
      <Route path='/auth' element={<Auth/>}/>

      {/* Protected routes — redirect to /auth if not logged in */}
      <Route element={<ProtectedRoute/>}>
        <Route path='/interview' element={<InterviewPage/>}/>
        <Route path='/history' element={<InterviewHistory/>}/>
        <Route path='/pricing' element={<Pricing/>}/>
        <Route path='/report/:id' element={<InterviewReport/>}/>
      </Route>
    </Routes>
  )
}

export default App

import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Auth from './pages/auth'
import { useEffect } from 'react'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { setUserData } from './redux/userSlice'
import InterviewPage from './pages/InterviewPage'
import InterviewHistory from './pages/InterviewHistory'
import Pricing from './pages/Pricing'
import InterviewReport from './pages/InterviewReport'
import ScheduleInterview from './pages/ScheduleInterview'
import QuestionBank from './pages/QuestionBank'
import Analytics from './pages/Analytics'
import ResumeOptimizer from './pages/ResumeOptimizer'
import InterviewBattle from './pages/InterviewBattle'
import Certifications from './pages/Certifications'
import VerifyCredential from './pages/VerifyCredential'
import CandidateMatchingLeaderboard from './pages/CandidateMatchingLeaderboard'

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
      <Route path='/' element={<Home/>}/>
      <Route path='/auth' element={<Auth/>}/>
      <Route path='/interview' element={<InterviewPage/>}/>
      <Route path='/history' element={<InterviewHistory/>}/>
      <Route path='/pricing' element={<Pricing/>}/>
      <Route path='/report/:id' element={<InterviewReport/>}/>
      <Route path='/schedule' element={<ScheduleInterview/>}/>
      <Route path='/question-bank' element={<QuestionBank/>}/>
      <Route path='/analytics' element={<Analytics/>}/>
      <Route path='/resume-optimizer' element={<ResumeOptimizer/>}/>
      <Route path='/battle' element={<InterviewBattle/>}/>
      <Route path='/certifications' element={<Certifications/>}/>
      <Route path='/verify-credential/:credentialId' element={<VerifyCredential/>}/>
      <Route path='/candidate-matching' element={<CandidateMatchingLeaderboard/>}/>
    </Routes>
  )
}

export default App

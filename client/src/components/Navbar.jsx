import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from "motion/react"
import { BsRobot, BsCoin, BsSun, BsMoonStars } from "react-icons/bs";
import { HiOutlineLogout } from "react-icons/hi";
import { FaUserAstronaut } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ServerUrl } from '../App';
import { setUserData } from '../redux/userSlice';
import AuthModel from './AuthModel';
import { useTheme } from '../context/ThemeContext';

function Navbar() {
    const { userData } = useSelector((state) => state.user)
    const { theme, toggleTheme } = useTheme()
    const [showCreditPopup, setShowCreditPopup] = useState(false)
    const [showUserPopup, setShowUserPopup] = useState(false)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [showAuth, setShowAuth] = useState(false);

    const handleLogout = async () => {
        try {
            await axios.get(ServerUrl + "/api/auth/logout", { withCredentials: true })
            dispatch(setUserData(null))
            setShowCreditPopup(false)
            setShowUserPopup(false)
            navigate("/")

        } catch (error) {
            console.log(error)
        }
    }

  return (
    <div className='bg-[#f3f3f3] dark:bg-[#0b0f19] transition-colors duration-300 flex justify-center px-4 pt-6'>
        <motion.div 
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className='w-full max-w-6xl bg-white dark:bg-slate-900 rounded-[24px] shadow-sm border border-gray-200 dark:border-slate-800 px-8 py-4 flex justify-between items-center relative transition-colors duration-300'>
            <div onClick={() => navigate("/")} className='flex items-center gap-3 cursor-pointer'>
                <div className='bg-black dark:bg-emerald-600 text-white p-2 rounded-lg transition-colors'>
                    <BsRobot size={18}/>
                </div>
                <h1 className='font-semibold hidden md:block text-lg text-gray-800 dark:text-white'>InterviewIQ.AI</h1>
            </div>

            <div className='flex items-center gap-4 sm:gap-6 relative'>
                {/* Night Mode / Light Mode Sun & Moon Toggle */}
                <motion.button
                    whileTap={{ scale: 0.85, rotate: 180 }}
                    onClick={toggleTheme}
                    title={`Switch to ${theme === 'dark' ? 'Light' : 'Night'} Mode`}
                    className='w-9 h-9 rounded-full bg-gray-100 dark:bg-slate-800 text-amber-500 dark:text-amber-300 flex items-center justify-center border border-gray-200 dark:border-slate-700 hover:bg-gray-200 dark:hover:bg-slate-700 transition cursor-pointer'
                >
                    {theme === 'dark' ? <BsSun size={18} /> : <BsMoonStars size={16} />}
                </motion.button>

                <div className='relative'>
                    <button onClick={() => {
                        if (!userData) {
                            setShowAuth(true)
                            return;
                        }
                        setShowCreditPopup(!showCreditPopup);
                        setShowUserPopup(false)
                    }} className='flex items-center gap-2 bg-gray-100 dark:bg-slate-800 dark:text-gray-200 px-4 py-2 rounded-full text-md hover:bg-gray-200 dark:hover:bg-slate-700 transition'>
                        <BsCoin size={20} className="text-amber-500"/>
                        {userData?.credits || 0}
                    </button>

                    {showCreditPopup && (
                        <div className='absolute right-[-50px] mt-3 w-64 bg-white dark:bg-slate-900 shadow-xl border border-gray-200 dark:border-slate-800 rounded-xl p-5 z-50 text-gray-800 dark:text-white'>
                            <p className='text-sm text-gray-600 dark:text-gray-300 mb-4'>Need more credits to continue interviews?</p>
                            <button onClick={() => navigate("/pricing")} className='w-full bg-black dark:bg-emerald-600 text-white py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition'>Buy more credits</button>
                        </div>
                    )}
                </div>

                <div className='relative'>
                    <button
                    onClick={() => {
                         if (!userData) {
                            setShowAuth(true)
                            return;
                        }
                        setShowUserPopup(!showUserPopup);
                        setShowCreditPopup(false)
                    }} className='w-9 h-9 bg-black dark:bg-emerald-600 text-white rounded-full flex items-center justify-center font-semibold cursor-pointer shadow-sm'>
                        {userData ? userData?.name.slice(0,1).toUpperCase() : <FaUserAstronaut size={16}/>}
                    </button>

                    {showUserPopup && (
                        <div className='absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 shadow-xl border border-gray-200 dark:border-slate-800 rounded-xl p-4 z-50 text-gray-800 dark:text-gray-100'>
                            <p className='text-md text-blue-500 dark:text-emerald-400 font-bold mb-2'>{userData?.name}</p>

                            <button onClick={() => { navigate("/resume-optimizer"); setShowUserPopup(false); }} className='w-full text-left text-sm py-1.5 hover:text-black dark:hover:text-white text-gray-600 dark:text-gray-300 flex items-center justify-between font-medium cursor-pointer'>
                              Resume Optimizer
                              <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold">ATS AI</span>
                            </button>
                            <button onClick={() => { navigate("/analytics"); setShowUserPopup(false); }} className='w-full text-left text-sm py-1.5 hover:text-black dark:hover:text-white text-gray-600 dark:text-gray-300 flex items-center justify-between font-medium cursor-pointer'>
                              Career Insights
                              <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold">Insights</span>
                            </button>
                            <button onClick={() => { navigate("/question-bank"); setShowUserPopup(false); }} className='w-full text-left text-sm py-1.5 hover:text-black dark:hover:text-white text-gray-600 dark:text-gray-300 flex items-center justify-between font-medium cursor-pointer'>
                              Question Banks
                              <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold">50+ Roles</span>
                            </button>
                            <button onClick={() => { navigate("/battle"); setShowUserPopup(false); }} className='w-full text-left text-sm py-1.5 hover:text-black dark:hover:text-white text-gray-600 dark:text-gray-300 flex items-center justify-between font-medium cursor-pointer'>
                              1v1 Peer Battle
                              <span className="bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold">HOT ⚔️</span>
                            </button>
                            <button onClick={() => { navigate("/schedule"); setShowUserPopup(false); }} className='w-full text-left text-sm py-1.5 hover:text-black dark:hover:text-white text-gray-600 dark:text-gray-300 flex items-center justify-between font-medium cursor-pointer'>
                              Schedule Interview
                              <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold">NEW</span>
                            </button>
                            <button onClick={() => { navigate("/certifications"); setShowUserPopup(false); }} className='w-full text-left text-sm py-1.5 hover:text-black dark:hover:text-white text-gray-600 dark:text-gray-300 flex items-center justify-between font-medium cursor-pointer'>
                              Skill Badges & Certs
                              <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold">🏆 VERIFIED</span>
                            </button>
                            <button onClick={() => { navigate("/history"); setShowUserPopup(false); }} className='w-full text-left text-sm py-1.5 hover:text-black dark:hover:text-white text-gray-600 dark:text-gray-300 cursor-pointer'>Interview History</button>
                            <button onClick={handleLogout} 
                            className='w-full text-left text-sm py-2 flex items-center gap-2 text-red-500 dark:text-red-400 mt-1 border-t border-gray-100 dark:border-slate-800 pt-2 cursor-pointer'>
                                <HiOutlineLogout size={16}/>
                                Logout</button>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>

        {showAuth && <AuthModel onClose={() => setShowAuth(false)}/>}
    </div>
  )
}

export default Navbar

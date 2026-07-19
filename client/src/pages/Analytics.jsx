import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ServerUrl } from '../App'
import { FaArrowLeft, FaChartLine, FaRegLightbulb, FaBriefcase, FaGraduationCap, FaMedal } from 'react-icons/fa'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

function Analytics() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    const fetchAnalytics = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await axios.get(ServerUrl + '/api/interview/analytics', { withCredentials: true })
            setData(response.data)
        } catch (err) {
            console.error(err)
            setError(err.response?.data?.message || 'Failed to calculate performance analytics. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAnalytics()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-emerald-50">
                <div className="animate-pulse space-y-4 text-center">
                    <div className="w-12 h-12 bg-emerald-200 rounded-full mx-auto animate-bounce flex items-center justify-center text-emerald-600">
                        <FaChartLine size={24} />
                    </div>
                    <p className="text-gray-500 font-semibold">Generating performance profile...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 py-16 px-6 flex items-center justify-center">
                <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-xl border border-red-100 space-y-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600 font-bold text-xl">
                        !
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Analytics Error</h2>
                        <p className="text-red-500 mt-2 text-sm leading-relaxed">{error}</p>
                    </div>
                    <button
                        onClick={fetchAnalytics}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold transition shadow-md"
                    >
                        Retry Loading Analytics
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="text-sm text-gray-500 hover:text-emerald-600 block mx-auto font-medium"
                    >
                        Go back home
                    </button>
                </div>
            </div>
        )
    }

    if (!data || !data.hasData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 py-16 px-6 flex items-center justify-center">
                <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-xl border border-gray-100 space-y-6">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                        <FaChartLine size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">No Analytics Yet</h2>
                        <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                            Complete at least one mock interview round to unlock your cumulative progress dashboard and trend analysis.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/interview')}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold transition"
                    >
                        Start Mock Interview
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="text-sm text-gray-500 hover:text-emerald-600 block mx-auto font-medium"
                    >
                        Go back home
                    </button>
                </div>
            </div>
        )
    }

    const { stats, trend, insights } = data

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 py-10 px-4 sm:px-6 lg:px-10">
            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="flex items-start gap-4 flex-wrap">
                    <button
                        onClick={() => navigate('/history')}
                        className="p-3 rounded-full bg-white shadow hover:shadow-md transition"
                    >
                        <FaArrowLeft className="text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Performance Analytics</h1>
                        <p className="text-gray-500 mt-1 text-sm">
                            Analyze your growth and structural competency trends across all completed sessions
                        </p>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div className="text-gray-400 text-xs font-semibold flex items-center gap-1.5 uppercase">
                            <FaBriefcase className="text-emerald-600" /> Completed
                        </div>
                        <div className="mt-2">
                            <span className="text-3xl font-bold text-gray-800">{stats.totalInterviews}</span>
                            <span className="text-xs text-gray-400 block mt-1">Interviews</span>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div className="text-gray-400 text-xs font-semibold flex items-center gap-1.5 uppercase">
                            <FaMedal className="text-emerald-600" /> Overall
                        </div>
                        <div className="mt-2">
                            <span className="text-3xl font-bold text-emerald-600">{stats.avgOverallScore}</span>
                            <span className="text-xs text-gray-400 block mt-1">Average Score</span>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div className="text-gray-400 text-xs font-semibold flex items-center gap-1.5 uppercase">
                            <FaGraduationCap className="text-emerald-600" /> Technical
                        </div>
                        <div className="mt-2">
                            <span className="text-3xl font-bold text-gray-800">{stats.avgCorrectness}</span>
                            <span className="text-xs text-gray-400 block mt-1">Avg Correctness</span>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div className="text-gray-400 text-xs font-semibold flex items-center gap-1.5 uppercase">
                            <FaChartLine className="text-emerald-600" /> Confidence
                        </div>
                        <div className="mt-2">
                            <span className="text-3xl font-bold text-gray-800">{stats.avgConfidence}</span>
                            <span className="text-xs text-gray-400 block mt-1">Avg Confidence</span>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between col-span-2 md:col-span-1">
                        <div className="text-gray-400 text-xs font-semibold flex items-center gap-1.5 uppercase">
                            <FaChartLine className="text-emerald-600" /> Delivery
                        </div>
                        <div className="mt-2">
                            <span className="text-3xl font-bold text-gray-800">{stats.avgCommunication}</span>
                            <span className="text-xs text-gray-400 block mt-1">Avg Comm.</span>
                        </div>
                    </div>
                </div>

                {/* Graph and Insights Container */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Recharts progress timeline */}
                    <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-6">Growth Trajectory Timeline</h3>
                        <div className="h-80 sm:h-96">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} />
                                    <YAxis domain={[0, 10]} stroke="#9ca3af" fontSize={12} tickLine={false} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }} />
                                    <Legend verticalAlign="top" height={36} iconType="circle" />
                                    <Line type="monotone" name="Overall" dataKey="score" stroke="#10b981" strokeWidth={3} activeDot={{ r: 6 }} />
                                    <Line type="monotone" name="Correctness" dataKey="correctness" stroke="#3b82f6" strokeWidth={2} />
                                    <Line type="monotone" name="Confidence" dataKey="confidence" stroke="#f59e0b" strokeWidth={2} />
                                    <Line type="monotone" name="Communication" dataKey="communication" stroke="#8b5cf6" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Backend dynamic smart insights card */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-gray-100 flex flex-col">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FaRegLightbulb className="text-emerald-600" /> AI Insights Profile
                        </h3>
                        <p className="text-gray-500 text-sm leading-relaxed mb-6">
                            Dynamic summary comparison based on your latest session vs your historical baseline.
                        </p>
                        
                        <div className="space-y-4 flex-1 overflow-y-auto max-h-[300px] pr-2">
                            {insights.map((insight, idx) => (
                                <div key={idx} className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4 flex gap-3">
                                    <span className="text-emerald-600 mt-0.5 text-sm">✦</span>
                                    <p className="text-gray-700 text-sm leading-relaxed">{insight}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <button
                                onClick={() => navigate('/interview')}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold transition"
                            >
                                Start New Practice Round
                            </button>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    )
}

export default Analytics

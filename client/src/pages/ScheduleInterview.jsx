import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { ServerUrl } from "../App";
import Navbar from "../components/Navbar";
import {
  getGoogleCalendarUrl,
  getOutlookCalendarUrl,
  downloadICS,
} from "../utils/calendarUtils";
import {
  FaCalendarAlt,
  FaClock,
  FaArrowLeft,
  FaGoogle,
  FaMicrosoft,
  FaDownload,
  FaPlay,
  FaTrash,
  FaEdit,
  FaCheckCircle,
  FaBell,
  FaPlus,
  FaTimes,
  FaBriefcase,
  FaGraduationCap,
  FaLaptopCode,
} from "react-icons/fa";

function ScheduleInterview() {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);

  const [activeTab, setActiveTab] = useState("schedule");
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [role, setRole] = useState("Frontend Developer");
  const [customRole, setCustomRole] = useState("");
  const [experience, setExperience] = useState("Intermediate (1-3 yrs)");
  const [mode, setMode] = useState("Technical");
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [notes, setNotes] = useState("");

  const [rescheduleModalBooking, setRescheduleModalBooking] = useState(null);
  const [newScheduledAt, setNewScheduledAt] = useState("");

  const roleSuggestions = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Engineer",
    "React Native Developer",
    "DevOps Engineer",
    "Data Scientist",
    "HR Manager",
  ];

  const experienceOptions = [
    "Beginner (0-1 yrs)",
    "Intermediate (1-3 yrs)",
    "Senior (3-5+ yrs)",
  ];

  const modeOptions = ["Technical", "HR", "Remedial", "Audio-Only"];

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${ServerUrl}/api/booking/my-bookings`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setUpcomingBookings(response.data.upcoming || []);
        setPastBookings(response.data.past || []);
      }
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData) {
      fetchBookings();
    }
  }, [userData]);

  useEffect(() => {
    const defaultTime = new Date(Date.now() + 60 * 60 * 1000);
    const formatted = new Date(
      defaultTime.getTime() - defaultTime.getTimezoneOffset() * 60000
    )
      .toISOString()
      .slice(0, 16);
    setScheduledAt(formatted);
  }, []);

  const handleQuickPresetTime = (hoursFromNow) => {
    const preset = new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
    const formatted = new Date(
      preset.getTime() - preset.getTimezoneOffset() * 60000
    )
      .toISOString()
      .slice(0, 16);
    setScheduledAt(formatted);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const finalRole = customRole.trim() || role;
    if (!finalRole) {
      setErrorMsg("Please select or enter an interview role.");
      return;
    }

    if (!scheduledAt) {
      setErrorMsg("Please select a valid date and time.");
      return;
    }

    const selectedTime = new Date(scheduledAt);
    if (selectedTime <= new Date()) {
      setErrorMsg("Scheduled time must be in the future.");
      return;
    }

    setSubmitLoading(true);
    try {
      const response = await axios.post(
        `${ServerUrl}/api/booking/schedule`,
        {
          role: finalRole,
          experience,
          mode,
          scheduledAt: selectedTime.toISOString(),
          durationMinutes,
          notes,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setSuccessMsg(
          "Interview scheduled successfully! An email confirmation has been sent."
        );
        fetchBookings();
        setTimeout(() => {
          setActiveTab("my-bookings");
          setSuccessMsg("");
        }, 1500);
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || "Failed to schedule interview session."
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this interview booking?")) {
      return;
    }
    try {
      const response = await axios.patch(
        `${ServerUrl}/api/booking/${id}/cancel`,
        {},
        { withCredentials: true }
      );
      if (response.data.success) {
        fetchBookings();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel booking.");
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleModalBooking || !newScheduledAt) return;

    try {
      const response = await axios.patch(
        `${ServerUrl}/api/booking/${rescheduleModalBooking._id}/reschedule`,
        { scheduledAt: new Date(newScheduledAt).toISOString() },
        { withCredentials: true }
      );

      if (response.data.success) {
        setRescheduleModalBooking(null);
        setNewScheduledAt("");
        fetchBookings();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reschedule booking.");
    }
  };

  const startNow = (booking) => {
    navigate("/interview", {
      state: {
        role: booking.role,
        experience: booking.experience,
        mode: booking.mode,
      },
    });
  };

  const formatCountdown = (scheduledAtDate) => {
    const diffMs = new Date(scheduledAtDate) - new Date();
    if (diffMs <= 0) return "Starting now / In progress";

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `In ${days} day${days > 1 ? "s" : ""}`;
    }
    if (hours > 0) {
      return `In ${hours}h ${mins}m`;
    }
    return `In ${mins} minutes`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/")}
                className="p-2.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 transition shadow-xs"
                title="Go Back"
              >
                <FaArrowLeft size={14} />
              </button>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Interview Scheduling & Booking
              </h1>
            </div>
            <p className="text-gray-500 text-sm mt-1 ml-11">
              Book mock interview slots, sync calendars, and get automated email reminders.
            </p>
          </div>

          <div className="flex bg-gray-200/70 p-1 rounded-xl w-fit self-start md:self-auto">
            <button
              onClick={() => setActiveTab("schedule")}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                activeTab === "schedule"
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              <FaPlus size={12} />
              Schedule New Slot
            </button>
            <button
              onClick={() => setActiveTab("my-bookings")}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                activeTab === "my-bookings"
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              <FaCalendarAlt size={12} />
              My Bookings ({upcomingBookings.length})
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg("")} className="text-red-500 hover:text-red-700">
              <FaTimes />
            </button>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2">
            <FaCheckCircle className="text-emerald-600 size-5" />
            <span>{successMsg}</span>
          </div>
        )}

        {activeTab === "schedule" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-xs">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FaLaptopCode className="text-blue-600" />
                Session Details
              </h2>

              <form onSubmit={handleScheduleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaBriefcase className="text-gray-400" /> Target Job Role
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {roleSuggestions.map((r) => (
                      <button
                        type="button"
                        key={r}
                        onClick={() => {
                          setRole(r);
                          setCustomRole("");
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                          role === r && !customRole
                            ? "bg-black text-white border-black"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Or type a custom role (e.g. AI Engineer, Product Manager)..."
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FaGraduationCap className="text-gray-400" /> Experience Level
                    </label>
                    <select
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent text-sm bg-white"
                    >
                      {experienceOptions.map((exp) => (
                        <option key={exp} value={exp}>
                          {exp}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interview Mode
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {modeOptions.map((m) => (
                        <button
                          type="button"
                          key={m}
                          onClick={() => setMode(m)}
                          className={`py-2 px-3 rounded-xl text-xs font-semibold border transition text-center ${
                            mode === m
                              ? "bg-blue-50 border-blue-600 text-blue-700"
                              : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaCalendarAlt className="text-gray-400" /> Select Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent text-sm mb-2"
                    required
                  />

                  <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500">
                    <span>Quick Select:</span>
                    <button
                      type="button"
                      onClick={() => handleQuickPresetTime(1)}
                      className="px-2.5 py-1 bg-gray-100 rounded-md hover:bg-gray-200 transition text-gray-700"
                    >
                      +1 Hour
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickPresetTime(3)}
                      className="px-2.5 py-1 bg-gray-100 rounded-md hover:bg-gray-200 transition text-gray-700"
                    >
                      +3 Hours
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickPresetTime(24)}
                      className="px-2.5 py-1 bg-gray-100 rounded-md hover:bg-gray-200 transition text-gray-700"
                    >
                      Tomorrow Same Time
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FaClock className="text-gray-400" /> Duration
                    </label>
                    <select
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent text-sm bg-white"
                    >
                      <option value={15}>15 Minutes</option>
                      <option value={30}>30 Minutes</option>
                      <option value={45}>45 Minutes</option>
                      <option value={60}>60 Minutes</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preparation Notes (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Focus areas (e.g. System Design, DSA, Behavioral)..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitLoading}
                  className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  {submitLoading ? (
                    "Scheduling..."
                  ) : (
                    <>
                      <FaCalendarAlt /> Confirm & Schedule Interview
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                    <FaBell className="text-blue-300 text-xl" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Smart Reminders & Calendar Sync</h3>
                  <p className="text-blue-100 text-xs leading-relaxed mb-4">
                    Once scheduled, you will automatically receive an email confirmation and a reminder 30 minutes before your slot begins.
                  </p>

                  <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
                    <div className="flex items-center gap-2 text-blue-200">
                      <FaCheckCircle className="text-blue-400" />
                      <span>One-click Google & Outlook Calendar sync</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-200">
                      <FaCheckCircle className="text-blue-400" />
                      <span>Downloadable .ICS calendar invitation</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-200">
                      <FaCheckCircle className="text-blue-400" />
                      <span>Automated email reminder before start</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
                <h3 className="font-bold text-gray-800 mb-3 text-sm flex items-center justify-between">
                  <span>Upcoming Slots</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                    {upcomingBookings.length}
                  </span>
                </h3>

                {upcomingBookings.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">No interviews currently scheduled.</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingBookings.slice(0, 3).map((b) => (
                      <div
                        key={b._id}
                        className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-bold text-gray-800">{b.role}</p>
                          <p className="text-[11px] text-gray-500">
                            {new Date(b.scheduledAt).toLocaleDateString()} @{" "}
                            {new Date(b.scheduledAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-semibold">
                          {formatCountdown(b.scheduledAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "my-bookings" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaClock className="text-blue-600" /> Upcoming Mock Interviews
              </h2>

              {loading ? (
                <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center text-gray-500 text-sm">
                  Loading your scheduled sessions...
                </div>
              ) : upcomingBookings.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center">
                  <p className="text-gray-500 text-sm mb-4">You have no upcoming interview bookings.</p>
                  <button
                    onClick={() => setActiveTab("schedule")}
                    className="bg-black text-white px-4 py-2 rounded-xl text-xs font-semibold"
                  >
                    Schedule an Interview Now
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {upcomingBookings.map((b) => (
                    <div
                      key={b._id}
                      className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div>
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                              {b.mode} Mode
                            </span>
                            <h3 className="text-lg font-bold text-gray-900 mt-2">{b.role}</h3>
                            <p className="text-xs text-gray-500">{b.experience}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 inline-block">
                              {formatCountdown(b.scheduledAt)}
                            </span>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-xl text-xs text-gray-700 space-y-1 mb-4">
                          <div className="flex items-center gap-2">
                            <FaCalendarAlt className="text-gray-400" />
                            <span className="font-medium">Date & Time:</span>{" "}
                            {new Date(b.scheduledAt).toLocaleString([], {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <div className="flex items-center gap-2">
                            <FaClock className="text-gray-400" />
                            <span className="font-medium">Duration:</span> {b.durationMinutes || 30} mins
                          </div>
                          {b.notes && (
                            <p className="text-gray-600 italic pt-1 border-t border-gray-200 mt-1">
                              "{b.notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-gray-100">
                        <div className="flex flex-wrap items-center gap-2">
                          <a
                            href={getGoogleCalendarUrl(b)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium flex items-center gap-1.5 transition"
                            title="Add to Google Calendar"
                          >
                            <FaGoogle className="text-red-500" /> Google Cal
                          </a>

                          <a
                            href={getOutlookCalendarUrl(b)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium flex items-center gap-1.5 transition"
                            title="Add to Outlook Calendar"
                          >
                            <FaMicrosoft className="text-blue-500" /> Outlook
                          </a>

                          <button
                            onClick={() => downloadICS(b)}
                            className="px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                            title="Download .ICS Calendar File"
                          >
                            <FaDownload className="text-emerald-600" /> .ICS
                          </button>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => startNow(b)}
                            className="flex-1 bg-black hover:bg-gray-800 text-white text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <FaPlay size={10} /> Start Interview
                          </button>

                          <button
                            onClick={() => {
                              setRescheduleModalBooking(b);
                              setNewScheduledAt(
                                new Date(
                                  new Date(b.scheduledAt).getTime() -
                                    new Date(b.scheduledAt).getTimezoneOffset() * 60000
                                )
                                  .toISOString()
                                  .slice(0, 16)
                              );
                            }}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition cursor-pointer"
                            title="Reschedule"
                          >
                            <FaEdit size={12} />
                          </button>

                          <button
                            onClick={() => handleCancelBooking(b._id)}
                            className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition cursor-pointer"
                            title="Cancel Booking"
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {pastBookings.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-700 mb-4">Past & Cancelled Bookings</h2>
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
                  {pastBookings.map((b) => (
                    <div key={b._id} className="p-4 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-gray-800">{b.role}</span> &bull;{" "}
                        <span className="text-gray-500">{b.mode}</span>
                        <p className="text-gray-400 mt-0.5">
                          {new Date(b.scheduledAt).toLocaleString()}
                        </p>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full font-semibold capitalize ${
                          b.status === "completed"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {rescheduleModalBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-gray-900">Reschedule Interview</h3>
              <button
                onClick={() => setRescheduleModalBooking(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div>
                <p className="text-xs text-gray-600 mb-2">
                  Session: <strong>{rescheduleModalBooking.role}</strong> (
                  {rescheduleModalBooking.mode})
                </p>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  New Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={newScheduledAt}
                  onChange={(e) => setNewScheduledAt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRescheduleModalBooking(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-black text-white"
                >
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScheduleInterview;

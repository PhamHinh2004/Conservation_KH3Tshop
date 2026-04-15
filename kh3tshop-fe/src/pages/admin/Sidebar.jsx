import React, { useEffect, useRef, useState } from 'react';
import { MessageSquare, Users, User, LogOut, Menu, X, Settings, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

const API_BASE = "http://localhost:8080";

export default function Sidebar({ sidebarOpen, setSidebarOpen, activeTab, setActiveTab }) {
    const navigate = useNavigate();
    const menuRef = useRef(null);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [profileInfo, setProfileInfo] = useState(null);
    const [phoneInput, setPhoneInput] = useState("");
    const [otpInput, setOtpInput] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otpCountdown, setOtpCountdown] = useState(0);
    const [deletionLoading, setDeletionLoading] = useState(false);

    const handleRequestOtp = async () => {
        if (!phoneInput.trim()) {
            toast.error("Please enter phone number");
            return;
        }

        setDeletionLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${API_BASE}/accounts/request-delete-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ phoneNumber: phoneInput }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to send OTP');
            }

            setOtpSent(true);
            setOtpCountdown(120);
            toast.success('OTP sent to your email. Please check your inbox!');
        } catch (err) {
            toast.error(err.message || 'Failed to send OTP');
        } finally {
            setDeletionLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otpInput.trim()) {
            toast.error("Please enter OTP");
            return;
        }

        setDeletionLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${API_BASE}/accounts/verify-delete-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ otp: otpInput }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Invalid OTP');
            }

            toast.success('Account locked successfully. Logging out...');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            toast.error(err.message || 'OTP verification failed');
        } finally {
            setDeletionLoading(false);
        }
    };

    const handleOpenDeleteDialog = () => {
        setShowUserMenu(false);
        setShowDeleteDialog(true);
        setPhoneInput(profileInfo?.phoneNumber || "");
        setOtpInput("");
        setOtpSent(false);
        setOtpCountdown(0);
    };

    useEffect(() => {
        if (otpCountdown > 0) {
            const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [otpCountdown]);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const fetchProfile = async () => {
            try {
                const res = await fetch(`${API_BASE}/customers/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) return;
                const data = await res.json();
                setProfileInfo(data?.result ?? data);
            } catch (error) {
                console.error('Could not load profile for sidebar menu:', error);
            }
        };

        fetchProfile();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getAvatar = () => {
        if (profileInfo?.avatar) return profileInfo.avatar;
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(profileInfo?.fullName || 'Admin')}&background=random`;
    };

    const displayName = profileInfo?.fullName || 'Administrator';
    const displayEmail = profileInfo?.email || '';

    return (
        <div className={`${sidebarOpen ? 'w-64' : 'w-36'} bg-gray-900 text-white transition-all duration-300 flex flex-col h-screen`}>

            {/* HEADER */}
            <div className="p-4 relative" ref={menuRef}>
                <div
                    className={`flex items-center ${
                        sidebarOpen ? 'gap-3' : 'justify-center'
                    } cursor-pointer`}
                    onClick={() => setShowUserMenu((prev) => !prev)}
                >
                    <img
                        src={getAvatar()}
                        className={`${sidebarOpen ? 'w-10 h-10' : 'w-11 h-11'} rounded-full object-cover`}
                        alt="User avatar"
                    />

                    {sidebarOpen && (
                        <div>
                            <p className="text-sm font-semibold">{displayName}</p>
                            <p className="text-xs text-green-400">Online</p>
                        </div>
                    )}
                </div>

                {showUserMenu && (
                    <div className="absolute left-4 right-4 top-20 bg-white text-gray-900 rounded-2xl shadow-2xl border border-gray-200 p-4 z-50">
                        <div className="flex items-center gap-3 mb-4">
                            <img
                                src={getAvatar()}
                                alt="Avatar"
                                className="w-14 h-14 rounded-full object-cover border border-gray-200"
                            />
                            <div>
                                <p className="font-semibold text-sm text-gray-900">{displayName}</p>
                                {displayEmail && <p className="text-xs text-gray-500">{displayEmail}</p>}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <button
                                onClick={() => {
                                    setShowUserMenu(false);
                                    navigate('/admin/profile');
                                }}
                                className="w-full text-left px-4 py-3 bg-gray-100 rounded-lg text-sm text-gray-800 hover:bg-gray-200 transition"
                            >
                                Thông tin cá nhân
                            </button>
                            <button
                                onClick={handleOpenDeleteDialog}
                                className="w-full text-left px-4 py-3 bg-red-600 rounded-lg text-sm text-white hover:bg-red-700 transition flex items-center gap-2"
                            >
                                <Trash2 size={16} />
                                Xóa tài khoản
                            </button>
                        </div>
                    </div>
                )}

                {/* DELETE ACCOUNT DIALOG */}
                {showDeleteDialog && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowDeleteDialog(false)}>
                        <div className="bg-white text-gray-900 rounded-2xl shadow-2xl p-6 w-96 max-w-full" onClick={(e) => e.stopPropagation()}>
                            <h2 className="text-2xl font-bold mb-4">Delete Account</h2>
                            <p className="text-sm text-gray-600 mb-6">This action will lock your account for 30 days. You can log in again anytime to reactivate it.</p>

                            {!otpSent ? (
                                <>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium mb-2">We'll send OTP to your email</label>
                                        <input
                                            type="text"
                                            value={phoneInput}
                                            readOnly
                                            placeholder="Phone number for verification"
                                            className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed text-gray-600"
                                        />
                                    </div>
                                    <button
                                        onClick={handleRequestOtp}
                                        disabled={deletionLoading || !phoneInput.trim()}
                                        className="w-full bg-red-600 text-white p-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 transition mb-3"
                                    >
                                        {deletionLoading ? 'Sending...' : 'Send OTP to Email'}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                                        <p className="text-xs text-blue-700">
                                            📧 OTP has been sent to your registered email ({profileInfo?.email || 'your email'}). 
                                            Please check your inbox (including spam folder).
                                        </p>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium mb-2">Enter OTP (Expires in {otpCountdown}s)</label>
                                        <input
                                            type="text"
                                            value={otpInput}
                                            onChange={(e) => setOtpInput(e.target.value)}
                                            placeholder="000000"
                                            maxLength="6"
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200"
                                            disabled={deletionLoading}
                                        />
                                    </div>
                                    <button
                                        onClick={handleRequestOtp}
                                        disabled={deletionLoading || otpCountdown > 0}
                                        className="w-full bg-gray-400 text-white p-2 rounded-lg text-sm hover:bg-gray-500 disabled:opacity-50 transition mb-3"
                                    >
                                        {otpCountdown > 0 ? `Resend in ${otpCountdown}s` : 'Resend OTP'}
                                    </button>
                                    <button
                                        onClick={handleVerifyOtp}
                                        disabled={deletionLoading || !otpInput.trim()}
                                        className="w-full bg-red-600 text-white p-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 transition mb-3"
                                    >
                                        {deletionLoading ? 'Verifying...' : 'Confirm Delete'}
                                    </button>
                                </>
                            )}

                            <button
                                onClick={() => setShowDeleteDialog(false)}
                                className="w-full bg-gray-200 text-gray-800 p-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                                disabled={deletionLoading}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className={`p-2 hover:bg-gray-800 rounded absolute top-4 ${
                        sidebarOpen ? 'right-4' : 'right-2'
                    }`}
                >
                    {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* MENU */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">

                {/* CHAT */}
                <button
                    onClick={() => setActiveTab('chat')}
                    className={`w-full flex items-center ${
                        sidebarOpen ? 'gap-3 justify-start' : 'justify-center'
                    } ${sidebarOpen ? 'p-3' : 'p-4'} rounded-lg transition ${
                        activeTab === 'chat' ? 'bg-blue-600' : 'hover:bg-gray-800'
                    }`}
                >
                    <MessageSquare size={sidebarOpen ? 23 : 24} />
                    {sidebarOpen && <span>Chat</span>}
                </button>

                {/* COMMUNITY */}
                <button
                    onClick={() => setActiveTab('community')}
                    className={`w-full flex items-center ${
                        sidebarOpen ? 'gap-3 justify-start' : 'justify-center'
                    } ${sidebarOpen ? 'p-3' : 'p-4'} rounded-lg transition ${
                        activeTab === 'community' ? 'bg-blue-600' : 'hover:bg-gray-800'
                    }`}
                >
                    <Users size={sidebarOpen ? 20 : 28} />
                    {sidebarOpen && <span>Community</span>}
                </button>

                {/*/!* USERS *!/*/}
                {/*<button*/}
                {/*    onClick={() => setActiveTab('users')}*/}
                {/*    className={`w-full flex items-center ${*/}
                {/*        sidebarOpen ? 'gap-3 justify-start' : 'justify-center'*/}
                {/*    } ${sidebarOpen ? 'p-3' : 'p-4'} rounded-lg transition ${*/}
                {/*        activeTab === 'users' ? 'bg-blue-600' : 'hover:bg-gray-800'*/}
                {/*    }`}*/}
                {/*>*/}
                {/*    <User size={sidebarOpen ? 20 : 28} />*/}
                {/*    {sidebarOpen && <span>Users</span>}*/}
                {/*</button>*/}

            </nav>

            {/* SETTING */}
            <div className="p-4 border-t border-gray-800">
                <button
                    onClick={() => setActiveTab('setting')}
                    className={`w-full flex items-center ${
                        sidebarOpen ? 'gap-3 justify-start' : 'justify-center'
                    } ${sidebarOpen ? 'p-3' : 'p-4'} rounded-lg transition ${
                        activeTab === 'setting' ? 'bg-blue-600' : 'hover:bg-gray-800'
                    }`}
                >
                    <Settings size={sidebarOpen ? 20 : 28} />
                    {sidebarOpen && <span>Settings</span>}
                </button>
            </div>

            {/* LOGOUT */}
            <div className="p-4 border-t border-gray-800">
                <button
                    className={`w-full flex items-center ${
                        sidebarOpen ? 'gap-3 justify-start' : 'justify-center'
                    } ${sidebarOpen ? 'p-3' : 'p-4'} rounded-lg hover:bg-red-600 transition`}
                    onClick={() => {
                        localStorage.removeItem("accessToken");
                        navigate("/login");
                    }}
                >
                    <LogOut size={sidebarOpen ? 20 : 28} />
                    {sidebarOpen && <span>Log out</span>}
                </button>
            </div>

        </div>
    );
}
import React from 'react';
import { MessageSquare, Users, User, LogOut, Menu, X, Settings } from 'lucide-react';
import { useNavigate } from 'react-router';

export default function Sidebar({ sidebarOpen, setSidebarOpen, activeTab, setActiveTab, user }) {
    const navigate = useNavigate();

    const getAvatar = () => {
        if (user?.avatar) return user.avatar;
        return `https://ui-avatars.com/api/?name=${user?.name}&background=random`;
    };

    return (
        <div className={`${sidebarOpen ? 'w-64' : 'w-36'} bg-gray-900 text-white transition-all duration-300 flex flex-col h-screen`}>

            {/* HEADER */}
            <div className="p-4 relative">

                <div
                    className={`flex items-center ${
                        sidebarOpen ? 'gap-3' : 'justify-center'
                    } cursor-pointer`}
                    onClick={() => setActiveTab('user')}
                >
                    <img
                        src={getAvatar()}
                        className={`${sidebarOpen ? 'w-10 h-10' : 'w-11 h-11'} rounded-full object-cover`}
                    />

                    {sidebarOpen && (
                        <div>
                            <p className="text-sm font-semibold">Phạm Ngọc Thành</p>
                            <p className="text-xs text-green-400">Online</p>
                        </div>
                    )}
                </div>

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
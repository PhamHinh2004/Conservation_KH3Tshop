import React, { useState, useRef } from "react";
import {
    Search,
    Phone,
    Video,
    Send,
    Plus,
    Smile,
    X,
    MoreVertical,
    Pin,
    Copy,
    Heart,
    Reply,
    Image,
    Paperclip
} from "lucide-react";

export default function Chat() {

    const users = [

        {
            id:1,
            name:"Van Hinh Pham",
            last:"Mình 70kg thì nên chọn size nào?",
            time:"09:50 AM",
            avatar:"https://i.pravatar.cc/150?img=12",
            online:true,
            pinned:true,
            unread:2,
            info:"Male • 70kg • Regular customer",

            messages:[
                { id:1, text:"Tôi đã nhận áo rồi rất đẹp luôn shop ơi !!!", sender:"user"},
                { id:2, text:"Nhưng tôi cảm thấy áo hơi bị chật :(", sender:"user"},
                { id:3, text:"Tôi rất vui khi nhận được feedback này", sender:"admin"},
                { id:4, text:"Mình 70kg thì nên chọn size nào?", sender:"user"}
            ],

            orders:[
                { items:3, price:"690.000", date:"12/01/2026", status:"Done"},
                { items:2, price:"460.000", date:"17/02/2026", status:"Done"}
            ]
        },

        {
            id:2,
            name:"Pham Hieu",
            last:"I wanna change this jersey",
            time:"15:50 PM",
            avatar:"https://i.pravatar.cc/150?img=32",
            online:false,
            unread:3,
            info:"Male • 75kg • VIP customer",

            messages:[
                { id:1, text:"Hello shop", sender:"user"},
                { id:2, text:"Tôi muốn đổi size áo", sender:"user"},
                { id:3, text:"Bạn cần đổi size nào ạ?", sender:"admin"}
            ],

            orders:[
                { items:1, price:"350.000", date:"02/02/2026", status:"Done"},
                { items:2, price:"520.000", date:"20/02/2026", status:"Done"}
            ]
        },

        {
            id:3,
            name:"Phat La",
            last:"Thanks for your support",
            time:"09:50 AM",
            avatar:"https://i.pravatar.cc/150?img=45",
            online:true,
            unread:1,
            info:"Female • 55kg • New customer",

            messages:[
                { id:1, text:"Shop giao hàng nhanh quá", sender:"user"},
                { id:2, text:"Cảm ơn bạn đã ủng hộ shop!", sender:"admin"}
            ],

            orders:[
                { items:4, price:"1.200.000", date:"05/02/2026", status:"Done"}
            ]
        },

        {
            id:4,
            name:"Nguyen Minh",
            last:"Shop còn size L không?",
            time:"10:20 AM",
            avatar:"https://i.pravatar.cc/150?img=22",
            online:true,
            info:"Male • 68kg • Regular customer",

            messages:[
                { id:1, text:"Shop còn size L không?", sender:"user"},
                { id:2, text:"Hiện tại vẫn còn bạn nhé", sender:"admin"}
            ],

            orders:[
                { items:2, price:"540.000", date:"18/01/2026", status:"Done"}
            ]
        },

        {
            id:5,
            name:"Tran Bao",
            last:"Mình muốn đổi màu áo",
            time:"11:45 AM",
            avatar:"https://i.pravatar.cc/150?img=18",
            online:false,
            info:"Male • 72kg • Regular customer",

            messages:[
                { id:1, text:"Áo này có màu đen không?", sender:"user"},
                { id:2, text:"Có bạn nhé", sender:"admin"}
            ],

            orders:[
                { items:3, price:"720.000", date:"10/02/2026", status:"Done"}
            ]
        },

        {
            id:6,
            name:"Le Quang",
            last:"Ship về Hà Nội mất bao lâu?",
            time:"01:30 PM",
            avatar:"https://i.pravatar.cc/150?img=30",
            online:true,
            unread:2,
            info:"Male • 80kg • VIP customer",

            messages:[
                { id:1, text:"Ship về Hà Nội mất bao lâu?", sender:"user"},
                { id:2, text:"Khoảng 2-3 ngày bạn nhé", sender:"admin"}
            ],

            orders:[
                { items:5, price:"1.450.000", date:"14/02/2026", status:"Done"}
            ]
        },

        {
            id:7,
            name:"Do Hoang",
            last:"Áo này có form rộng không?",
            time:"03:15 PM",
            avatar:"https://i.pravatar.cc/150?img=41",
            online:false,
            info:"Male • 65kg • New customer",

            messages:[
                { id:1, text:"Áo này form rộng hay slim?", sender:"user"},
                { id:2, text:"Form regular bạn nhé", sender:"admin"}
            ],

            orders:[
                { items:1, price:"290.000", date:"22/02/2026", status:"Done"}
            ]
        },

        {
            id:8,
            name:"Pham Linh",
            last:"Cảm ơn shop nhiều nhé!",
            time:"04:40 PM",
            avatar:"https://i.pravatar.cc/150?img=28",
            online:true,
            pinned:true,
            unread:2,
            info:"Female • 52kg • Loyal customer",

            messages:[
                { id:1, text:"Áo đẹp lắm shop ơi", sender:"user"},
                { id:2, text:"Cảm ơn bạn nhiều!", sender:"admin"}
            ],

            orders:[
                { items:4, price:"980.000", date:"28/01/2026", status:"Done"},
                { items:2, price:"480.000", date:"12/02/2026", status:"Done"}
            ]
        },

        {
            id:9,
            name:"Nguyen Phuc",
            last:"Shop còn hàng không?",
            time:"05:10 PM",
            avatar:"https://i.pravatar.cc/150?img=10",
            online:true,
            info:"Male • 74kg • Regular customer",

            messages:[
                { id:1, text:"Shop còn hàng không?", sender:"user"},
                { id:2, text:"Vẫn còn bạn nhé", sender:"admin"}
            ],

            orders:[
                { items:2, price:"640.000", date:"11/02/2026", status:"Done"}
            ]
        },

        {
            id:10,
            name:"Le Thanh",
            last:"Mình muốn đặt thêm 1 áo",
            time:"07:20 PM",
            avatar:"https://i.pravatar.cc/150?img=16",
            online:false,
            unread:1,
            info:"Male • 70kg • Regular customer",

            messages:[
                { id:1, text:"Tôi muốn đặt thêm 1 áo nữa", sender:"user"},
                { id:2, text:"Bạn đặt giúp mình nhé", sender:"admin"}
            ],

            orders:[
                { items:3, price:"780.000", date:"09/02/2026", status:"Done"}
            ]
        },

        {
            id:11,
            name:"Hoang An",
            last:"Shop tư vấn size giúp mình",
            time:"08:10 PM",
            avatar:"https://i.pravatar.cc/150?img=50",
            online:true,
            info:"Male • 69kg • New customer",

            messages:[
                { id:1, text:"Mình 69kg nên mặc size gì?", sender:"user"},
                { id:2, text:"Bạn mặc size L là vừa nhé", sender:"admin"}
            ],

            orders:[
                { items:1, price:"320.000", date:"01/03/2026", status:"Done"}
            ]
        }

    ];

    const [selectedUser, setSelectedUser] = useState(users[0]);
    const [showSearchPanel, setShowSearchPanel] = useState(false);
    const [messageInput, setMessageInput] = useState("");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [showEmoji, setShowEmoji] = useState(false);
    const [menuOpen, setMenuOpen] = useState(null);
    const [pinned, setPinned] = useState(null);
    const [chatMenu, setChatMenu] = useState(null);
    const [showVideoCall, setShowVideoCall] = useState(false);
    const [position,setPosition] = useState({x:0,y:0});
    const [dragging,setDragging] = useState(false);
    const dragRef = useRef({x:0,y:0});

    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);

    const [messages, setMessages] = useState(users[0].messages || []);

    const emojis = ["😀","😂","😍","👍","🔥","❤️","😢","😎"];
    const pinnedUsers = users.filter(user => user.pinned);
    const normalUsers = users.filter(user => !user.pinned);

    const sendMessage = () => {
        if(messageInput.trim()==="") return;

        setMessages([
            ...messages,
            {
                id: Date.now(),
                text: messageInput,
                sender: "admin"
            }
        ]);

        setMessageInput("");
    };

    const sendFile = (e)=>{
        const file = e.target.files[0];
        if(!file) return;

        setMessages([
            ...messages,
            {
                id: Date.now(),
                text:`📎 File: ${file.name}`,
                sender:"admin"
            }
        ]);
    };

    const sendImage = (e)=>{
        const file = e.target.files[0];
        if(!file) return;

        const url = URL.createObjectURL(file);

        setMessages([
            ...messages,
            {
                id:Date.now(),
                image:url,
                sender:"admin"
            }
        ]);
    };

    const highlight = (text)=>{
        if(!searchKeyword) return text;

        const parts = text.split(new RegExp(`(${searchKeyword})`,"gi"));

        return parts.map((part,i)=>
            part.toLowerCase()===searchKeyword.toLowerCase()
                ? <span key={i} className="bg-yellow-300">{part}</span>
                : part
        );
    };

    const handleMouseDown = (e) => {

        setDragging(true);

        dragRef.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };

    };

    const handleMouseMove = (e) => {

        if(!dragging) return;

        setPosition({
            x: e.clientX - dragRef.current.x,
            y: e.clientY - dragRef.current.y
        });

    };

    const handleMouseUp = () => {

        setDragging(false);

    };

    return (

        <div className="flex h-[90vh] bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 rounded-xl shadow-2xl overflow-hidden">

            {/* LEFT */}

            <div className="w-1/4 border-r bg-white/80 backdrop-blur-md p-4 flex flex-col h-full">

                <h2 className="text-xl font-bold mb-4">Messages</h2>

                <div className="flex items-center bg-gray-100 hover:bg-gray-200 transition rounded-full px-3 py-2 mb-4">
                    <Search size={18}/>
                    <input
                        className="bg-transparent ml-2 outline-none w-full"
                        placeholder="Search messages"
                    />
                </div>

                <div className="flex-1 overflow-y-auto pr-2">

                    {/* PINNED */}
                    <p className="text-gray-400 font-semibold text-sm mb-2 flex items-center gap-2">
                        📌 Pinned Messages
                    </p>

                    {pinnedUsers.map((user)=>(

                        <div
                            key={user.id}
                            onClick={()=>{
                                setSelectedUser(user);
                                setMessages(user.messages || []);
                            }}
                            className="group flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 hover:shadow-md transition cursor-pointer relative"
                        >

                            <img src={user.avatar} className="w-10 h-10 rounded-full"/>

                            <div className="flex-1 min-w-0">
                                <p className="font-semibold">{user.name}</p>
                                <p className="text-sm text-gray-500 truncate">{user.last}</p>
                            </div>

                            <span className="text-xs text-gray-400">
                                {user.time}
                            </span>
                            <button
                                onClick={(e)=>{
                                    e.stopPropagation();
                                    setChatMenu(chatMenu===user.id ? null : user.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-gray-200 transition"
                            >
                                <MoreVertical size={18}/>
                            </button>
                            {chatMenu===user.id && (

                                <div className="absolute right-2 top-12 w-52 bg-white shadow-xl rounded-xl border text-sm z-50">

                                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100">
                                        📌 Bỏ ghim hội thoại
                                    </button>

                                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100">
                                        👁 Đánh dấu chưa đọc
                                    </button>

                                    <button className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-500">
                                        🗑 Xóa hội thoại
                                    </button>

                                </div>

                            )}

                        </div>

                    ))}

                    {/* DIVIDER */}
                    <div className="border-t my-4"></div>

                    {/* ALL MESSAGES */}
                    <p className="text-gray-400 font-semibold text-sm mb-2">
                        💬 All Messages
                    </p>

                    {normalUsers.map((user)=>(

                        <div
                            key={user.id}
                            onClick={()=>{
                                setSelectedUser(user);
                                setMessages(user.messages || []);
                            }}
                            className="group flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer relative"
                        >

                            <div className="relative">

                                <img
                                    src={user.avatar}
                                    className="w-10 h-10 rounded-full"
                                />

                                {user.online && (
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                )}

                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="font-semibold">{user.name}</p>
                                <p className="text-sm text-gray-500 truncate">{user.last}</p>
                            </div>

                            <div className="flex flex-col items-end gap-1">

                 <span className="text-xs text-gray-400">
                   {user.time}
                 </span>
                                <button
                                    onClick={(e)=>{
                                        e.stopPropagation();
                                        setChatMenu(chatMenu===user.id ? null : user.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-gray-200 transition"
                                >
                                    <MoreVertical size={18}/>
                                </button>
                                {chatMenu===user.id && (

                                    <div className="absolute right-2 top-12 w-52 bg-white shadow-xl rounded-xl border text-sm z-50">

                                        <button className="w-full text-left px-4 py-2 hover:bg-gray-100">
                                            📌 Bỏ ghim hội thoại
                                        </button>

                                        <button className="w-full text-left px-4 py-2 hover:bg-gray-100">
                                            👁 Đánh dấu chưa đọc
                                        </button>

                                        <button className="w-full text-left px-4 py-2 hover:bg-gray-100">
                                            🔕 Tắt thông báo
                                        </button>

                                        <button className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-500">
                                            🗑 Xóa hội thoại
                                        </button>

                                    </div>

                                )}

                                {/* UNREAD BADGE */}
                                {user.unread > 0 && (
                                    <span className="bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs px-2 py-0.5 rounded-full shadow">
                                   {user.unread}
                                    </span>
                                )}

                            </div>

                        </div>

                    ))}

                </div>

            </div>

            {/* CENTER */}

            <div className="flex flex-col flex-1">

                {/* HEADER */}

                <div className="flex items-center justify-between border-b p-4 bg-white/90 backdrop-blur-md">

                    <div className="flex items-center gap-3">

                        <div className="relative">

                            <img
                                src={selectedUser.avatar}
                                className="w-10 h-10 rounded-full"
                            />

                            {selectedUser.online && ( <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                            )}

                        </div>

                        <div>
                            <p className="font-semibold">{selectedUser.name}</p>
                            <p className="text-green-500 text-sm">Active</p>
                        </div>

                    </div>

                    <div className="flex gap-4">
                        <Phone size={22} className="text-green-500 hover:text-green-600 cursor-pointer"/>
                        <button onClick={() => setShowVideoCall(true)}>
                            <Video size={22} className="text-blue-500 hover:text-blue-600 cursor-pointer"/>
                        </button>

                        <button onClick={()=>setShowSearchPanel(true)}>
                            <Search size={22}/>
                        </button>

                    </div>

                </div>

                {/* PINNED */}
                {pinned && (

                    <div className="bg-yellow-100 p-2 text-sm flex items-center gap-2 border-b">
                        <Pin size={16}/>
                        {pinned}
                    </div>
                )}

                {/* MESSAGES */}

                {/* MESSAGES */}
                <div className="flex-1 p-6 overflow-y-auto space-y-5">

                    {messages.map((msg)=>(

                        <div
                            key={msg.id}
                            className={`flex items-end gap-2 group ${
                                msg.sender==="admin" ? "justify-end" : ""
                            }`}
                        >

                            {/* USER AVATAR */}
                            {msg.sender==="user" && (
                                <img
                                    src={selectedUser.avatar}
                                    className="w-8 h-8 rounded-full"
                                />
                            )}

                            <div className="relative max-w-[65%]">

                                {/* MESSAGE BUBBLE */}
                                <div
                                    className={`px-4 py-2 rounded-2xl shadow break-words ${
                                        msg.sender==="admin"
                                            ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                                            : "bg-gray-100"
                                    }`}
                                >

                                    {msg.image ? (
                                        <img
                                            src={msg.image}
                                            className="rounded-lg max-w-[220px]"
                                        />
                                    ) : (
                                        highlight(msg.text)
                                    )}

                                </div>

                                {/* HOVER ICONS */}
                                <div
                                    className={`absolute top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition
                                    ${msg.sender==="admin" ? "-left-24" : "-right-24"}`}
                                >

                                    <button className="bg-white shadow p-1 rounded-full hover:bg-gray-100">
                                        <Heart size={16}/>
                                    </button>

                                    <button className="bg-white shadow p-1 rounded-full hover:bg-gray-100">
                                        <Reply size={16}/>
                                    </button>

                                    <button
                                        onClick={()=>setMenuOpen(menuOpen===msg.id ? null : msg.id)}
                                        className="bg-white shadow p-1 rounded-full hover:bg-gray-100"
                                    >
                                        <MoreVertical size={16}/>
                                    </button>

                                </div>

                                {/* MENU */}
                                {menuOpen===msg.id && (

                                    <div className="absolute top-8 right-0 bg-white shadow-lg rounded-lg w-44 text-sm border z-50">

                                        <button
                                            onClick={()=>navigator.clipboard.writeText(msg.text)}
                                            className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100"
                                        >
                                            <Copy size={16}/> Copy
                                        </button>

                                        <button
                                            onClick={()=>setPinned(msg.text)}
                                            className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100"
                                        >
                                            <Pin size={16}/> Pin
                                        </button>

                                    </div>

                                )}

                            </div>

                            {/* ADMIN AVATAR */}
                            {msg.sender==="admin" && (
                                <img
                                    src="https://i.pravatar.cc/150?img=5"
                                    className="w-8 h-8 rounded-full"
                                />
                            )}

                        </div>

                    ))}

                </div>

                {/* INPUT */}

                <div className="border-t p-4 flex items-center gap-3 bg-white relative">

                    <button
                        onClick={()=>fileInputRef.current.click()}
                        className="p-2 rounded-full hover:bg-gray-200 transition"

                    >

                        <Paperclip size={20}/>
                    </button>

                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={sendFile}
                    />

                    <button
                        onClick={()=>imageInputRef.current.click()}
                        className="p-2 rounded-full hover:bg-gray-200 transition"

                    >

                        <Image size={20}/>
                    </button>

                    <input
                        type="file"
                        accept="image/*"
                        ref={imageInputRef}
                        className="hidden"
                        onChange={sendImage}
                    />

                    <button
                        onClick={()=>setShowEmoji(!showEmoji)}
                        className="p-2 rounded-full hover:bg-gray-200 transition"

                    >

                        <Smile size={20}/>
                    </button>

                    {showEmoji && (

                        <div className="absolute bottom-14 left-20 bg-white border p-3 rounded-xl shadow flex gap-2">

                            {emojis.map((e)=>(
                                <span
                                    key={e}
                                    className="cursor-pointer text-xl hover:scale-125 transition"
                                    onClick={()=>setMessageInput(messageInput+e)}

                                >

                                  {e} </span>
                            ))}

                        </div>
                    )}

                    <input
                        value={messageInput}
                        onChange={(e)=>setMessageInput(e.target.value)}
                        onKeyDown={(e)=>e.key==="Enter" && sendMessage()}
                        className="flex-1 border rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Type message..."
                    />

                    <button
                        onClick={sendMessage}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:scale-105 text-white p-3 rounded-full transition shadow-lg"

                    >

                        <Send size={18}/>
                    </button>

                </div>

            </div>

            {/* RIGHT PANEL */}
            {!showSearchPanel ? (

                <div className="w-1/4 border-l bg-white/80 backdrop-blur-md p-6 overflow-y-auto">

                    <h2 className="text-xl font-bold mb-6">Profile</h2>

                    {/* AVATAR */}
                    <div className="flex flex-col items-center">

                        <img
                            src={selectedUser.avatar}
                            className="w-24 h-24 rounded-full mb-3"
                        />

                        <p className="font-bold text-lg">
                            {selectedUser.name}
                        </p>

                    </div>

                    {/* INFORMATION */}
                    <div className="mt-6">

                        <p className="text-gray-400 font-semibold mb-2">
                            Information:
                        </p>

                        <p className="text-sm text-gray-700">
                            {selectedUser.info || "No information"}
                        </p>

                    </div>

                    {/* PURCHASE HISTORY */}
                    <div className="mt-6">

                        <p className="text-gray-400 font-semibold mb-3">
                            Purchase History:
                        </p>

                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-xl space-y-3">

                            {selectedUser.orders?.length ? (
                                selectedUser.orders.map((order,index)=>(

                                    <div
                                        key={index}
                                        className="flex items-center justify-between bg-white p-2 rounded-lg shadow-sm"
                                    >

                                        <div className="flex items-center gap-3">

                                            <div className="w-6 h-6 bg-black text-white text-xs flex items-center justify-center rounded-full">
                                                {index+1}
                                            </div>

                                            <div>

                                                <p className="text-sm font-semibold">
                                                    {order.items} Items
                                                </p>

                                                <p className="text-xs text-gray-400">
                                                    {order.date}
                                                </p>

                                            </div>

                                        </div>

                                        <div className="text-right">

                                            <p className="text-sm font-semibold">
                                                {order.price} VND
                                            </p>

                                            <p className="text-xs text-green-600 font-semibold">
                                                {order.status}
                                            </p>

                                        </div>

                                    </div>

                                ))
                            ) : (
                                <p className="text-sm text-gray-400">No orders</p>
                            )}

                        </div>

                    </div>

                </div>

            ) : (

                <div className="w-1/4 border-l bg-white p-4">

                    <div className="flex justify-between items-center mb-4">

                        <h2 className="text-lg font-bold">
                            Tìm kiếm trong trò chuyện
                        </h2>

                        <button onClick={()=>setShowSearchPanel(false)}> <X size={20}/> </button>

                    </div>

                    <input
                        value={searchKeyword}
                        onChange={(e)=>setSearchKeyword(e.target.value)}
                        className="w-full border rounded-full px-4 py-2 mb-4"
                        placeholder="Nhập từ khóa"
                    />

                </div>

            )}

            {showVideoCall && (

                <div
                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                >

                    <div
                        onMouseDown={handleMouseDown}
                        style={{
                            transform:`translate(${position.x}px,${position.y}px)`
                        }}
                        className="relative w-[900px] h-[520px] bg-gray-900 rounded-xl overflow-hidden cursor-move"
                    >

                        <img
                            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2"
                            className="w-full h-full object-cover"
                        />

                        <div className="absolute top-4 left-4 flex items-center gap-3 text-white">

                            <button
                                onClick={()=>setShowVideoCall(false)}
                                className="bg-black/40 p-2 rounded-lg"
                            >
                                ←
                            </button>

                            <img
                                src={selectedUser.avatar}
                                className="w-8 h-8 rounded-full"
                            />

                            <span>{selectedUser.name}</span>

                        </div>

                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-6">

                            <button className="bg-white p-3 rounded-full">
                                <Video size={22}/>
                            </button>

                            <button
                                onClick={()=>setShowVideoCall(false)}
                                className="bg-red-500 text-white p-3 rounded-full"
                            >
                                <Phone size={22}/>
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );
}
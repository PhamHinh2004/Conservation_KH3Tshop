import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";

const ResetPassword = () => {
    const navigate = useNavigate();

    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // ⏳ TIMER 30s
    const [timeLeft, setTimeLeft] = useState(30);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        const token = sessionStorage.getItem("resetToken");

        if (!token) {
            alert("Please initiate the forgot password request first!");
            navigate("/forgot_password");
        }
    }, [navigate]);

    // ⏳ COUNTDOWN (fix chuẩn hơn)
    useEffect(() => {
        if (timeLeft <= 0) {
            setCanResend(true);
            return;
        }

        const timer = setTimeout(() => {
            setTimeLeft(timeLeft - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [timeLeft]);

    // 🔐 RESET PASSWORD
    const handleResetSubmit = async () => {
        if (!otp || !newPassword) {
            alert("Please enter both OTP and password!");
            return;
        }

        const token = sessionStorage.getItem("resetToken");

        setLoading(true);
        try {
            const response = await fetch("http://localhost:8080/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    otp,
                    newPassword
                }),
            });

            const data = await response.json();

            if (response.ok && data.code === 0) {
                alert("Đổi mật khẩu thành công!");

                sessionStorage.clear();
                navigate("/login");
            } else {
                alert(data.result || "OTP sai hoặc hết hạn!");
            }
        } catch (error) {
            alert("Lỗi server!");
        } finally {
            setLoading(false);
        }
    };

    // 🔁 RESEND OTP (FIX LỖI EMAIL)
    const handleResendOtp = async () => {
        let email = sessionStorage.getItem("resetEmail");

        // 🔥 fallback nếu thiếu email
        if (!email) {
            alert("Thiếu email, vui lòng nhập lại!");
            navigate("/forgot_password");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/auth/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email })
            });

            if (!response.ok) {
                throw new Error();
            }

            alert("Đã gửi lại OTP!");

            // reset UI
            setTimeLeft(30);
            setCanResend(false);
            setOtp(""); // clear OTP cũ

        } catch (err) {
            alert("Lỗi gửi lại OTP!");
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-gray-100 rounded-3xl shadow-2xl max-w-4xl w-full grid md:grid-cols-2">

                {/* LEFT */}
                <div className="p-8 md:p-12">
                    <h2 className="font-bold text-4xl mb-3">Reset Password</h2>

                    <div className="grid gap-6">

                        {/* OTP */}
                        <div>
                            <label className="text-gray-700 font-medium">Mã OTP:</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full border-2 rounded-lg px-4 py-3 mt-2 tracking-widest"
                                maxLength={6}
                            />

                            {/* TIMER */}
                            {!canResend ? (
                                <p className="text-sm text-gray-500 mt-2">
                                    Gửi lại sau: <b>{timeLeft}s</b>
                                </p>
                            ) : (
                                <button
                                    onClick={handleResendOtp}
                                    className="text-blue-500 text-sm mt-2 hover:underline"
                                >
                                    Gửi lại OTP
                                </button>
                            )}
                        </div>

                        {/* PASSWORD */}
                        <div>
                            <label className="text-gray-700 font-medium">Mật khẩu mới:</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full border-2 rounded-lg px-4 py-3 mt-2"
                            />
                        </div>

                        <button
                            onClick={handleResetSubmit}
                            disabled={loading}
                            className={`w-full py-4 rounded-lg text-white font-bold ${
                                loading ? "bg-gray-400" : "bg-red-500 hover:bg-red-600"
                            }`}
                        >
                            {loading ? "ĐANG XỬ LÝ..." : "XÁC NHẬN"}
                        </button>

                        {/* 🔙 BACK */}
                        <button
                            className="text-sm text-gray-500 hover:underline text-center mt-2"
                            onClick={() => {
                                sessionStorage.clear();
                                navigate("/forget_password");
                            }}
                        >
                            Quay lại nhập Email khác
                        </button>

                    </div>
                </div>

                {/* RIGHT */}
                <div className="hidden md:flex items-center justify-center bg-red-400">
                    <img
                        src="https://i.postimg.cc/J0TgG6NZ/Thiet-ke-chua-co-ten-(6).png"
                        className="rounded-full w-80 h-80"
                        alt="logo"
                    />
                </div>

            </div>
        </div>
    );
};

export default ResetPassword;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();

  const [formAuthentication, setFormAuthentication] = useState({
    username: "",
    password: "",
  });

  // 🔥 OTP STATE
  const [showModal, setShowModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [resendTime, setResendTime] = useState(0);

  // ⏳ countdown resend OTP
  useEffect(() => {
    if (resendTime <= 0) return;
    const timer = setInterval(() => {
      setResendTime((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendTime]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormAuthentication((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 🔐 LOGIN
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formAuthentication),
      });

      const data = await response.json();
      console.log("LOGIN RESPONSE:", data);

      if (response.ok) {
        const token = data.result.token;
        localStorage.setItem("accessToken", token);

        const decodedToken = jwtDecode(token);
        const role = decodedToken.scope;

        toast.success("Đăng nhập thành công!");

        if (role === "ADMIN") navigate("/admin");
        else if (role === "USER") navigate("/");
        else navigate("/staff/orders");
      } else {
        // 🔒 TÀI KHOẢN BỊ KHÓA
        if (data.code === 1005) {
          toast.warning("Tài khoản đang bị khóa!");

          const confirmUnlock = window.confirm(
              "Tài khoản đang bị khóa. Bạn có muốn mở khóa bằng OTP không?"
          );

          if (confirmUnlock) {
            setShowModal(true);
            handleSendOTP();
          }
        }

        // ❌ SAI PASS
        else if (data.code === 1004) {
          toast.error("Sai mật khẩu!");
        }

        // ❌ USER KHÔNG TỒN TẠI
        else if (data.code === 1001) {
          toast.error("Tài khoản không tồn tại!");
        }

        else {
          toast.error(data.message || "Lỗi không xác định");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Không kết nối được server!");
    }
  };

  // 📩 GỬI OTP
  const handleSendOTP = async () => {
    if (!formAuthentication.username) {
      toast.error("Nhập username trước!");
      return;
    }

    try {
      const res = await fetch(
          `http://localhost:8080/auth/send-otp?username=${formAuthentication.username}`,
          { method: "POST" }
      );

      if (res.ok) {
        toast.success("OTP đã gửi về email!");
        setResendTime(30);
      } else {
        toast.error("Không gửi được OTP!");
      }
    } catch {
      toast.error("Lỗi gửi OTP!");
    }
  };

  // 🔐 VERIFY OTP
  const handleVerifyOTP = async () => {
    try {
      const res = await fetch(
          `http://localhost:8080/auth/verify-otp?username=${formAuthentication.username}&otp=${otp}`,
          { method: "POST" }
      );

      const data = await res.json();

      if (res.ok) {
        toast.success("Mở khóa thành công!");

        setShowModal(false);
        setOtp("");
        setResendTime(0);

        // 👉 auto login lại
        handleSubmit();
      } else {
        toast.error("OTP sai!");
      }
    } catch {
      toast.error("Lỗi xác thực OTP!");
    }
  };

  return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-100 rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full grid md:grid-cols-2">

          {/* LEFT */}
          <div className="p-8 md:p-12">
            <h2 className="font-bold text-5xl mb-12">Sign In</h2>

            <form className="grid gap-6" onSubmit={handleSubmit}>
              {/* USERNAME */}
              <div>
                <label className="text-gray-700 font-medium">User name:</label>
                <input
                    type="text"
                    name="username"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3"
                    value={formAuthentication.username}
                    onChange={handleChange}
                    placeholder="Username..."
                    required
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label className="text-gray-700 font-medium">Password:</label>
                <input
                    type="password"
                    name="password"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3"
                    value={formAuthentication.password}
                    onChange={handleChange}
                    placeholder="Password..."
                    required
                />
              </div>

              {/* 🔥 GIỮ NGUYÊN UI NÚT */}
              <div className="flex gap-3 items-center mt-2 flex-wrap sm:flex-nowrap">
                <button
                    type="submit"
                    className="px-6 py-2 rounded-lg bg-gray-400 text-white font-semibold hover:bg-gray-500 transition whitespace-nowrap"
                >
                  Sign In
                </button>

                <button
                    type="button"
                    className="px-6 py-2 rounded-lg bg-white border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition whitespace-nowrap"
                    onClick={() => navigate("/register")}
                >
                  Sign Up
                </button>

                <span
                    className="text-gray-500 text-sm hover:text-gray-700 whitespace-nowrap sm:ml-auto cursor-pointer"
                    onClick={() => navigate("/forget_password")}
                >
                Forget Password?
              </span>
              </div>

              {/* NÚT LOGIN TO */}
              <button className="w-full py-4 bg-black text-white rounded-lg font-bold text-lg mt-4">
                LOG IN
              </button>
            </form>
          </div>

          {/* RIGHT */}
          <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-red-400 to-red-500 p-12">
            <img
                src="https://i.postimg.cc/J0TgG6NZ/Thiet-ke-chua-co-ten-(6).png"
                className="rounded-full w-80 border-8 border-white"
            />
          </div>
        </div>

        {/* 🔥 MODAL OTP */}
        {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-xl w-96 shadow-lg">
                <h3 className="text-lg font-bold mb-3">
                  Xác thực OTP để mở khóa
                </h3>

                <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full border p-2 rounded mb-3"
                    placeholder="Nhập OTP..."
                />

                <div className="flex gap-2">
                  <button
                      onClick={handleVerifyOTP}
                      className="flex-1 bg-black text-white py-2 rounded"
                  >
                    Xác nhận
                  </button>

                  <button
                      disabled={resendTime > 0}
                      onClick={handleSendOTP}
                      className="flex-1 bg-gray-500 text-white py-2 rounded disabled:bg-gray-300"
                  >
                    {resendTime > 0 ? `Gửi lại (${resendTime}s)` : "Gửi OTP"}
                  </button>
                </div>

                <button
                    onClick={() => setShowModal(false)}
                    className="mt-3 w-full text-gray-500"
                >
                  Đóng
                </button>
              </div>
            </div>
        )}
      </div>
  );
};

export default Login;
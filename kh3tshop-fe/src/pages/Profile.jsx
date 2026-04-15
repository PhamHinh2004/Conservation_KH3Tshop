// File: src/pages/Profile.jsx

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";import ChatBot from "../components/ChatBot";
import  Contact  from "../components/Contact";

const API_BASE = "http://localhost:8080";

// --- API CLIENT ---
const api = {
    async get(url) {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API_BASE}${url}`, {
            headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Network error");

        return data?.result ?? data;
    },

    async put(url, body) {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API_BASE}${url}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Update failed");
        return data?.result ?? data;
    },

    async post(url, body) {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API_BASE}${url}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Create failed");
        return data?.result ?? data;
    },

    // Hàm delete cho API client
    async delete(url) {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API_BASE}${url}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        });
        // Chỉ kiểm tra res.ok cho DELETE
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || "Delete failed");
        }
        return true;
    },
};

// --- UTILS ---
const formatDateForInput = (dateValue) => {
    if (!dateValue) return "";
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const isProfileChanged = (profile, initialProfile) => {
    if (!profile || !initialProfile) return false;
    return (
        profile.fullName !== initialProfile.fullName ||
        profile.email !== initialProfile.email ||
        profile.gender !== initialProfile.gender ||
        profile.avatar !== initialProfile.avatar ||
        formatDateForInput(profile.dateOfBirth) !==
        formatDateForInput(initialProfile.dateOfBirth)
    );
};

// --- ADDRESS SECTION ---
const AddressSection = ({ accountId, isCustomerProfile }) => {
    const [addresses, setAddresses] = useState([]);
    const [addressLoading, setAddressLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);

    const [editingAddress, setEditingAddress] = useState(null);

    const [editForm, setEditForm] = useState({
        id: null,
        delivery_address: "",
        province: "",
        delivery_note: "",
        accountId: accountId
    });

    const [currentActionId, setCurrentActionId] = useState(null);

    const [newAddress, setNewAddress] = useState({
        delivery_address: "",
        delivery_note: "",
        province: "",
        accountId: accountId,
    });

    const fetchAddresses = async () => {
        if (!accountId) return;

        setAddressLoading(true);
        try {
            const data = await api.get(`/addresses/${accountId}`);
            const list = Array.isArray(data) ? data : [];

            setAddresses(list);
        } catch {
            toast.error("Failed to load addresses");
            setAddresses([]);
        } finally {
            setAddressLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, [accountId]);

    const handleNewAddressChange = (e) => {
        const { name, value } = e.target;
        setNewAddress((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleStartEdit = (address) => {
        setShowAddForm(false);

        setEditingAddress(address.id);
        setCurrentActionId(null); // FIX: Ensure currentActionId is null when starting edit

        setEditForm({
            id: address.id,
            delivery_address: address.delivery_address || "",
            province: address.province || "",
            delivery_note: address.delivery_note || "",
            accountId: accountId
        });
    };

    const handleCancelEdit = () => {
        setEditingAddress(null);
        setEditForm({
            id: null,
            delivery_address: "",
            province: "",
            delivery_note: "",
            accountId: accountId
        });
        setCurrentActionId(null);
    };

    const handleEditAddress = async (e) => {
        e.preventDefault();

        if (!editForm.id) return;

        // Validation for Edit Address Form (optional but recommended)
        if (!editForm.delivery_address.trim() || !editForm.province.trim()) {
            toast.error("Address and Province are required.");
            return;
        }

        setCurrentActionId(editForm.id);

        try {
            await api.put("/addresses/update", editForm);

            toast.success("Address updated successfully!");
            handleCancelEdit();
            await fetchAddresses();

        } catch (error) {
            console.error("Error updating address:", error);
            toast.error("Failed to update address: " + (error.message || "Unknown error"));
        } finally {
            // Reset loading state
            setCurrentActionId(null);
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();

        // Validation for Add Address Form
        if (!newAddress.delivery_address.trim() || !newAddress.province.trim()) {
            toast.error("Address and Province are required.");
            return;
        }

        setCurrentActionId("ADD_NEW");
        try {
            await api.post("/addresses/add", newAddress);
            toast.success("Address added!");
            setShowAddForm(false);

            setNewAddress({
                delivery_address: "",
                delivery_note: "",
                province: "",
                accountId,
            });

            fetchAddresses();
        } catch {
            toast.error("Failed to add address");
        } finally {
            setCurrentActionId(null);
        }
    };

    const handleDeleteAddress = async (id) => {
        // BƯỚC FIX: Ép kiểu ID thành số nguyên rõ ràng
        const addressId = parseInt(id, 10);

        if (isNaN(addressId) || addressId <= 0) {
            toast.error("Error: Invalid Address ID.");
            console.error("Attempted to delete address with invalid ID:", id);
            return;
        }

        if (!window.confirm("Are you sure you want to delete this address?")) return;

        // SỬ DỤNG addressId đã được xác thực
        setCurrentActionId(addressId);
        try {
            // DÙNG addressId (số nguyên) để gọi API
            await api.delete(`/addresses/${addressId}`);
            toast.success("Address deleted successfully!");
            fetchAddresses();
        } catch (err) {
            // Lỗi từ Backend (ví dụ: "Address not found") sẽ được hiển thị
            toast.error(err.message);
        } finally {
            setCurrentActionId(null);
        }
    };
    const isAddressLoading = (id) => currentActionId === id;

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-black">Shipping Addresses</h2>

                {isCustomerProfile && (
                    <button
                        onClick={() => {
                            setShowAddForm(!showAddForm);
                            handleCancelEdit();
                        }}
                        className="text-red-600 hover:text-red-800 font-medium"
                    >
                        {showAddForm ? "Cancel Add" : "Add New"}
                    </button>
                )}
            </div>

            {addressLoading && !editingAddress ? (
                <p className="text-center text-gray-500">Loading...</p>
            ) : addresses.length === 0 && !showAddForm ? (
                <p className="text-center text-gray-500 py-8">No saved addresses yet.</p>
            ) : (
                <div className="flex-grow overflow-y-auto space-y-4 pr-2">
                    {addresses.map((addr) => (
                        <div key={addr.id}>
                            {editingAddress === addr.id ? (
                                // --- FORM EDIT ---
                                <form
                                    onSubmit={handleEditAddress}
                                    className="bg-red-100 rounded-lg p-4 border-2 border-red-500"
                                >
                                    <h4 className="font-bold mb-3 text-red-700">
                                        Edit Address
                                    </h4>

                                    <input
                                        name="delivery_address"
                                        value={editForm.delivery_address}
                                        onChange={handleEditFormChange}
                                        placeholder="Street address..."
                                        required
                                        className="w-full p-2 mb-2 border border-red-300 rounded"
                                    />

                                    <input
                                        name="province"
                                        value={editForm.province}
                                        onChange={handleEditFormChange}
                                        placeholder="Province"
                                        required
                                        className="w-full p-2 mb-2 border border-red-300 rounded"
                                    />

                                    <input
                                        name="delivery_note"
                                        value={editForm.delivery_note}
                                        onChange={handleEditFormChange}
                                        placeholder="Delivery note..."
                                        className="w-full p-2 mb-3 border border-red-300 rounded"
                                    />

                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            disabled={isAddressLoading(editForm.id)}
                                            className="flex-1 bg-red-600 text-white p-2 rounded hover:bg-red-700 disabled:opacity-50"
                                        >
                                            {isAddressLoading(editForm.id)
                                                ? "Updating..."
                                                : "Save Changes"}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            className="bg-gray-300 text-gray-800 p-2 rounded hover:bg-gray-400"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                // --- CARD ADDRESS ---
                                <div className="bg-gray-50 rounded-lg p-4 hover:shadow-md flex justify-between">
                                    <div>
                                        {/* BỔ SUNG: Hiển thị địa chỉ chi tiết */}
                                        <p className="font-semibold text-black mb-1">
                                            {addr.delivery_address}
                                        </p>

                                        <p className="text-sm text-gray-600 mb-1">
                                            {addr.province}
                                        </p>

                                        <p className="text-sm text-gray-500 italic">
                                            Note: {addr.delivery_note || "None"}
                                        </p>
                                    </div>

                                    {isCustomerProfile && addr.id > 0 && (
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleStartEdit(addr)}
                                                disabled={currentActionId !== null}
                                                className="text-blue-600 hover:bg-blue-100 p-1 rounded"
                                            >
                                                ✏️
                                            </button>

                                            <button
                                                onClick={() => handleDeleteAddress(addr.id)}
                                                disabled={currentActionId !== null}
                                                className="text-red-600 hover:bg-red-100 p-1 rounded"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* ADD FORM */}
            {showAddForm && (
                <form
                    onSubmit={handleAddAddress}
                    className="mt-6 bg-red-50 rounded-lg p-4"
                >
                    <h4 className="font-bold mb-3 text-red-700">Add New Address</h4>

                    <input
                        name="delivery_address"
                        value={newAddress.delivery_address}
                        onChange={handleNewAddressChange}
                        placeholder="Street address..."
                        required
                        className="w-full p-3 mb-3 border border-gray-300 rounded"
                    />


                    <input
                        name="province"
                        value={newAddress.province}
                        onChange={handleNewAddressChange}
                        placeholder="Province"
                        required
                        className="w-full p-3 mb-3 border border-gray-300 rounded"
                    />

                    <input
                        name="delivery_note"
                        value={newAddress.delivery_note}
                        onChange={handleNewAddressChange}
                        placeholder="Delivery note"
                        className="w-full p-3 mb-4 border border-gray-300 rounded"
                    />

                    <button
                        disabled={isAddressLoading("ADD_NEW")}
                        className="w-full bg-red-600 text-white p-3 rounded font-semibold hover:bg-red-700 disabled:opacity-50"
                    >
                        {isAddressLoading("ADD_NEW") ? "Saving..." : "Save Address"}
                    </button>
                </form>
            )}
        </div>
    );
};

// --- PROFILE PAGE ---
const Profile = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [initialProfile, setInitialProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({}); // <--- THÊM: State để lưu lỗi

    const [formData, setFormData] = useState({
        id: null,
        accountId: null,
        fullName: "",
        phoneNumber: "",
        email: "",
        gender: "MALE",
        dateOfBirth: "",
        avatar: "",
        createAt: "",
        emailVerificationCode: "", // 💡 Thêm verification code
    });

    const [avatarPreview, setAvatarPreview] = useState("");
    
    // 💡 Email verification states
    const [emailCheckStatus, setEmailCheckStatus] = useState(null); // null, 'exists', 'available', 'checking', 'pending', 'verified'
    const [emailCheckMessage, setEmailCheckMessage] = useState("");
    const [emailVerified, setEmailVerified] = useState(false);
    const [showVerificationInput, setShowVerificationInput] = useState(false);
    const [verificationCodeInput, setVerificationCodeInput] = useState("");
    const [sendingVerificationCode, setSendingVerificationCode] = useState(false);
    const [verifyingCode, setVerifyingCode] = useState(false);
    const [verificationCooldown, setVerificationCooldown] = useState(0);
    const emailCheckTimerRef = useRef(null);

    const fetchProfile = async () => {
        setLoading(true);

        try {
            const customerData = await api.get("/customers/profile");

            if (!customerData) {
                throw new Error("Customer profile not found"); // Đổi sang Tiếng Anh
            }

            const newProfile = {
                id: customerData.id,
                accountId: customerData.accountId || null,
                fullName: customerData.fullName || "",
                phoneNumber: customerData.phoneNumber || "",
                email: customerData.email || "",
                gender: customerData.gender || "MALE",
                dateOfBirth: customerData.dateOfBirth || null,
                avatar: customerData.avatar || "",
                createAt: customerData.createAt || null,
            };

            setProfile(newProfile);
            setInitialProfile(newProfile);
            setAvatarPreview(newProfile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(newProfile.fullName || 'User')}&background=random`);

            setFormData({
                id: newProfile.id,
                accountId: newProfile.accountId,
                fullName: newProfile.fullName,
                phoneNumber: newProfile.phoneNumber,
                email: newProfile.email,
                gender: newProfile.gender,
                dateOfBirth: formatDateForInput(newProfile.dateOfBirth),
                avatar: newProfile.avatar,
                createAt: formatDateForInput(newProfile.createAt),
                emailVerificationCode: "", // Reset verification code
            });
            
            // Reset email verification states
            setEmailCheckStatus(null);
            setShowVerificationInput(false);
            setVerificationCodeInput("");

        } catch (err) {
            console.error("Error fetching profile:", err);
            toast.error("Failed to load personal information. Please log in again."); // Đổi sang Tiếng Anh
        } finally {
            setLoading(false);
        }
    }; 

    useEffect(() => {
        fetchProfile();
    }, []);

    // --- VALIDATION LOGIC ---
    const NAME_REGEX = /^[A-Za-zÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝàáâãèéêìíòóôõùúýĂăĐđĨĩŨũƠơƯưẠ-ỹ\s]+$/;
    // Regex cho SĐT VN: Bắt đầu bằng 0 hoặc +84, theo sau là 9-10 chữ số (vd: 0901234567 hoặc +84901234567)
    const PHONE_REGEX = /^(0|\+84)[3|5|7|8|9][0-9]{8,9}$/;
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const GMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        // 1. Full Name
        if (!formData.fullName.trim()) {
            newErrors.fullName = "Full Name is required.";
            isValid = false;
        } else if (!NAME_REGEX.test(formData.fullName)) {
            newErrors.fullName = "Full Name must contain only letters and spaces.";
            isValid = false;
        }

        // 2. Email
        if (!formData.email.trim()) {
            newErrors.email = "Email is required.";
            isValid = false;
        } else if (!GMAIL_REGEX.test(formData.email)) {
            newErrors.email = "Email must be a valid Gmail address (example@gmail.com).";
            isValid = false;
        }

        // 3. Phone Number
        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = "Phone Number is required.";
            isValid = false;
        } else if (!PHONE_REGEX.test(formData.phoneNumber)) {
            newErrors.phoneNumber = "Invalid phone number format (e.g., 0901234567 or +84901234567).";
            isValid = false;
        }

        // 4. Date of Birth
        if (!formData.dateOfBirth) {
            newErrors.dateOfBirth = "Date of Birth is required.";
            isValid = false;
        } else {
            const today = new Date().toISOString().split('T')[0];
            if (formData.dateOfBirth >= today) {
                newErrors.dateOfBirth = "Date of Birth must be in the past (cannot be today or in the future).";
                isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
    };
    // --- END VALIDATION LOGIC ---
    
    // 💡 EMAIL VERIFICATION FUNCTIONS
    const checkEmailExists = async (email) => {
        if (!GMAIL_REGEX.test(email)) {
            setEmailCheckStatus(null);
            setEmailCheckMessage("Please enter a Gmail address ending with @gmail.com.");
            setErrors((prev) => ({ ...prev, email: "Email must be a valid Gmail address (example@gmail.com)." }));
            return;
        }
        
        if (email === initialProfile.email) {
            setEmailCheckStatus(null); // Email không thay đổi
            setShowVerificationInput(false);
            return;
        }
        
        setEmailCheckStatus('checking');
        setEmailCheckMessage('Checking email availability...');
        try {
            const response = await api.get(`/customers/check-email?email=${encodeURIComponent(email)}`);
            if (response.exists) {
                setEmailCheckStatus('exists');
                setEmailCheckMessage('This email already exists.');
                setEmailVerified(false);
                setShowVerificationInput(false);
                setErrors((prev) => ({ ...prev, email: 'This email already exists.' }));
            } else {
                const pendingCode = emailCheckStatus === 'pending' || verificationCooldown > 0;
                setEmailCheckStatus(pendingCode ? 'pending' : 'available');
                setEmailCheckMessage(pendingCode ? 'A verification code has already been sent. Enter it below.' : 'This email is available. You can verify it now.');
                setEmailVerified(false);
                setShowVerificationInput(pendingCode);
                setErrors((prev) => ({ ...prev, email: null }));
            }
        } catch (error) {
            console.error("Error checking email:", error);
            setEmailCheckStatus(null);
            setEmailCheckMessage('Cannot verify email existence right now. Please try again.');
            setErrors((prev) => ({ ...prev, email: "Cannot verify email existence right now. Please try again." }));
        }
    };
    
    const handleEmailBlur = () => {
        checkEmailExists(formData.email);
    };
    
    useEffect(() => {
        if (!initialProfile) return;
        
        if (emailCheckTimerRef.current) {
            clearTimeout(emailCheckTimerRef.current);
        }

        if (!formData.email || formData.email === initialProfile.email) {
            setEmailCheckStatus(null);
            setEmailCheckMessage("");
            return;
        }

        if (!GMAIL_REGEX.test(formData.email)) {
            setEmailCheckStatus(null);
            setEmailCheckMessage("");
            return;
        }

        emailCheckTimerRef.current = setTimeout(() => {
            checkEmailExists(formData.email);
        }, 700);

        return () => {
            if (emailCheckTimerRef.current) {
                clearTimeout(emailCheckTimerRef.current);
            }
        };
    }, [formData.email, initialProfile?.email]);
    
    const handleCheckEmail = async () => {
        await checkEmailExists(formData.email);
    };
    
    const handleSendVerificationCode = async () => {
        if (verificationCooldown > 0) {
            toast.error(`Please wait ${Math.ceil(verificationCooldown)} seconds before requesting again.`);
            return;
        }

        if (!GMAIL_REGEX.test(formData.email)) {
            toast.error("Please enter a valid Gmail address before sending the code.");
            return;
        }

        if (emailCheckStatus !== 'available') {
            toast.error("Please use an available email address.");
            return;
        }
        
        setSendingVerificationCode(true);
        try {
            await api.post("/customers/send-email-verification", {
                customerId: formData.id,
                newEmail: formData.email,
            });
            setShowVerificationInput(true);
            setEmailCheckStatus('pending');
            setEmailCheckMessage("A verification code has been sent. Enter it below.");
            setVerificationCooldown(120);
            toast.success(`Verification code sent to ${formData.email}. Please check your email.`);
        } catch (error) {
            console.error("Error sending verification code:", error);
            toast.error(error.message || "Failed to send verification code");
        } finally {
            setSendingVerificationCode(false);
        }
    };
    
    useEffect(() => {
        if (verificationCooldown <= 0) {
            return;
        }

        const interval = setInterval(() => {
            setVerificationCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [verificationCooldown]);

    const handleVerifyCode = async () => {
        if (!verificationCodeInput.trim()) {
            toast.error("Please enter the verification code");
            return;
        }
        
        setVerifyingCode(true);
        try {
            await api.post("/customers/verify-email-code", {
                customerId: formData.id,
                newEmail: formData.email,
                verificationCode: verificationCodeInput,
            });
            // Lưu code vào formData để gửi lên server khi save
            setFormData((prev) => ({ 
                ...prev, 
                emailVerificationCode: verificationCodeInput 
            }));
            setEmailVerified(true);
            setEmailCheckStatus('verified');
            setEmailCheckMessage('Email verified successfully. You can now save your profile.');
            toast.success("Email verified successfully!");
            setShowVerificationInput(false);
            setVerificationCodeInput("");
        } catch (error) {
            console.error("Error verifying code:", error);
            toast.error(error.message || "Invalid verification code");
            setEmailVerified(false);
            setEmailCheckStatus('available');
            setEmailCheckMessage('Verification failed. Please try again.');
        } finally {
            setVerifyingCode(false);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result;
            setAvatarPreview(result);
            setFormData((prev) => ({ ...prev, avatar: result }));
            setProfile((prev) => ({ ...prev, avatar: result }));
            if (errors.avatar) {
                setErrors((prev) => ({ ...prev, avatar: null }));
            }
        };
        reader.readAsDataURL(file);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
            ...(name === "email" ? { emailVerificationCode: "" } : {}),
        }));
        setProfile((prev) => ({ ...prev, [name]: value }));

        // 💡 Reset email verification states when email changes
        if (name === "email") {
            setEmailCheckStatus(null);
            setEmailCheckMessage("");
            setEmailVerified(false);
            setShowVerificationInput(false);
            setVerificationCodeInput("");
            setVerificationCooldown(0);
        }

        // Xóa lỗi khi người dùng bắt đầu gõ lại
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Kiểm tra Validation
        if (!validateForm()) {
            toast.error("Please review the information entered.");
            return;
        }

        // 2. Nếu email thay đổi, kiểm tra đã xác thực chưa
        if (formData.email !== initialProfile.email) {
            if (!emailVerified) {
                toast.error("Please verify your new email address before saving.");
                return;
            }
        }

        if (!formData.id) {
            toast.error("Customer ID could not be determined.");
            return;
        }

        setSaving(true);
        try {
            await api.put("/customers/update-profile", {
                id: formData.id,
                fullName: formData.fullName,
                phoneNumber: formData.phoneNumber,
                email: formData.email,
                gender: formData.gender,
                dateOfBirth: formData.dateOfBirth || null,
                avatar: formData.avatar || null,
                emailVerificationCode: formData.emailVerificationCode || null, // 💡 Thêm code
            });

            toast.success("Profile updated successfully!");
            // Cập nhật lại initialProfile để reset trạng thái hasChanged
            await fetchProfile();
        } catch (err) {
            // Handle specific error messages
            const errorMessage = err.message || "Profile Update Failed.";
            if (errorMessage.includes("already exists") || errorMessage.includes("USER_EXISTED")) {
                setErrors((prev) => ({ ...prev, email: "This email address is already in use. Please use a different email." }));
                toast.error("Email already exists. Please use a different email.");
            } else if (errorMessage.includes("Date of Birth")) {
                setErrors((prev) => ({ ...prev, dateOfBirth: "Date of Birth must be in the past." }));
                toast.error("Invalid Date of Birth. It must be in the past.");
            } else if (errorMessage.includes("INVALID_OTP") || errorMessage.includes("verification")) {
                toast.error("Email verification failed. Please try again.");
            } else {
                toast.error(errorMessage);
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-600"></div></div>;

    const hasChanged = isProfileChanged(profile, initialProfile);

    return (
        <div className="max-w-6xl mx-auto p-8 bg-gradient-to-br from-gray-50 to-red-50 min-h-screen">
            <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                            title="Go back"
                        >
                            <ArrowLeft size={24} className="text-gray-700" />
                        </button>
                        <h1 className="text-3xl font-extrabold text-black">
                            My Profile
                        </h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
                        <div className="space-y-6">
                            <div className="flex flex-col items-center gap-4 mb-4">
                                <div className="relative">
                                    <img
                                        src={avatarPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName || 'User')}&background=random`}
                                        alt="Avatar Preview"
                                        className="w-28 h-28 rounded-full object-cover border border-gray-200"
                                    />
                                    <label className="absolute bottom-0 right-0 bg-red-600 text-white rounded-full p-2 cursor-pointer hover:bg-red-700 transition">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                            className="hidden"
                                        />
                                        Edit
                                    </label>
                                </div>
                                <p className="text-sm text-gray-500">Change avatar, then save to update.</p>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
                                <input
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    onBlur={handleEmailBlur}
                                    placeholder="Enter your email"
                                    className={`w-full p-3 border rounded-lg focus:ring-2 transition ${
                                        errors.email
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                                            : 'border-gray-300 focus:border-red-500 focus:ring-red-200'
                                    }`}
                                />
                                {errors.email && (
                                    <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                                )}
                                
                                {emailCheckMessage && (
                                    <p className={`mt-1 text-xs ${emailCheckStatus === 'exists' ? 'text-red-500' : emailCheckStatus === 'available' || emailCheckStatus === 'verified' ? 'text-green-600' : 'text-blue-500'}`}>
                                        {emailCheckMessage}
                                    </p>
                                )}
                                
                                {emailCheckStatus === 'checking' && (
                                    <p className="mt-1 text-xs text-blue-500 flex items-center gap-1">
                                        <span className="animate-spin">⏳</span> Checking email...
                                    </p>
                                )}
                                
                                {formData.email !== initialProfile.email && emailCheckStatus !== 'checking' && (
                                    <button
                                        type="button"
                                        onClick={handleCheckEmail}
                                        className="mt-2 inline-flex items-center justify-center rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900 transition"
                                    >
                                        Check Email
                                    </button>
                                )}

                                {emailCheckStatus === 'pending' && !showVerificationInput && verificationCooldown > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setShowVerificationInput(true)}
                                        className="mt-2 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
                                    >
                                        Back to OTP input
                                    </button>
                                )}
                                
                                {emailCheckStatus === 'available' && !emailVerified && (
                                    <div className="mt-2 space-y-2">
                                        <p className="text-xs text-green-600">✅ Email is available</p>
                                        <button
                                            type="button"
                                            onClick={handleSendVerificationCode}
                                            disabled={sendingVerificationCode || verificationCooldown > 0}
                                            className="w-full bg-green-600 text-white p-2 rounded text-sm hover:bg-green-700 disabled:opacity-50 transition"
                                        >
                                            {sendingVerificationCode
                                                ? "Sending..."
                                                : verificationCooldown > 0
                                                    ? `Resend in ${Math.floor(verificationCooldown / 60)}:${String(verificationCooldown % 60).padStart(2, '0')}`
                                                    : "Send Verification Code"
                                            }
                                        </button>
                                    </div>
                                )}
                                
                                {emailCheckStatus === 'verified' && (
                                    <p className="mt-2 text-xs text-green-700">✅ Email verified. Ready to save.</p>
                                )}
                                
                                {showVerificationInput && (
                                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                                        <p className="text-xs text-blue-700 font-medium">
                                            A verification code has been sent to {formData.email}
                                        </p>
                                        <input
                                            type="text"
                                            placeholder="Enter 6-digit code"
                                            maxLength="6"
                                            value={verificationCodeInput}
                                            onChange={(e) => setVerificationCodeInput(e.target.value.replace(/\D/g, ''))}
                                            className="w-full p-2 border border-blue-300 rounded text-center text-lg font-mono"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={handleVerifyCode}
                                                disabled={verifyingCode || verificationCodeInput.length !== 6}
                                                className="flex-1 bg-blue-600 text-white p-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50 transition"
                                            >
                                                {verifyingCode ? "Verifying..." : "Verify Code"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowVerificationInput(false);
                                                    setVerificationCodeInput("");
                                                }}
                                                className="flex-1 bg-gray-300 text-gray-800 p-2 rounded text-sm hover:bg-gray-400 transition"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Full Name */}
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700">Full Name</label>
                                <input
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    className={`w-full p-3 border rounded-lg focus:ring-2 transition ${
                                        errors.fullName
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                                            : 'border-gray-300 focus:border-red-500 focus:ring-red-200'
                                    }`}
                                />
                                {errors.fullName && (
                                    <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>
                                )}
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700">Phone Number</label>
                                <input
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    readOnly
                                    className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed"
                                />
                                <p className="mt-1 text-xs text-gray-500">Phone number can not change.</p>
                            </div>

                            {/* Date of Birth */}
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700">Date of Birth</label>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                    className={`w-full p-3 border rounded-lg focus:ring-2 transition ${
                                        errors.dateOfBirth
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                                            : 'border-gray-300 focus:border-red-500 focus:ring-red-200'
                                    }`}
                                />
                                {errors.dateOfBirth && (
                                    <p className="mt-1 text-xs text-red-500">{errors.dateOfBirth}</p>
                                )}
                            </div>

                            {/* Gender */}
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700">Gender</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                                >
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700">Created Date</label>
                                <input
                                    value={formData.createAt ? new Date(formData.createAt).toLocaleDateString() : ''}
                                    readOnly
                                    className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed"
                                />
                            </div>

                            {/* Save Button */}
                            <button
                                disabled={!hasChanged || saving}
                                className="w-full bg-red-600 text-white p-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 transition"
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>

                    <AddressSection accountId={formData.accountId} isCustomerProfile={true} />
                </div>
            </div>
            <ChatBot/>
            <Contact/>
        </div>
    );
};

export default Profile;
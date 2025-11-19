import { useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function CustomerAuth({ onBack }) {
    const [mode, setMode] = useState('login'); // 'login' or 'register'
    const [step, setStep] = useState('enterPhone'); // 'enterPhone', 'setPassword'
    const [customerData, setCustomerData] = useState(null);

    // Login state
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Register state
    const [regPhone, setRegPhone] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [registering, setRegistering] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!phone || !password) {
            toast.error('Please provide phone and password');
            return;
        }
        setLoading(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/customer/login`, {
                phone,
                password
            });
            const user = res.data?.user;
            if (user) {
                login(user);
                toast.success('Signed in successfully');
                navigate('/customer/dashboard');
            } else {
                toast.error('Invalid response from server');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckPhone = async (e) => {
        e.preventDefault();
        if (!regPhone) {
            toast.error('Please enter your phone number.');
            return;
        }
        setRegistering(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/customers/check-phone`, { phone: regPhone });
            if (res.data.hasPassword) {
                toast.error('An account with this phone number already exists. Please log in.');
                setPhone(regPhone);
                setMode('login');
            } else {
                setCustomerData(res.data);
                setStep('setPassword');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error checking phone number.');
        } finally {
            setRegistering(false);
        }
    };

    const handleSetPassword = async (e) => {
        e.preventDefault();
        if (regPassword !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }
        if (regPassword.length < 6) {
            toast.error('Password must be at least 6 characters long.');
            return;
        }
        setRegistering(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/customers/set-password`, {
                phone: regPhone,
                password: regPassword
            });
            toast.success('Password set successfully! Please log in.');
            setPhone(regPhone);
            setPassword('');
            setMode('login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to set password.');
        } finally {
            setRegistering(false);
        }
    };

    const renderRegisterForm = () => {
        if (step === 'enterPhone') {
            return (
                <form onSubmit={handleCheckPhone}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2">Phone Number</label>
                        <input
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                            type="text"
                            placeholder="Enter phone number used during purchase"
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={registering}
                        className="w-full bg-[#4d55f5] hover:bg-[#3d45e5] text-white font-bold py-3 px-4 rounded-xl disabled:opacity-50"
                    >
                        {registering ? 'Checking...' : 'Continue'}
                    </button>
                </form>
            );
        }

        if (step === 'setPassword') {
            return (
                <form onSubmit={handleSetPassword}>
                    <div className="mb-4 p-4 bg-gray-100 rounded-xl">
                        <p className="text-sm text-gray-600">Welcome,</p>
                        <p className="font-bold text-lg text-gray-900">{customerData.name}</p>
                        <p className="text-sm text-gray-600">{customerData.phone}</p>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2">Create Password</label>
                        <input
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                            type="password"
                            placeholder="Enter a new password"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-medium mb-2">Confirm Password</label>
                        <input
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                            type="password"
                            placeholder="Confirm your new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={registering}
                        className="w-full bg-[#4d55f5] hover:bg-[#3d45e5] text-white font-bold py-3 px-4 rounded-xl disabled:opacity-50"
                    >
                        {registering ? 'Saving...' : 'Create Account'}
                    </button>
                </form>
            );
        }
    };

    return (
        <div>
            <div className="flex items-center mb-6">
                <button
                    onClick={onBack}
                    className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors duration-200 mr-4"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{mode === 'login' ? 'Customer Sign In' : 'Create Customer Account'}</h2>
            </div>

            <div className="mb-5">
                <div className="flex gap-2">
                    <button
                        className={`px-4 py-2 rounded-xl ${mode === 'login' ? 'bg-[#4d55f5] text-white' : 'bg-gray-100'}`}
                        onClick={() => setMode('login')}
                    >
                        Login
                    </button>
                    <button
                        className={`px-4 py-2 rounded-xl ${mode === 'register' ? 'bg-[#4d55f5] text-white' : 'bg-gray-100'}`}
                        onClick={() => { setMode('register'); setStep('enterPhone'); }}
                    >
                        Register
                    </button>
                </div>
            </div>

            {mode === 'login' ? (
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2">Phone</label>
                        <input
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                            type="text"
                            placeholder="Enter phone number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
                        <div className="relative">
                            <input
                                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#4d55f5] hover:bg-[#3d45e5] text-white font-bold py-3 px-4 rounded-xl disabled:opacity-50"
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>
            ) : (
                renderRegisterForm()
            )}
        </div>
    );
}

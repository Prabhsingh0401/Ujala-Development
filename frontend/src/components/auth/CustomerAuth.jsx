import { useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function CustomerAuth({ onBack }) {
    const [mode, setMode] = useState('login'); // 'login' or 'register'

    // Login state
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Register state
    const [name, setName] = useState('');
    const [regPhone, setRegPhone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
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
                // Redirect customers to their dashboard
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

    const validateRegister = () => {
        if (!name || !regPhone || !email || !address || !regPassword || !confirmPassword) {
            toast.error('Please fill all fields');
            return false;
        }
        if (regPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return false;
        }
        if (regPhone.length < 6) {
            toast.error('Please provide a valid phone number');
            return false;
        }
        return true;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!validateRegister()) return;
        setRegistering(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/customer/register`, {
                name,
                phone: regPhone,
                email,
                address,
                password: regPassword
            });
            const user = res.data?.user;
            if (user) {
                // Auto-login newly registered customer
                login(user);
                toast.success('Account created');
                navigate('/customer/dashboard');
            } else {
                toast.success('Registration successful');
                setMode('login');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setRegistering(false);
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
                        onClick={() => setMode('register')}
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
                <form 
                    onSubmit={handleRegister}
                    className="grid grid-cols-2 gap-1">
                    <div className="mb-2">
                        <label className="block text-gray-700 text-sm font-medium mb-2">Full Name</label>
                        <input
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-2">
                        <label className="block text-gray-700 text-sm font-medium mb-2">Phone</label>
                        <input
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                            type="text"
                            placeholder="Phone number"
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-2">
                        <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
                        <input
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-2">
                        <label className="block text-gray-700 text-sm font-medium mb-2">Address</label>
                        <input
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                            type="text"
                            placeholder="Address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-2">
                        <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
                        <input
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
                            type="password"
                            placeholder="Password"
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
                            placeholder="Confirm password"
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
                        {registering ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>
            )}
        </div>
    );
}

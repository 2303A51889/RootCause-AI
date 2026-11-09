import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, User, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { sendRegistrationOtp, verifyRegistrationOtp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      if (!otpSent) {
        await sendRegistrationOtp(name, email, password);
        setOtpSent(true);
        setSuccessMessage('A 6-digit verification code has been sent to your email.');
      } else {
        if (!otp) {
          setError('Please enter the 6-digit verification code.');
          return;
        }
        await verifyRegistrationOtp(email, otp);
        navigate('/login');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to complete registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] flex flex-col justify-center items-center p-6 selection:bg-blue-500 selection:text-white">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={() => navigate('/')}>
        <div className="w-12 h-12 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Zap className="w-6 h-6 fill-current" />
        </div>
        <div>
          <span className="font-extrabold text-2xl tracking-tight text-[#111827]">RootCause</span>
          <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 ml-1">
            AI
          </span>
        </div>
      </div>

      {/* Minimal Centered Register Card */}
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#E5E7EB] shadow-soft p-8 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-[#111827] tracking-tight">
            Create Developer Account
          </h2>
          <p className="text-xs text-[#6B7280]">
            Start analyzing production bugs in under 60 seconds
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 text-center font-medium">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-green-50 text-green-700 text-xs rounded-xl border border-green-200 text-center font-medium">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            placeholder="Alex Rivera"
            value={name}
            onChange={(e) => setName(e.target.value)}
            leftIcon={<User className="w-4 h-4" />}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="alex@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          {otpSent && (
            <Input
              label="Verification Code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full mt-2 shadow-md shadow-blue-500/20"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {otpSent ? 'Verify & Create Account' : 'Send Verification Code'}
          </Button>
        </form>

        <p className="text-center text-xs text-[#6B7280] pt-2">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsLoading(false);
    setSubmitted(true);
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

      <div className="w-full max-w-md bg-white rounded-2xl border border-[#E5E7EB] shadow-soft p-8 space-y-6">
        {!submitted ? (
          <>
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold text-[#111827] tracking-tight">Reset Password</h2>
              <p className="text-xs text-[#6B7280]">
                Enter your work email address and we'll send a password recovery link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="developer@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full shadow-md shadow-blue-500/20"
              >
                Send Password Reset Link
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-4 py-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#111827]">Check your inbox</h3>
            <p className="text-xs text-[#6B7280]">
              We have sent a reset password link to{' '}
              <span className="font-bold text-[#111827]">{email}</span>.
            </p>
          </div>
        )}

        <div className="pt-2 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

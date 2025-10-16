import React, { useState, useRef, useEffect } from 'react';
import { X, Mail, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setEmail('');
      setOtp(['', '', '', '', '', '']);
      setNewPassword('');
      setConfirmPassword('');
      setMessage(null);
      setIsSuccess(false);
    }
  }, [isOpen]);

  // Auto-focus first OTP field when step 2 is reached
  useEffect(() => {
    if (currentStep === 2 && otpRefs.current[0]) {
      otpRefs.current[0].focus();
    }
  }, [currentStep]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setMessage({ text: 'Please enter your email address', type: 'error' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage({ text: 'Please enter a valid email address', type: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // Mock API call - simulate sending OTP
      await new Promise(resolve => setTimeout(resolve, 2000));
      setCurrentStep(2);
      setMessage({ text: 'Verification code sent to your email', type: 'success' });
    } catch (error) {
      setMessage({ text: 'Failed to send verification code. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single character
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next field
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setMessage({ text: 'Please enter the complete 6-digit code', type: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // Mock API call - simulate OTP verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      setCurrentStep(3);
      setMessage({ text: 'Code verified successfully', type: 'success' });
    } catch (error) {
      setMessage({ text: 'Invalid verification code. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Mock API call - simulate resending OTP
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOtp(['', '', '', '', '', '']);
      setMessage({ text: 'Verification code resent to your email', type: 'success' });
      if (otpRefs.current[0]) {
        otpRefs.current[0].focus();
      }
    } catch (error) {
      setMessage({ text: 'Failed to resend code. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword) {
      setMessage({ text: 'Please enter a new password', type: 'error' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters long', type: 'error' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Passwords do not match', type: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // Mock API call - simulate password reset
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsSuccess(true);
      setMessage({ text: 'Password reset successfully!', type: 'success' });
      
      // Auto-close modal after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      setMessage({ text: 'Failed to reset password. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, text: '', color: '' };
    if (password.length < 6) return { strength: 1, text: 'Weak', color: 'text-red-500' };
    if (password.length < 8) return { strength: 2, text: 'Medium', color: 'text-yellow-500' };
    if (password.length >= 8) return { strength: 3, text: 'Strong', color: 'text-green-500' };
    return { strength: 0, text: '', color: '' };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Reset Password</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center p-6 border-b border-gray-200">
          {[1, 2, 3].map(step => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {currentStep > step ? <CheckCircle className="w-5 h-5" /> : step}
              </div>
              {step < 3 && (
                <div className={`w-16 h-1 ${
                  currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Success State */}
          {isSuccess ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Password Reset Successful!</h3>
              <p className="text-gray-600">Your password has been updated successfully. You can now log in with your new password.</p>
              <p className="text-sm text-gray-500">This window will close automatically...</p>
            </div>
          ) : (
            <>
              {/* Step 1: Email Input */}
              {currentStep === 1 && (
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Enter Your Email</h3>
                    <p className="text-gray-600">We'll send you a verification code to reset your password</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Sending...' : 'Send Verification Code'}
                  </button>
                </form>
              )}

              {/* Step 2: OTP Verification */}
              {currentStep === 2 && (
                <form onSubmit={handleOtpSubmit} className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Enter Verification Code</h3>
                    <p className="text-gray-600">We sent a 6-digit code to <span className="font-medium">{email}</span></p>
                  </div>
                  
                  <div className="flex gap-2 justify-center">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={el => otpRefs.current[index] = el}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ))}
                  </div>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="text-sm text-blue-600 hover:underline disabled:opacity-50"
                    >
                      Resend Code
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Verifying...' : 'Verify Code'}
                  </button>
                </form>
              )}

              {/* Step 3: Reset Password */}
              {currentStep === 3 && (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Create New Password</h3>
                    <p className="text-gray-600">Enter your new password below</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {newPassword && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                getPasswordStrength(newPassword).strength === 1 ? 'bg-red-500 w-1/3' :
                                getPasswordStrength(newPassword).strength === 2 ? 'bg-yellow-500 w-2/3' :
                                getPasswordStrength(newPassword).strength === 3 ? 'bg-green-500 w-full' : 'w-0'
                              }`}
                            />
                          </div>
                          <span className={`text-sm font-medium ${getPasswordStrength(newPassword).color}`}>
                            {getPasswordStrength(newPassword).text}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </form>
              )}
            </>
          )}

          {/* Message Display */}
          {message && (
            <div className={`mt-4 p-3 rounded-lg text-sm ${
              message.type === 'error'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;

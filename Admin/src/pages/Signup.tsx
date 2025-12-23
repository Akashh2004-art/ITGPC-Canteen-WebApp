import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { Eye, EyeOff, User, Phone, Lock, LockKeyhole, ArrowRight, GraduationCap, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(true);
  const [canRegister, setCanRegister] = useState(true);
  const [remainingSlots, setRemainingSlots] = useState(2);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  // Check admin availability on component mount
  useEffect(() => {
    checkAdminAvailability();
  }, []);

  const checkAdminAvailability = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/admin/availability`);
      const data = await response.json();

      if (data.success) {
        setCanRegister(data.data.canRegister);
        setRemainingSlots(data.data.remainingSlots);
      }
    } catch (error) {
      console.error('Error checking admin availability:', error);
      toast.error('Failed to check registration availability');
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.fullName || !formData.phone || !formData.password || !formData.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (formData.phone.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error for admin limit reached
        if (response.status === 403) {
          toast.error(data.message || 'Maximum admin limit reached');
          // Refresh availability status
          await checkAdminAvailability();
          return;
        }
        throw new Error(data.message || 'Signup failed');
      }

      // Store token in localStorage
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      toast.success('Account created successfully!');

      // Navigate to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);

    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error('Google authentication failed');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/google-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error for admin limit reached
        if (response.status === 403) {
          toast.error(data.message || 'Maximum admin limit reached');
          // Refresh availability status
          await checkAdminAvailability();
          return;
        }
        throw new Error(data.message || 'Google signup failed');
      }

      // Store token in localStorage
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      toast.success('Account created successfully with Google!');

      // Navigate to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);

    } catch (error: any) {
      console.error('Google signup error:', error);
      toast.error(error.message || 'Failed to create account with Google.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error('Google authentication failed. Please try again.');
  };

  const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;

  // Loading state while checking availability
  if (isCheckingAvailability) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Checking registration availability...</p>
        </div>
      </div>
    );
  }

  // Show message if registration is not available
  if (!canRegister) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="max-w-md w-full mx-auto px-6">
          <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-lg">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Registration Closed</h2>
            <p className="text-muted-foreground mb-6">
              Maximum admin limit has been reached. Only 2 admins are allowed to register for this canteen system.
            </p>
            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground">
                If you need access, please contact one of the existing administrators.
              </p>
            </div>
            <Button
              onClick={() => navigate('/')}
              className="w-full"
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row">
      {/* Left Side: Brand Section - Hidden on Mobile */}
      <div className="hidden lg:flex lg:w-[40%] w-full bg-gradient-to-br from-[#1e3a8a] to-[#2563eb] text-white relative overflow-hidden flex-col justify-between p-8 lg:p-12">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-64 h-64 rounded-full bg-[#f7a308] blur-3xl"></div>
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full"
            style={{
              backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
              backgroundSize: '30px 30px',
              opacity: 0.1,
            }}
          ></div>
        </div>

        <div className="relative z-10 flex-grow flex items-center justify-center py-10">
          {/* College Logo */}
          <div className="w-full max-w-sm aspect-square bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-center border border-white/20 shadow-2xl transform hover:scale-105 transition-transform duration-500">
            <div className="flex flex-col items-center justify-center text-center w-full h-full">
              <div className="flex-1 flex items-center justify-center w-full">
                <img
                  src="/college-logo.jpeg"
                  alt="Itahar Government Polytechnic Logo"
                  className="w-full h-full object-contain drop-shadow-2xl rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Signup Form */}
      <div className="lg:w-[60%] w-full bg-background flex flex-col justify-center overflow-y-auto">
        <div className="max-w-xl w-full mx-auto px-6 py-12 lg:px-16 lg:py-12">
          {/* Mobile Header - Only visible on mobile */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary shadow-lg mb-4">
              <GraduationCap className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">IGP CANTEEN</h1>
            <p className="text-muted-foreground text-sm mt-1">Itahar Government Polytechnic</p>
          </div>

          <div className="mb-6">
            <h2 className="text-3xl font-black text-foreground mb-2 tracking-tight">Create Account</h2>
            <p className="text-muted-foreground text-base">Join IGP Canteen for seamless food ordering</p>

            {/* Show remaining slots info */}
            {remainingSlots > 0 && (
              <div className="mt-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-3">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <span className="font-semibold">{remainingSlots}</span> admin {remainingSlots === 1 ? 'slot' : 'slots'} remaining
                </p>
              </div>
            )}
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground" htmlFor="fullName">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="Enter your full name"
                  type="text"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground" htmlFor="phone">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <span className="absolute left-10 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium pl-1 pointer-events-none">
                  +91
                </span>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel-national"
                  placeholder="98765 43210"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="pl-[70px]"
                  required
                />
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="••••••••"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`pl-10 pr-10 ${formData.confirmPassword && !passwordsMatch ? 'border-destructive focus-visible:ring-destructive' : ''
                      }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {formData.confirmPassword && !passwordsMatch && (
                  <p className="text-xs text-destructive mt-1">Passwords do not match</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 mt-4 group"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                <>
                  <span>Sign Up with Phone</span>
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-border"></div>
              <span className="flex-shrink-0 mx-4 text-muted-foreground text-xs font-medium uppercase">Or</span>
              <div className="flex-grow border-t border-border"></div>
            </div>

            {/* Google Button */}
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSignup}
                onError={handleGoogleError}
                useOneTap={false}
                text="continue_with"
                width="100%"
              />
            </div>

            {/* Login Link */}
            <div className="text-center mt-6">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link className="font-bold text-primary hover:underline transition-colors" to="/">
                  Login
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
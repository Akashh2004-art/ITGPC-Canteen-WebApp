import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { Eye, EyeOff, GraduationCap, Lock, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.phone || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.phone.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token and user data in localStorage
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      toast.success('Login successful!');

      // Navigate to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);

    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error('Google authentication failed');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/google-login`, {
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
        // If account not found, redirect to signup
        if (data.redirectTo === '/signup') {
          toast.error(data.message);
          setTimeout(() => {
            navigate('/signup');
          }, 1500);
          return;
        }
        throw new Error(data.message || 'Google login failed');
      }

      // Store token and user data in localStorage
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      toast.success('Login successful with Google!');

      // Navigate to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);

    } catch (error: any) {
      console.error('Google login error:', error);
      toast.error(error.message || 'Failed to login with Google.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error('Google authentication failed. Please try again.');
  };

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

      {/* Right Side: Login Form */}
      <div className="lg:w-[60%] w-full bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Mobile Logo Section - Only visible on mobile */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary shadow-lg mb-4">
              <GraduationCap className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">IGP CANTEEN</h1>
            <p className="text-muted-foreground text-sm mt-1">Itahar Government Polytechnic</p>
          </div>

          {/* Login Card */}
          <div className="bg-card rounded-2xl shadow-xl border border-border p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-foreground mb-2">Admin Login</h2>
              <p className="text-muted-foreground text-sm">Enter your credentials to access the portal</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Phone Number */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2" htmlFor="phone">
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
                    autoComplete="tel"
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

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
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

              {/* Forgot Password */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                  onClick={() => toast.info('Password reset coming soon!')}
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Logging in...
                  </span>
                ) : (
                  'Login'
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative flex py-4 items-center">
              <div className="flex-grow border-t border-border"></div>
              <span className="flex-shrink-0 mx-4 text-muted-foreground text-xs font-medium uppercase">Or</span>
              <div className="flex-grow border-t border-border"></div>
            </div>

            {/* Google Button */}
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={handleGoogleError}
                useOneTap={false}
                text="continue_with"
                width="100%"
              />
            </div>

            {/* Signup Link */}
            <div className="text-center mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="font-bold text-primary hover:underline transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>

            {/* Footer */}
            <p className="text-center text-sm text-muted-foreground mt-4">
              For authorized administrators only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
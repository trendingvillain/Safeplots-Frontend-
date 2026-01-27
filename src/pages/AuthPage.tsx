import React from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Mail, Lock, User, ArrowRight, KeyRound, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const AuthPage: React.FC = () => {
  const { login, register, verifyOtp, resendOtp, forgotPassword, resetPassword, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [registerData, setRegisterData] = useState({ name: '', phone: '', email: '', password: '', confirmPassword: '' });
  const [registerErrors, setRegisterErrors] = useState<Record<string, string>>({});
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otp, setOtp] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  
  // Forgot password states - OTP based flow
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtpSent, setForgotOtpSent] = useState(false);
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotOtpVerified, setForgotOtpVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotPasswordError, setForgotPasswordError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    try {
      await login(loginData.email, loginData.password);
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
      navigate('/');
    } catch (error: any) {
      setLoginError('Invalid email or password');
    }
  };

  const validateRegisterForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!registerData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!registerData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[+]?[\d\s-]{10,}$/.test(registerData.phone)) {
      errors.phone = 'Enter a valid phone number';
    }
    
    if (!registerData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) {
      errors.email = 'Enter a valid email address';
    }
    
    if (!registerData.password) {
      errors.password = 'Password is required';
    } else if (registerData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (registerData.password !== registerData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setRegisterErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateRegisterForm()) {
      return;
    }
    
    try {
      await register(registerData.email, registerData.password, registerData.name, registerData.phone);
      setRegisteredEmail(registerData.email);
      setShowOtpScreen(true);
      toast({
        title: 'OTP Sent!',
        description: `We've sent a verification code to ${registerData.email}`,
      });
    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast({
        title: 'Invalid OTP',
        description: 'Please enter the 6-digit code sent to your email.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await verifyOtp(registeredEmail, otp);
      toast({
        title: 'Email Verified!',
        description: 'Welcome to SafePlots.in',
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Verification failed',
        description: 'Invalid OTP. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleResendOtp = async () => {
    try {
      await resendOtp(registeredEmail);
      toast({
        title: 'OTP Resent!',
        description: `A new verification code has been sent to ${registeredEmail}`,
      });
    } catch (error) {
      toast({
        title: 'Failed to resend',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  // OTP-based forgot password flow
  const handleSendForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordError('');
    
    try {
      await forgotPassword(forgotEmail);
      setForgotOtpSent(true);
      toast({
        title: 'OTP Sent!',
        description: `Verification code sent to ${forgotEmail}`,
      });
    } catch (error: any) {
      setForgotPasswordError(error.message || 'Failed to send OTP');
    }
  };

  const handleVerifyForgotOtp = async () => {
    if (forgotOtp.length !== 6) {
      setForgotPasswordError('Please enter the 6-digit OTP');
      return;
    }
    
    // OTP verified - show password reset form
    setForgotOtpVerified(true);
    setForgotPasswordError('');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordError('');
    
    if (newPassword.length < 6) {
      setForgotPasswordError('Password must be at least 6 characters');
      return;
    }
    
    if (newPassword !== confirmNewPassword) {
      setForgotPasswordError('Passwords do not match');
      return;
    }
    
    try {
      await resetPassword(forgotOtp, newPassword);
      toast({
        title: 'Password Reset Successful!',
        description: 'You can now login with your new password.',
      });
      // Reset all forgot password states
      setShowForgotPassword(false);
      setForgotEmail('');
      setForgotOtpSent(false);
      setForgotOtp('');
      setForgotOtpVerified(false);
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error: any) {
      setForgotPasswordError(error.message || 'Failed to reset password');
    }
  };

  const handleCloseForgotPassword = () => {
    setShowForgotPassword(false);
    setForgotEmail('');
    setForgotOtpSent(false);
    setForgotOtp('');
    setForgotOtpVerified(false);
    setNewPassword('');
    setConfirmNewPassword('');
    setForgotPasswordError('');
  };

  // OTP Verification Screen (after registration)
  if (showOtpScreen) {
    return (
      <Layout showFooter={false}>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <Link to="/" className="inline-flex items-center gap-2">
                <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-glow">
                  <Shield className="h-7 w-7" />
                </div>
              </Link>
              <h1 className="mt-4 font-heading text-2xl font-bold text-foreground">
                Verify Your Email
              </h1>
              <p className="text-muted-foreground mt-1">
                Enter the 6-digit code sent to
              </p>
              <p className="text-primary font-medium">{registeredEmail}</p>
            </div>
            
            <Card className="border-border/50 shadow-card">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center space-y-6">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <KeyRound className="h-8 w-8 text-primary" />
                  </div>
                  
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => setOtp(value)}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>

                  <Button 
                    className="w-full gap-2" 
                    onClick={handleVerifyOtp}
                    disabled={isLoading || otp.length !== 6}
                  >
                    {isLoading ? 'Verifying...' : 'Verify Email'}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  
                  <div className="text-center text-sm text-muted-foreground">
                    <p>Didn't receive the code?</p>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-primary"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                    >
                      Resend OTP
                    </Button>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    className="text-muted-foreground"
                    onClick={() => {
                      setShowOtpScreen(false);
                      setOtp('');
                    }}
                  >
                    ← Back to Sign Up
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-glow">
                <Shield className="h-7 w-7" />
              </div>
            </Link>
            <h1 className="mt-4 font-heading text-2xl font-bold text-foreground">
              Welcome to SafePlots
            </h1>
            <p className="text-muted-foreground mt-1">
              Sign in to continue your property journey
            </p>
          </div>
          
          <Card className="border-border/50 shadow-card">
            <Tabs defaultValue="login">
              <CardHeader className="pb-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Sign Up</TabsTrigger>
                </TabsList>
              </CardHeader>
              
              <CardContent>
                
                {/* Login Tab */}
                <TabsContent value="login" className="mt-0">
                  <form onSubmit={handleLogin} className="space-y-4">
                    {loginError && (
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                        {loginError}
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="you@example.com"
                          className="pl-10"
                          value={loginData.email}
                          onChange={(e) => {
                            setLoginData({ ...loginData, email: e.target.value });
                            setLoginError('');
                          }}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="login-password">Password</Label>
                        <Button
                          type="button"
                          variant="link"
                          className="p-0 h-auto text-xs text-primary"
                          onClick={() => setShowForgotPassword(true)}
                        >
                          Forgot password?
                        </Button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          value={loginData.password}
                          onChange={(e) => {
                            setLoginData({ ...loginData, password: e.target.value });
                            setLoginError('');
                          }}
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                      {isLoading ? 'Signing in...' : 'Sign In'}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </form>
                </TabsContent>
                
                {/* Register Tab */}
                <TabsContent value="register" className="mt-0">
                  <form onSubmit={handleRegister} className="space-y-4">
                    {/* Name Field */}
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Full Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-name"
                          type="text"
                          placeholder="Your full name"
                          className={`pl-10 ${registerErrors.name ? 'border-destructive' : ''}`}
                          value={registerData.name}
                          onChange={(e) => {
                            setRegisterData({ ...registerData, name: e.target.value });
                            if (registerErrors.name) setRegisterErrors(prev => ({ ...prev, name: '' }));
                          }}
                        />
                      </div>
                      {registerErrors.name && <p className="text-xs text-destructive">{registerErrors.name}</p>}
                    </div>
                    
                    {/* Phone Field */}
                    <div className="space-y-2">
                      <Label htmlFor="register-phone">Phone Number *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-phone"
                          type="tel"
                          placeholder="+91 9876543210"
                          className={`pl-10 ${registerErrors.phone ? 'border-destructive' : ''}`}
                          value={registerData.phone}
                          onChange={(e) => {
                            setRegisterData({ ...registerData, phone: e.target.value });
                            if (registerErrors.phone) setRegisterErrors(prev => ({ ...prev, phone: '' }));
                          }}
                        />
                      </div>
                      {registerErrors.phone && <p className="text-xs text-destructive">{registerErrors.phone}</p>}
                    </div>
                    
                    {/* Email Field */}
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="you@example.com"
                          className={`pl-10 ${registerErrors.email ? 'border-destructive' : ''}`}
                          value={registerData.email}
                          onChange={(e) => {
                            setRegisterData({ ...registerData, email: e.target.value });
                            if (registerErrors.email) setRegisterErrors(prev => ({ ...prev, email: '' }));
                          }}
                        />
                      </div>
                      {registerErrors.email && <p className="text-xs text-destructive">{registerErrors.email}</p>}
                    </div>
                    
                    {/* Password Field */}
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-password"
                          type="password"
                          placeholder="••••••••"
                          className={`pl-10 ${registerErrors.password ? 'border-destructive' : ''}`}
                          value={registerData.password}
                          onChange={(e) => {
                            setRegisterData({ ...registerData, password: e.target.value });
                            if (registerErrors.password) setRegisterErrors(prev => ({ ...prev, password: '' }));
                          }}
                        />
                      </div>
                      {registerErrors.password && <p className="text-xs text-destructive">{registerErrors.password}</p>}
                    </div>
                    
                    {/* Confirm Password Field */}
                    <div className="space-y-2">
                      <Label htmlFor="register-confirm">Confirm Password *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-confirm"
                          type="password"
                          placeholder="••••••••"
                          className={`pl-10 ${registerErrors.confirmPassword ? 'border-destructive' : ''}`}
                          value={registerData.confirmPassword}
                          onChange={(e) => {
                            setRegisterData({ ...registerData, confirmPassword: e.target.value });
                            if (registerErrors.confirmPassword) setRegisterErrors(prev => ({ ...prev, confirmPassword: '' }));
                          }}
                        />
                      </div>
                      {registerErrors.confirmPassword && <p className="text-xs text-destructive">{registerErrors.confirmPassword}</p>}
                    </div>
                    
                    <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    
                    <p className="text-xs text-center text-muted-foreground">
                      By signing up, you agree to our{' '}
                      <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
                      {' '}and{' '}
                      <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                    </p>
                  </form>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={handleCloseForgotPassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              {!forgotOtpSent 
                ? "Enter your email to receive a verification code"
                : !forgotOtpVerified 
                  ? "Enter the 6-digit code sent to your email"
                  : "Create a new password"
              }
            </DialogDescription>
          </DialogHeader>
          
          {forgotPasswordError && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {forgotPasswordError}
            </div>
          )}
          
          {!forgotOtpSent ? (
            <form onSubmit={handleSendForgotOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send OTP'}
              </Button>
            </form>
          ) : !forgotOtpVerified ? (
            <div className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <InputOTP
                  maxLength={6}
                  value={forgotOtp}
                  onChange={(value) => setForgotOtp(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button 
                onClick={handleVerifyForgotOtp} 
                className="w-full" 
                disabled={isLoading || forgotOtp.length !== 6}
              >
                Verify OTP
              </Button>
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => setForgotOtpSent(false)}
              >
                ← Back
              </Button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-new-password">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm-new-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default AuthPage;
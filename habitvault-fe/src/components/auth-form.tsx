"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, RefreshCw, MailIcon, UserIcon, KeyIcon, AlertCircle } from "lucide-react";
import { generateRandomPassword } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface AuthFormProps {
  type: "login" | "register";
}

// Schema for login form
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// Schema for register form with username
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export function AuthForm({ type }: AuthFormProps) {
  const { login, register: registerUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // Get redirect path from URL if it exists
  const redirectPath = searchParams.get('redirect') || '/dashboard';

  // Render login form
  if (type === "login") {
    // Login form setup
    const {
      register,
      handleSubmit,
      formState: { errors },
      setValue,
      watch,
    } = useForm<LoginFormValues>({
      resolver: zodResolver(loginSchema),
      defaultValues: {
        email: "",
        password: "",
      },
    });

    const watchedEmail = watch("email");
    const watchedPassword = watch("password");
    const isFormFilled = watchedEmail && watchedPassword && watchedEmail.length > 0 && watchedPassword.length > 0;

    const onLoginSubmit = async (data: LoginFormValues) => {
      setIsSubmitting(true);
      setError(null);

      try {
        const result = await login(data.email, data.password);
        
        if (result.success) {
          toast({
            title: "Success",
            description: "You've been logged in successfully!",
          });
          
          router.push(redirectPath);
        } else {
          setError(result.message);
          toast({
            title: "Error",
            description: result.message,
            variant: "destructive",
          });
        }
      } catch (err) {
        const errorMessage = "An unexpected error occurred. Please try again.";
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="w-full max-w-md mx-auto backdrop-blur-sm bg-card/95 shadow-xl border-opacity-50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center font-bold">Login</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-3 bg-destructive/15 text-destructive text-sm rounded-lg flex items-start"
                >
                  <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>
            <form onSubmit={handleSubmit(onLoginSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <MailIcon className="h-4 w-4" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    {...register("email")}
                    className={cn(
                      "pl-9 transition-all border border-input rounded-md focus:ring-2 focus:ring-primary/20",
                      errors.email ? "border-destructive focus:ring-destructive/20" : "focus:border-primary"
                    )}
                  />
                </div>
                <AnimatePresence>
                  {errors.email && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-sm text-destructive mt-1 flex items-center"
                    >
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.email.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <KeyIcon className="h-4 w-4" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                    className={cn(
                      "pl-9 pr-10 transition-all border border-input rounded-md focus:ring-2 focus:ring-primary/20",
                      errors.password ? "border-destructive focus:ring-destructive/20" : "focus:border-primary"
                    )}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-sm text-destructive mt-1 flex items-center"
                    >
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.password.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              
              <Button
                type="submit"
                className={cn(
                  "w-full relative overflow-hidden transition-all duration-300",
                  isFormFilled ? "bg-primary hover:bg-primary/90" : "bg-primary/80"
                )}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign in"
                )}
                {isFormFilled && !isSubmitting && (
                  <motion.span
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    className="absolute bottom-0 left-0 h-1 bg-white/20"
                    transition={{ duration: 0.3 }}
                  />
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-border/50 pt-5">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <a
                href="/register"
                className="text-primary font-medium hover:text-primary/90 hover:underline transition-colors"
              >
                Sign up
              </a>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }

  // Register form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const watchedUsername = watch("username");
  const watchedEmail = watch("email");
  const watchedPassword = watch("password");
  const isFormFilled = watchedUsername && watchedEmail && watchedPassword 
    && watchedUsername.length > 0 && watchedEmail.length > 0 && watchedPassword.length > 0;

  const generatePassword = () => {
    const password = generateRandomPassword(12, true);
    setValue("password", password);
    setShowPassword(true); // Show the password when generated
  };

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Send email, password and username to the API
      const result = await registerUser(data.email, data.password, data.username);
      console.log(result);
      if (result.success) {
        toast({
          title: "Success",
          description: "Account created successfully! Please login.",
        });
        
        // Always redirect to login page after successful registration
        // Using replace to prevent going back to registration page via browser history
        router.replace("/login");
      } else {
        setError(result.message);
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      const errorMessage = "An unexpected error occurred. Please try again.";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="w-full max-w-md mx-auto backdrop-blur-sm bg-card/95 shadow-xl border-opacity-50">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center font-bold">Create Account</CardTitle>
          <CardDescription className="text-center">
            Enter your details to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 bg-destructive/15 text-destructive text-sm rounded-lg flex items-start"
              >
                <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
          <form onSubmit={handleSubmit(onRegisterSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">Username</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <UserIcon className="h-4 w-4" />
                </div>
                <Input
                  id="username"
                  placeholder="johndoe"
                  {...register("username")}
                  className={cn(
                    "pl-9 transition-all border border-input rounded-md focus:ring-2 focus:ring-violet-500/20",
                    errors.username ? "border-destructive focus:ring-destructive/20" : "focus:border-violet-500"
                  )}
                />
              </div>
              <AnimatePresence>
                {errors.username && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-sm text-destructive mt-1 flex items-center"
                  >
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.username.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <MailIcon className="h-4 w-4" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  className={cn(
                    "pl-9 transition-all border border-input rounded-md focus:ring-2 focus:ring-violet-500/20",
                    errors.email ? "border-destructive focus:ring-destructive/20" : "focus:border-violet-500"
                  )}
                />
              </div>
              <AnimatePresence>
                {errors.email && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-sm text-destructive mt-1 flex items-center"
                  >
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.email.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <KeyIcon className="h-4 w-4" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className={cn(
                    "pl-9 pr-10 transition-all border border-input rounded-md focus:ring-2 focus:ring-violet-500/20",
                    errors.password ? "border-destructive focus:ring-destructive/20" : "focus:border-violet-500"
                  )}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-sm text-destructive mt-1 flex items-center"
                  >
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.password.message}
                  </motion.p>
                )}
              </AnimatePresence>
              
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-1 text-xs border border-violet-200 dark:border-violet-800/30 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
                  onClick={generatePassword}
                >
                  <RefreshCw className="h-3 w-3 mr-2" />
                  Generate Strong Password
                </Button>
              </motion.div>
              
              {watchedPassword && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 space-y-1"
                >
                  <p className="text-xs text-muted-foreground">Password strength:</p>
                  <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ 
                        width: watchedPassword.length >= 12 ? '100%' : 
                              watchedPassword.length >= 10 ? '75%' :
                              watchedPassword.length >= 8 ? '50%' : '25%' 
                      }}
                      className={cn(
                        "h-full",
                        watchedPassword.length >= 12 ? 'bg-green-500' :
                        watchedPassword.length >= 10 ? 'bg-yellow-500' :
                        watchedPassword.length >= 8 ? 'bg-orange-500' : 'bg-red-500'
                      )}
                    />
                  </div>
                </motion.div>
              )}
            </div>
            
            <Button
              type="submit"
              className={cn(
                "w-full relative overflow-hidden transition-all duration-300",
                isFormFilled ? "bg-violet-600 hover:bg-violet-700" : "bg-violet-600/80"
              )}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
              {isFormFilled && !isSubmitting && (
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  className="absolute bottom-0 left-0 h-1 bg-white/20"
                  transition={{ duration: 0.3 }}
                />
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-border/50 pt-5">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-violet-600 dark:text-violet-400 font-medium hover:text-violet-700 dark:hover:text-violet-300 hover:underline transition-colors"
            >
              Sign in
            </a>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
} 
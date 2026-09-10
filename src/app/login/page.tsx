"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { LogIn, Mail, Lock, Eye, EyeOff, Loader2, Zap, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface LoginErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [loading, setLoading] = useState(false);
  
  const { signIn } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: LoginErrors = {};
    
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await signIn(email, password);
      toast({
        title: "Access Granted",
        description: "Welcome to the SCRBRD Hub.",
      });
      router.push("/home");
    } catch (error: unknown) {
      console.error("Login error:", error);
      const errorMessage = error instanceof Error ? error.message : "Invalid credentials. Identity could not be verified.";
      toast({
        title: "Access Denied",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-6 selection:bg-primary/30">
      {/* Cinematic Background Elements */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 blur-[150px] rounded-full opacity-40 pointer-events-none" />
      <div className="absolute top-0 right-0 p-8 flex items-center gap-2 opacity-50">
        <Zap className="h-4 w-4 text-primary fill-primary" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Cricket OS v2.0</span>
      </div>

      <div className="w-full max-w-[440px] relative z-10 animate-slide-in-up">
        <div className="flex flex-col items-center mb-10">
          <Link href="/" className="group mb-6">
            <div className="flex items-center justify-center w-full max-w-[360px] h-32 mb-8 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 overflow-hidden shadow-2xl shadow-orange-500/20 backdrop-blur-xl p-6">
              <Image
                src="/images/scrbrd-logo.png"
                alt="SCRBRD Logo"
                width={320}
                height={80}
                className="w-full h-auto object-contain"
                priority
              />
            </div>
          </Link>
          <h1 className="text-3xl font-black tracking-tight mb-2 text-gradient">WELCOME TO THE HUB</h1>
          <p className="text-muted-foreground text-sm font-medium opacity-70">Enter your credentials to access the Operating System</p>
        </div>

        <Card className="glass-card border-white/5 shadow-2xl overflow-hidden">
          <CardContent className="pt-8 px-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest opacity-70">Identity (Email)</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@school.edu"
                    className={cn(
                      "pl-10 h-12 bg-white/[0.02] border-white/5 focus-visible:ring-primary/30 transition-all",
                      errors.email ? "border-destructive/50" : "hover:border-white/10"
                    )}
                  />
                </div>
                {errors.email && <p className="text-[10px] font-bold text-destructive uppercase tracking-wider">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest opacity-70">Secret (Password)</Label>
                  <Link href="/forgot-password" className="text-[10px] font-bold text-primary uppercase tracking-[0.1em] hover:underline opacity-70">
                    Reset Password
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={cn(
                      "pl-10 pr-10 h-12 bg-white/[0.02] border-white/5 focus-visible:ring-primary/30 transition-all",
                      errors.password ? "border-destructive/50" : "hover:border-white/10"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-[10px] font-bold text-destructive uppercase tracking-wider">{errors.password}</p>}
              </div>

              <div className="flex items-center space-x-2 py-2">
                <Checkbox 
                  id="remember" 
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                  className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label htmlFor="remember" className="text-xs font-bold uppercase tracking-widest opacity-60 cursor-pointer select-none">
                  Keep me logged in
                </Label>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-sm font-black uppercase tracking-widest bg-primary hover:bg-primary/90 shadow-xl shadow-primary/10 transition-all duration-300" 
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    Enter Dashboard
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center pb-8 pt-4 border-t border-white/5 bg-white/[0.01]">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              New to SCRBRD?{' '}
              <Link href="/signup" className="text-primary hover:underline ml-1">
                Establish Identity
              </Link>
            </p>
          </CardFooter>
        </Card>

        {/* Security Footer */}
        <div className="mt-12 flex items-center justify-center gap-4 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" />
            <span className="text-[10px] font-bold uppercase tracking-widest italic leading-none">Encrypted Connection</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-white/20" />
          <span className="text-[10px] font-bold uppercase tracking-widest italic leading-none">Security Protocol Active</span>
        </div>
      </div>
    </div>
  );
}

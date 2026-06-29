# Admin Password Reset Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a password reset flow (request reset, callback code exchange, and update password) in the admin portal.

**Architecture:** Create `/forgot-password` and `/reset-password` routes, adding a callback route handler `/api/auth/callback` to handle Supabase Auth PKCE code exchange, and link the flow from `/login`.

**Tech Stack:** Next.js 16+, Supabase SSR client, Tailwind CSS.

---

### Task 1: Create Auth Callback API Route

**Files:**
- Create: `app/api/auth/callback/route.ts`

- [ ] **Step 1: Write the code for the GET handler**

Write code to `app/api/auth/callback/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/dashboard';

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            const forwardedHost = request.headers.get('x-forwarded-host');
            const isLocalEnv = process.env.NODE_ENV === 'development';
            if (isLocalEnv) {
                return NextResponse.redirect(`${origin}${next}`);
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`);
            } else {
                return NextResponse.redirect(`${origin}${next}`);
            }
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?message=auth_error`);
}
```

- [ ] **Step 2: Commit**

Run:
```bash
git add app/api/auth/callback/route.ts
git commit -m "feat: add api auth callback route for PKCE code exchange"
```

---

### Task 2: Create Forgot Password Request Page

**Files:**
- Create: `app/(auth)/forgot-password/page.tsx`

- [ ] **Step 1: Write the Page code**

Write code to `app/(auth)/forgot-password/page.tsx`:
```tsx
"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wind, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();

    const handleRequestReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/api/auth/callback?next=/reset-password`,
            });

            if (resetError) {
                toast.error(resetError.message);
                setError(resetError.message);
                setLoading(false);
                return;
            }

            setSuccess(true);
            toast.success("Password reset email sent!");
        } catch (err) {
            console.error('Password reset request error:', err);
            toast.error("An unexpected error occurred");
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0A1628] p-4 text-gray-100 font-sans dark admin">
            <Card className="w-full max-w-[400px] border-gray-800 bg-[#0e213b] shadow-2xl">
                <CardHeader className="space-y-4 items-center pb-6">
                    <div className="flex items-center gap-3 bg-cyan-500/10 pl-2 pr-5 py-2 rounded-full border border-cyan-500/20 justify-center">
                        <div className="bg-cyan-500/20 p-2 rounded-full">
                            <Wind className="h-5 w-5 text-cyan-500" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white font-outfit">AirSense</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded font-bold uppercase tracking-[0.2em]">
                            Admin Portal
                        </span>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-white font-outfit text-center">Reset Password</CardTitle>
                    <CardDescription className="text-gray-400 text-center">
                        Request a recovery link to access your administrator account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {success ? (
                        <div className="space-y-6">
                            <div className="bg-green-950/30 border border-green-500/30 rounded-lg p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-green-400">Recovery Link Sent</p>
                                    <p className="text-xs text-green-500/80 leading-relaxed mt-1">
                                        We have sent a secure link to <span className="font-bold text-green-300">{email}</span>. Click the link in the email to set a new password.
                                    </p>
                                </div>
                            </div>
                            <Link href="/login" className="w-full flex items-center justify-center gap-2 border border-gray-800 bg-[#0A1628] hover:bg-[#132238] hover:text-white text-gray-400 font-semibold h-11 rounded-xl transition-all">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Log In
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleRequestReset} className="space-y-4">
                            {error && (
                                <Alert variant="destructive" className="bg-red-900/20 text-red-400 border-red-900/50 py-2">
                                    <AlertDescription className="text-xs">{error}</AlertDescription>
                                </Alert>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs uppercase tracking-wider text-gray-500 font-bold">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@municipality.gov"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-[#0A1628] border-gray-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 h-11 transition-all text-white"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-cyan-500 hover:bg-cyan-600 active:scale-[0.98] text-[#0A1628] font-bold h-11 mt-6 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Sending link...</span>
                                    </div>
                                ) : 'Send Reset Link'}
                            </Button>
                            <Link href="/login" className="w-full flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-gray-300 mt-4 transition-colors">
                                <ArrowLeft className="h-3 w-3" />
                                Back to Log In
                            </Link>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
```

- [ ] **Step 2: Commit**

Run:
```bash
git add app/\(auth\)/forgot-password/page.tsx
git commit -m "feat: add forgot password request page"
```

---

### Task 3: Create Reset Password Page

**Files:**
- Create: `app/(auth)/reset-password/page.tsx`

- [ ] **Step 1: Write the Page code**

Write code to `app/(auth)/reset-password/page.tsx`:
```tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wind, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [checkingSession, setCheckingSession] = useState(true);

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const checkSession = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error("No active recovery session. Please request a new link.");
                router.push('/login?message=access_denied');
            } else {
                setCheckingSession(false);
            }
        };
        checkSession();
    }, [router, supabase]);

    const getPasswordStrength = () => {
        if (!password) return 0;
        let strength = 0;
        if (password.length >= 8) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 25;
        if (/[^A-Za-z0-9]/.test(password)) strength += 25;
        return strength;
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: password,
            });

            if (updateError) {
                toast.error(updateError.message);
                setError(updateError.message);
                setLoading(false);
                return;
            }

            toast.success("Password updated successfully!");
            // Log out to clear the recovery session
            await supabase.auth.signOut();
            router.push('/login?message=password_reset_success');
        } catch (err) {
            console.error('Password update error:', err);
            toast.error("An unexpected error occurred");
            setError("An unexpected error occurred");
            setLoading(false);
        }
    };

    const strength = getPasswordStrength();

    if (checkingSession) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0A1628]">
                <Loader2 className="h-8 w-8 text-cyan-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0A1628] p-4 text-gray-100 font-sans dark admin">
            <Card className="w-full max-w-[400px] border-gray-800 bg-[#0e213b] shadow-2xl">
                <CardHeader className="space-y-4 items-center pb-6">
                    <div className="flex items-center gap-3 bg-cyan-500/10 pl-2 pr-5 py-2 rounded-full border border-cyan-500/20 justify-center">
                        <div className="bg-cyan-500/20 p-2 rounded-full">
                            <Wind className="h-5 w-5 text-cyan-500" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white font-outfit">AirSense</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded font-bold uppercase tracking-[0.2em]">
                            Admin Portal
                        </span>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-white font-outfit text-center">New Password</CardTitle>
                    <CardDescription className="text-gray-400 text-center">
                        Set a secure password for your administrator account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        {error && (
                            <Alert variant="destructive" className="bg-red-900/20 text-red-400 border-red-900/50 py-2">
                                <AlertDescription className="text-xs">{error}</AlertDescription>
                            </Alert>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-xs uppercase tracking-wider text-gray-500 font-bold">New Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="8+ characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="bg-[#0A1628] border-gray-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 h-11 pr-10 transition-all text-white"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {password && (
                                <div className="space-y-1.5 pt-1">
                                    <div className="flex justify-between text-[10px] items-center">
                                        <span className="text-gray-500 font-bold uppercase tracking-widest">Strength</span>
                                        <span className={
                                            strength <= 25 ? "text-red-400" :
                                                strength <= 50 ? "text-orange-400" :
                                                    strength <= 75 ? "text-yellow-400" : "text-green-400"
                                        }>
                                            {strength <= 25 ? "Weak" :
                                                strength <= 50 ? "Fair" :
                                                    strength <= 75 ? "Good" : "Strong"}
                                        </span>
                                    </div>
                                    <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-500 ${strength <= 25 ? "bg-red-500" :
                                                strength <= 50 ? "bg-orange-500" :
                                                    strength <= 75 ? "bg-yellow-500" : "bg-green-500"
                                                }`}
                                            style={{ width: `${strength}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-xs uppercase tracking-wider text-gray-500 font-bold">Confirm New Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="bg-[#0A1628] border-gray-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 h-11 transition-all text-white"
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-cyan-500 hover:bg-cyan-600 active:scale-[0.98] text-[#0A1628] font-bold h-11 mt-6 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Updating password...</span>
                                </div>
                            ) : 'Update Password'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
```

- [ ] **Step 2: Commit**

Run:
```bash
git add app/\(auth\)/reset-password/page.tsx
git commit -m "feat: add reset password page"
```

---

### Task 4: Integrate Flow in Login Page

**Files:**
- Modify: `app/(auth)/login/page.tsx`

- [ ] **Step 1: Add Forgot Password link & handle status query params**

Apply these changes to `app/(auth)/login/page.tsx`:
1. Update `useEffect` (lines 30-50) to support `password_reset_success`, `auth_error`, and `access_denied`:
```typescript
    useEffect(() => {
        if (message === 'signed_out') {
            setInfoMessage("You have been signed out successfully.");
            setInfoType('success');
        } else if (message === 'session_expired') {
            setInfoMessage("Your session has expired. Please sign in again.");
            setInfoType('warning');
        } else if (message === 'password_reset_success') {
            setInfoMessage("Your password has been reset successfully. Please log in with your new password.");
            setInfoType('success');
        } else if (message === 'auth_error') {
            setInfoMessage("Authentication error or link expired. Please request a new password reset link.");
            setInfoType('warning');
        } else if (message === 'access_denied') {
            setInfoMessage("Access denied or recovery session expired. Please request a new link.");
            setInfoType('warning');
        }

        if (message) {
            const timer = setTimeout(() => {
                setInfoMessage(null);
                setInfoType(null);
                // Clear the URL param without refreshing
                const url = new URL(window.location.href);
                url.searchParams.delete('message');
                window.history.replaceState({}, '', url.toString());
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);
```

2. Update password input Label block to add the "Forgot password?" link:
```tsx
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="password" className="text-xs uppercase tracking-wider text-gray-500 font-bold">Password</Label>
                                <Link href="/forgot-password" className="text-xs text-cyan-500 hover:text-cyan-400 font-semibold transition-colors">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="bg-[#0A1628] border-gray-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 h-11 pr-10 transition-all text-white"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
```

- [ ] **Step 2: Compile verification**

Run: `npm run build`
Expected: Next.js builds successfully without typescript or compilation errors.

- [ ] **Step 3: Commit**

Run:
```bash
git add app/\(auth\)/login/page.tsx
git commit -m "feat: link forgot password flow from login page"
```

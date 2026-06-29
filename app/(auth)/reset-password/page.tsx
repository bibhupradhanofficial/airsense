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

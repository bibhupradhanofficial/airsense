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

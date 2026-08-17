'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Lock, Mail, Loader2 } from 'lucide-react';

const ADMIN_EMAIL = 'ganeshkoilada1247@gmail.com';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signInWithGoogle, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [portal, setPortal] = useState<'admin' | 'user'>('user');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    if (portal === 'admin' && email.trim().toLowerCase() !== ADMIN_EMAIL) {
      toast.error('Only the configured administrator email can use Admin Login.');
      return;
    }

    setLoading(true);
    try {
      const role = await signIn(email, password);
      if (portal === 'admin' && role !== 'admin') {
        await signOut();
        throw new Error('This email is not an administrator account. Please use User Login.');
      }
      if (portal === 'user' && role === 'admin') {
        await signOut();
        throw new Error('Administrator accounts must use Admin Login.');
      }
      toast.success(`Welcome back to the ${portal === 'admin' ? 'Admin' : 'User'} Portal!`);
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const role = await signInWithGoogle();
      if (role === 'admin') {
        await signOut();
        throw new Error('Administrator accounts must use Admin Login.');
      }
      toast.success('Welcome to the User Portal!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass border-border/50 shadow-2xl backdrop-blur-xl">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-xl font-bold tracking-tight">
          Committee Portal Login
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          {portal === 'admin'
            ? 'Administrator access for managing users, finances, and settings'
            : 'Member access for authorized committee users and volunteers'}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/40 p-1">
            <Button type="button" size="sm" variant={portal === 'user' ? 'default' : 'ghost'} onClick={() => setPortal('user')}>
              User Login
            </Button>
            <Button type="button" size="sm" variant={portal === 'admin' ? 'default' : 'ghost'} onClick={() => setPortal('admin')}>
              Admin Login
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="name@moonfriends.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 bg-background/50 border-border/60 focus:border-gold"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Password
              </Label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 bg-background/50 border-border/60 focus:border-gold"
                required
              />
            </div>
          </div>

          {portal === 'user' && (
            <>
              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/60" /></div>
                <div className="relative flex justify-center"><span className="bg-card px-2 text-[10px] uppercase tracking-wider text-muted-foreground">or</span></div>
              </div>
              <Button type="button" variant="outline" className="w-full" disabled={loading} onClick={handleGoogleSignIn}>
                Continue with Google
              </Button>
            </>
          )}

        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gold hover:bg-gold-dark text-night-deep font-bold h-11 transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing In...
              </>
            ) : (
              `Sign In to ${portal === 'admin' ? 'Admin' : 'User'} Portal`
            )}
          </Button>

          {portal === 'user' && (
            <p className="text-xs text-muted-foreground text-center">
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="text-gold hover:text-gold-dark font-semibold underline-offset-4 hover:underline transition-colors"
              >
                Sign Up
              </Link>
            </p>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}

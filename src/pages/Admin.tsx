import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Header from '@/components/Header';
import AdminDashboard from '@/components/AdminDashboard';
import { toast } from 'sonner';
import { Lock, Shield, Eye, EyeOff } from 'lucide-react';

// Simple admin credentials (in production, this would be handled by a proper auth system)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      toast.success('Login successful');
    } else {
      toast.error('Invalid credentials');
    }

    setIsLoading(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    toast.info('Logged out successfully');
  };

  if (isAuthenticated) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container flex items-center justify-center py-12 md:py-20">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Admin Login</h1>
            <p className="text-muted-foreground">
              Sign in to access the attendance dashboard
            </p>
          </div>

          <div className="rounded-xl bg-card p-6 shadow-card">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                size="lg" 
                variant="hero"
                disabled={isLoading || !username || !password}
                className="w-full"
              >
                <Lock className="h-4 w-4" />
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 rounded-lg bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground text-center">
                <strong>Demo Credentials:</strong><br />
                Username: admin | Password: admin123
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;

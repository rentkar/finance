import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LogIn, Loader2 } from 'lucide-react';
import { signIn } from '@/lib/auth';

interface AdminLoginProps {
  onSuccess: (role: 'director' | 'finance') => void;
}

export function AdminLogin({ onSuccess }: AdminLoginProps) {
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { success, role, error } = await signIn(username, password);

      if (success && role) {
        toast({
          title: "Success",
          description: "Logged in successfully",
        });
        onSuccess(role);
      } else {
        throw new Error(error || 'Authentication failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid credentials. Use username: director/finance, password: 1234",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="text"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
          placeholder="director or finance"
          autoComplete="username"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          placeholder="1234"
          autoComplete="current-password"
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Logging in...
          </>
        ) : (
          <>
            <LogIn className="mr-2 h-4 w-4" />
            Login
          </>
        )}
      </Button>

      <p className="text-sm text-muted-foreground text-center mt-4">
        Use username: director/finance, password: 1234
      </p>
    </form>
  );
}
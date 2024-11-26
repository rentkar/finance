import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PurchaseForm } from '@/components/purchase-form';
import { AdminDashboard } from '@/components/admin-dashboard';
import { AdminLogin } from '@/components/admin-login';
import { LogIn, Shield } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AuthState {
  isAuthenticated: boolean;
  userRole: 'director' | 'finance' | null;
  username: string | null;
}

const VALID_USERS = [
  { username: 'director', password: '1234', role: 'director' as const },
  { username: 'finance', password: '1234', role: 'finance' as const }
];

export default function App() {
  const [auth, setAuth] = useState<AuthState>(() => {
    const saved = sessionStorage.getItem('auth');
    return saved ? JSON.parse(saved) : {
      isAuthenticated: false,
      userRole: null,
      username: null
    };
  });
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<"user" | "admin">("user");

  useEffect(() => {
    sessionStorage.setItem('auth', JSON.stringify(auth));
  }, [auth]);

  const handleLogin = async (username: string, password: string) => {
    const user = VALID_USERS.find(
      u => u.username === username.toLowerCase() && u.password === password
    );

    if (user) {
      setAuth({
        isAuthenticated: true,
        userRole: user.role,
        username: user.username
      });
      setShowLoginDialog(false);
      setActiveTab("admin");
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setAuth({
      isAuthenticated: false,
      userRole: null,
      username: null
    });
    setActiveTab("user");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Purchase Portal</h1>
            {auth.isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Logged in as <span className="font-medium capitalize">{auth.username}</span> ({auth.userRole})
                </span>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("admin")}
                  className="flex items-center gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Admin Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Admin Login
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Admin Login</DialogTitle>
                  </DialogHeader>
                  <AdminLogin onLogin={handleLogin} />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {auth.isAuthenticated && activeTab === "admin" ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Admin Dashboard</h2>
              <Button
                variant="outline"
                onClick={() => setActiveTab("user")}
                className="flex items-center gap-2"
              >
                <LogIn className="h-4 w-4" />
                Back to Purchase Form
              </Button>
            </div>
            <AdminDashboard userRole={auth.userRole} />
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Submit Purchase</h2>
            <PurchaseForm />
          </div>
        )}
      </main>
    </div>
  );
}
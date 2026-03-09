import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Home, User, LogOut, Menu, X, Building2, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/auth';
    switch (user.role) {
      case 'admin':
        return '/admin';
      case 'seller':
        return '/seller';
      default:
        return '/dashboard';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md transition-all group-hover:shadow-glow">
            <Shield className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading text-xl font-bold tracking-tight text-foreground">
              Safe<span className="text-primary">Plots</span>
            </span>
            <span className="text-[10px] text-muted-foreground -mt-1">Buy Land. Safely.</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <Home className="h-4 w-4" />
              Home
            </Button>
          </Link>
          <Link to="/properties">
            <Button variant="ghost" size="sm" className="gap-2">
              <Building2 className="h-4 w-4" />
              Properties
            </Button>
          </Link>
          {isAuthenticated ? (
            <>
              <Link to={getDashboardLink()}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 ml-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[100px] truncate">{user?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                    <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
                      {user?.role}
                    </span>
                  </div>
                  <DropdownMenuSeparator />
                  
                  
                  
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2 ml-4">
              <Link to="/auth">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/seller/register">
                <Button variant="default" size="sm">Post Property</Button>
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container py-4 flex flex-col gap-2">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Home className="h-4 w-4" />
                Home
              </Button>
            </Link>
            <Link to="/properties" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Building2 className="h-4 w-4" />
                Properties
              </Button>
            </Link>
            {isAuthenticated ? (
              <>
                <Link to={getDashboardLink()} onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">Login</Button>
                </Link>
                <Link to="/seller/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="default" className="w-full">Post Property</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;

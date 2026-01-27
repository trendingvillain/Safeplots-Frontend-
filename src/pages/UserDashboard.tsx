import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import StatCard from '@/components/dashboard/StatCard';
import PropertyCard from '@/components/property/PropertyCard';
import EmptyState from '@/components/common/EmptyState';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { getSavedProperties, getSentInquiries, getViewedProperties } from '@/services/userService';
import { formatPrice } from '@/lib/formatters';
import { useToast } from '@/hooks/use-toast';
import { Property, Inquiry, PropertyView } from '@/types';
import {
  Heart,
  Send,
  Eye,
  Settings,
  Building2,
  MessageCircle,
  ArrowRight,
  Lock,
  Clock,
  MapPin,
  AlertCircle,
} from 'lucide-react';
import ImageWithFallback from '@/components/common/ImageWithFallback';

const UserDashboard: React.FC = () => {
  const { user, changePassword } = useAuth();
  const { toast } = useToast();
  
  // API state
  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  const [sentInquiries, setSentInquiries] = useState<Inquiry[]>([]);
  const [viewedProperties, setViewedProperties] = useState<PropertyView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [saved, inquiries, viewed] = await Promise.all([
          getSavedProperties(),
          getSentInquiries(),
          getViewedProperties(),
        ]);
        setSavedProperties(saved);
        setSentInquiries(inquiries);
        setViewedProperties(viewed);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast({ title: 'Password too short', variant: 'destructive' });
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      toast({ title: 'Password Changed', description: 'Your password has been updated.' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      toast({ title: 'Failed', description: 'Could not change password.', variant: 'destructive' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return <Layout><DashboardSkeleton /></Layout>;
  }

  if (error) {
    return (
      <Layout>
        <div className="container py-8">
          <EmptyState
            icon={<AlertCircle className="h-8 w-8 text-destructive" />}
            title="Error loading dashboard"
            description={error}
            action={<Button onClick={() => window.location.reload()}>Retry</Button>}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-foreground mb-2">My Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard title="Saved Properties" value={savedProperties.length} icon={Heart} variant="primary" />
          <StatCard title="Sent Inquiries" value={sentInquiries.length} icon={Send} />
          <StatCard title="Properties Viewed" value={viewedProperties.length} icon={Eye} />
        </div>

        <Tabs defaultValue="saved">
          <TabsList className="mb-6 flex-wrap">
            <TabsTrigger value="saved" className="gap-2"><Heart className="h-4 w-4" />Saved</TabsTrigger>
            <TabsTrigger value="viewed" className="gap-2"><Eye className="h-4 w-4" />Viewed</TabsTrigger>
            <TabsTrigger value="inquiries" className="gap-2"><MessageCircle className="h-4 w-4" />Inquiries</TabsTrigger>
            <TabsTrigger value="profile" className="gap-2"><Settings className="h-4 w-4" />Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="saved">
            {savedProperties.length === 0 ? (
              <EmptyState icon={<Heart className="h-8 w-8" />} title="No saved properties" description="Start exploring and save properties." action={<Link to="/properties"><Button>Browse Properties</Button></Link>} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedProperties.map((property) => <PropertyCard key={property.id} property={property} isSaved />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="viewed">
            {viewedProperties.length === 0 ? (
              <EmptyState icon={<Eye className="h-8 w-8" />} title="No viewed properties" description="Properties you view will appear here." action={<Link to="/properties"><Button>Browse Properties</Button></Link>} />
            ) : (
              <div className="space-y-4">
                {viewedProperties.map((view) => (
                  <Card key={view.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                          <ImageWithFallback src={view.propertyImage||"Mari"} alt={view.propertyTitle} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link to={`/property/${view.propertyId}`} className="font-medium hover:text-primary">{view.propertyTitle}</Link>
                          <p className="text-sm text-primary font-semibold mt-1">{formatPrice(view.propertyPrice||0)}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{view.propertyLocation}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(view.viewedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Link to={`/property/${view.propertyId}`}><Button variant="outline" size="sm">View</Button></Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="inquiries">
            {sentInquiries.length === 0 ? (
              <EmptyState icon={<MessageCircle className="h-8 w-8" />} title="No inquiries sent" description="Contact sellers to get more information." action={<Link to="/properties"><Button>Browse Properties</Button></Link>} />
            ) : (
              <div className="space-y-4">
                {sentInquiries.map((inquiry) => (
                  <Card key={inquiry.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <Link to={`/property/${inquiry.propertyId}`} className="font-medium hover:text-primary">{inquiry.propertyTitle}</Link>
                          <p className="text-sm text-muted-foreground mt-1">{inquiry.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">Sent {new Date(inquiry.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${inquiry.status === 'new' ? 'bg-warning/20 text-warning' : inquiry.status === 'contacted' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          {inquiry.status === 'new' ? 'Pending' : inquiry.status === 'contacted' ? 'Responded' : 'Closed'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Profile Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-sm text-muted-foreground">Name</p><p className="font-medium">{user?.name}</p></div>
                    <div><p className="text-sm text-muted-foreground">Email</p><p className="font-medium">{user?.email}</p></div>
                    <div><p className="text-sm text-muted-foreground">Phone</p><p className="font-medium">{user?.phone || 'Not provided'}</p></div>
                    <div><p className="text-sm text-muted-foreground">Account Type</p><p className="font-medium capitalize">{user?.role}</p></div>
                  </div>
                  {user?.role === 'user' && (
                    <div className="pt-4 border-t">
                      <p className="text-muted-foreground mb-4">Want to sell? Become a verified seller.</p>
                      <Link to="/seller/register"><Button className="gap-2"><Building2 className="h-4 w-4" />Become a Seller</Button></Link>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" />Change Password</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div><Label>Current Password</Label><Input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} required /></div>
                    <div><Label>New Password</Label><Input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} required /></div>
                    <div><Label>Confirm Password</Label><Input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} required /></div>
                    <Button type="submit" disabled={isChangingPassword}>{isChangingPassword ? 'Changing...' : 'Change Password'}</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default UserDashboard;

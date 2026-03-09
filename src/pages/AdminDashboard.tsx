import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import StatCard from '@/components/dashboard/StatCard';
import EmptyState from '@/components/common/EmptyState';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice } from '@/lib/formatters';
import * as adminService from '@/services/adminService';
import { useToast } from '@/hooks/use-toast';
import { Property, Seller, AppUser, UserActivity, PropertyReport, AdminStats, REPORT_STATUSES } from '@/types';
import {
  Users, Building2, Shield, AlertTriangle, CheckCircle, XCircle, Clock, BarChart3, UserCheck, Package, Eye, Phone, Mail, Ban, Activity, Flag, Trash2, Search, StopCircle, PlayCircle, AlertCircle,
} from 'lucide-react';

// Safe array helper
const ensureArray = <T,>(data: T[] | null | undefined): T[] => {
  return Array.isArray(data) ? data : [];
};

const AdminDashboardContent: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // API state - initialize with empty arrays
  const [stats, setStats] = useState<AdminStats>({ totalUsers: 0, totalSellers: 0, totalProperties: 0, pendingApprovals: 0, pendingSellerVerifications: 0, totalInquiries: 0, propertiesSold: 0, totalReports: 0, bannedUsers: 0 });
  const [users, setUsers] = useState<AppUser[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [reports, setReports] = useState<PropertyReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search states
  const [userSearch, setUserSearch] = useState('');
  const [sellerSearch, setSellerSearch] = useState('');
  const [propertySearch, setPropertySearch] = useState('');
  const [activitySearch, setActivitySearch] = useState('');
  const [reportSearch, setReportSearch] = useState('');
  
  // Dialog states
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showReportActionDialog, setShowReportActionDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<PropertyReport | null>(null);
  const [reportStatus, setReportStatus] = useState<string>('');
  const [reportNotes, setReportNotes] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [st, u, p, s, a, r] = await Promise.all([
          adminService.getAdminStats(),
          adminService.getUsers(),
          adminService.getAllProperties(),
          adminService.getSellers(),
          adminService.getActivities(),
          adminService.getReports(),
        ]);
        
        // Debug logging
        console.log('Admin Dashboard Data:', { stats: st, users: u, properties: p, sellers: s, activities: a, reports: r });
        
        setStats(st || { totalUsers: 0, totalSellers: 0, totalProperties: 0, pendingApprovals: 0, pendingSellerVerifications: 0, totalInquiries: 0, propertiesSold: 0, totalReports: 0, bannedUsers: 0 });
        setUsers(ensureArray(u));
        setProperties(ensureArray(p));
        setSellers(ensureArray(s));
        setActivities(ensureArray(a));
        setReports(ensureArray(r));
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Admin dashboard error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Filter functions with safe array handling
  const filteredUsers = useMemo(() => {
    const safeUsers = ensureArray(users);
    if (!userSearch) return safeUsers;
    const search = userSearch.toLowerCase();
    return safeUsers.filter(u => u.name?.toLowerCase().includes(search) || u.email?.toLowerCase().includes(search) || u.phone.includes(search));
  }, [users, userSearch]);

  const filteredSellers = useMemo(() => {
    const safeSellers = ensureArray(sellers);
    if (!sellerSearch) return safeSellers;
    const search = sellerSearch.toLowerCase();
    return safeSellers.filter(s => s.name?.toLowerCase().includes(search) || s.email?.toLowerCase().includes(search) || s.phone.includes(search));
  }, [sellers, sellerSearch]);

  const filteredProperties = useMemo(() => {
    const safeProperties = ensureArray(properties);
    if (!propertySearch) return safeProperties;
    const search = propertySearch.toLowerCase();
    return safeProperties.filter(p => p.title?.toLowerCase().includes(search) || p.location?.city?.toLowerCase().includes(search));
  }, [properties, propertySearch]);

  const filteredActivities = useMemo(() => {
    const safeActivities = ensureArray(activities);
    if (!activitySearch) return safeActivities;
    const search = activitySearch.toLowerCase();
    return safeActivities.filter(a => a.userName?.toLowerCase().includes(search) || a.action?.toLowerCase().includes(search));
  }, [activities, activitySearch]);

  const filteredReports = useMemo(() => {
    const safeReports = ensureArray(reports);
    if (!reportSearch) return safeReports;
    const search = reportSearch.toLowerCase();
    return safeReports.filter(r => r.propertyTitle?.toLowerCase().includes(search) || r.reason?.toLowerCase().includes(search));
  }, [reports, reportSearch]);

  const pendingProperties = ensureArray(properties).filter(p => p.status === 'pending');
  const pendingSellers = ensureArray(sellers).filter(s => s.status === 'pending');
  const pendingReports = ensureArray(reports).filter(r => r.status === 'pending');

  const handlePropertyAction = async (propertyId: string, action: 'approve' | 'reject' | 'suspend' | 'unsuspend') => {
    try {
      if (action === 'approve') await adminService.approveProperty(propertyId);
      else if (action === 'reject') await adminService.rejectProperty(propertyId);
      else if (action === 'suspend') await adminService.suspendProperty(propertyId);
      else if (action === 'unsuspend') await adminService.unsuspendProperty(propertyId);
      
      const newStatus = action === 'approve' || action === 'unsuspend' ? 'approved' : action === 'reject' ? 'rejected' : 'suspended';
      setProperties(prev => ensureArray(prev).map(p => p.id === propertyId ? { ...p, status: newStatus as Property['status'] } : p));
      toast({ title: 'Success', description: `Property ${action}d successfully` });
    } catch {
      toast({ title: 'Error', description: 'Failed to update property', variant: 'destructive' });
    }
  };

  const handleSellerAction = async (sellerId: string, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') await adminService.approveSeller(sellerId);
      else await adminService.rejectSeller(sellerId);
      
      setSellers(prev => ensureArray(prev).map(s => s.id === sellerId ? { ...s, status: action === 'approve' ? 'approved' : 'rejected', isVerified: action === 'approve' } : s));
      toast({ title: action === 'approve' ? 'Seller Verified' : 'Seller Rejected' });
    } catch {
      toast({ title: 'Error', description: 'Failed to update seller', variant: 'destructive' });
    }
  };

  const handleBanUser = (userId: string) => { setSelectedUserId(userId); setShowBanDialog(true); };

  const confirmBan = async () => {
    if (selectedUserId) {
      const userToBan = ensureArray(users).find(u => u.id === selectedUserId);
      try {
        await adminService.toggleUserBan(selectedUserId, userToBan?.status !== 'banned');
        setUsers(prev => ensureArray(prev).map(u => u.id === selectedUserId ? { ...u, status: u.status === 'banned' ? 'active' : 'banned' } : u));
        toast({ title: userToBan?.status === 'banned' ? 'User Unbanned' : 'User Banned' });
      } catch {
        toast({ title: 'Error', variant: 'destructive' });
      }
    }
    setShowBanDialog(false);
    setSelectedUserId(null);
  };

  const handleDeleteUser = (userId: string) => { setSelectedUserId(userId); setShowDeleteDialog(true); };

  const confirmDelete = async () => {
    if (selectedUserId) {
      try {
        await adminService.deleteUser(selectedUserId);
        setUsers(prev => ensureArray(prev).filter(u => u.id !== selectedUserId));
        toast({ title: 'User Deleted' });
      } catch {
        toast({ title: 'Error', variant: 'destructive' });
      }
    }
    setShowDeleteDialog(false);
    setSelectedUserId(null);
  };

  const handleReportAction = (report: PropertyReport) => {
    setSelectedReport(report);
    setReportStatus(report.status);
    setReportNotes(report.adminNotes || '');
    setShowReportActionDialog(true);
  };

  const handleSaveReportAction = async () => {
    if (selectedReport) {
      try {
        await adminService.updateReportStatus(selectedReport.id, reportStatus as PropertyReport['status'], reportNotes);
        setReports(prev => ensureArray(prev).map(r => r.id === selectedReport.id ? { ...r, status: reportStatus as PropertyReport['status'], adminNotes: reportNotes } : r));
        toast({ title: 'Report Updated' });
      } catch {
        toast({ title: 'Error', variant: 'destructive' });
      }
    }
    setShowReportActionDialog(false);
    setSelectedReport(null);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = { approved: 'default', pending: 'secondary', rejected: 'destructive', suspended: 'destructive' };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const SearchInput = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) => (
  <div className="relative mb-4">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <Input 
      placeholder={placeholder} 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      className="pl-10" 
      autoFocus // Optional: ensures it stays ready
    />
  </div>
);
  if (isLoading) return <Layout><DashboardSkeleton /></Layout>;

  if (error) {
    return (
      <Layout>
        <div className="container py-8">
          <EmptyState icon={<AlertCircle className="h-8 w-8 text-destructive" />} title="Error" description={error} action={<Button onClick={() => window.location.reload()}>Retry</Button>} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage the SafePlots platform.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
          <StatCard title="Total Users" value={stats.totalUsers} icon={Users} variant="primary" />
          <StatCard title="Total Sellers" value={stats.totalSellers} icon={UserCheck} />
          <StatCard title="Total Properties" value={stats.totalProperties} icon={Building2} />
          <StatCard title="Properties Sold" value={stats.propertiesSold} icon={Package} />
          <StatCard title="Reports" value={stats.totalReports} icon={Flag} />
        </div>

        {(pendingProperties.length > 0 || pendingSellers.length > 0 || pendingReports.length > 0) && (
          <Card className="mb-6 border-warning/50 bg-warning/10">
            <CardContent className="p-4 flex items-center gap-4">
              <AlertTriangle className="h-8 w-8 text-warning" />
              <div>
                <h3 className="font-semibold">Pending Actions Required</h3>
                <p className="text-sm text-muted-foreground">{pendingProperties.length} properties, {pendingSellers.length} sellers, and {pendingReports.length} reports awaiting review.</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="overview">
          <TabsList className="mb-6 flex-wrap">
            <TabsTrigger value="overview" className="gap-2"><BarChart3 className="h-4 w-4" />Overview</TabsTrigger>
            <TabsTrigger value="properties" className="gap-2">
              <Building2 className="h-4 w-4" />Properties
              {pendingProperties.length > 0 && <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">{pendingProperties.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="sellers" className="gap-2">
              <Shield className="h-4 w-4" />Sellers
              {pendingSellers.length > 0 && <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">{pendingSellers.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2"><Users className="h-4 w-4" />Users</TabsTrigger>
            <TabsTrigger value="activity" className="gap-2"><Activity className="h-4 w-4" />Activity</TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <Flag className="h-4 w-4" />Reports
              {pendingReports.length > 0 && <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">{pendingReports.length}</Badge>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" />Platform Statistics</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"><span className="text-muted-foreground">Total Inquiries</span><span className="font-semibold">{stats.totalInquiries}</span></div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"><span className="text-muted-foreground">Pending Approvals</span><span className="font-semibold text-warning">{pendingProperties.length}</span></div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"><span className="text-muted-foreground">Pending Sellers</span><span className="font-semibold text-warning">{pendingSellers.length}</span></div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"><span className="text-muted-foreground">Banned Users</span><span className="font-semibold text-destructive">{stats.bannedUsers}</span></div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-primary" />Recent Activity</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {ensureArray(activities).slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className={`h-2 w-2 rounded-full ${activity.action === 'login' ? 'bg-green-500' : 'bg-primary'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{activity.userName}</p>
                          <p className="text-xs text-muted-foreground">{activity.action?.replace('_', ' ')}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{new Date(activity.createdAt).toLocaleTimeString()}</span>
                      </div>
                    ))}
                    {ensureArray(activities).length === 0 && <p className="text-muted-foreground text-center py-4">No recent activity</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="properties">
            <SearchInput value={propertySearch} onChange={setPropertySearch} placeholder="Search properties..." />
            {filteredProperties.length === 0 ? <EmptyState icon={<Building2 className="h-8 w-8" />} title="No properties" description="No properties found" /> : (
              <div className="space-y-4">
                {filteredProperties.map((property) => (
                  <Card key={property.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                          <img src={ensureArray(property.images)[0] || '/placeholder.svg'} alt={property.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Link to={`/property/${property.id}`} className="font-medium hover:text-primary truncate">{property.title}</Link>
                            {getStatusBadge(property.status)}
                          </div>
                          <p className="text-sm text-primary">{formatPrice(property.price)}</p>
                          <p className="text-xs text-muted-foreground">{property.location?.city}, {property.location?.state} • {property.sellerName}</p>
                        </div>
                        <div className="flex gap-2">
                          {property.status === 'pending' && (
                            <>
                              <Button size="sm" onClick={() => handlePropertyAction(property.id, 'approve')}><CheckCircle className="h-4 w-4" /></Button>
                              <Button size="sm" variant="destructive" onClick={() => handlePropertyAction(property.id, 'reject')}><XCircle className="h-4 w-4" /></Button>
                            </>
                          )}
                          {property.status === 'approved' && <Button size="sm" variant="outline" onClick={() => handlePropertyAction(property.id, 'suspend')}><StopCircle className="h-4 w-4" /></Button>}
                          {property.status === 'suspended' && <Button size="sm" variant="outline" onClick={() => handlePropertyAction(property.id, 'unsuspend')}><PlayCircle className="h-4 w-4" /></Button>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sellers">
            <SearchInput value={sellerSearch} onChange={setSellerSearch} placeholder="Search sellers..." />
            {filteredSellers.length === 0 ? <EmptyState icon={<Shield className="h-8 w-8" />} title="No sellers" description="No sellers found" /> : (
              <div className="space-y-4">
                {filteredSellers.map((seller) => (
                  <Card key={seller.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Link to={`/admin/seller/${seller.id}`} className="font-medium hover:text-primary">{seller.name}</Link>
                            {getStatusBadge(seller.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{seller.email}</span>
                            <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{seller.phone}</span>
                          </div>
                        </div>
                        {seller.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleSellerAction(seller.id, 'approve')}><CheckCircle className="h-4 w-4" /></Button>
                            <Button size="sm" variant="destructive" onClick={() => handleSellerAction(seller.id, 'reject')}><XCircle className="h-4 w-4" /></Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="users">
            <SearchInput value={userSearch} onChange={setUserSearch} placeholder="Search users..." />
            {filteredUsers.length === 0 ? <EmptyState icon={<Users className="h-8 w-8" />} title="No users" description="No users found" /> : (
              <div className="space-y-4">
                {filteredUsers.map((u) => (
                  <Card key={u.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{u.name}</span>
                            <Badge variant={u.status === 'banned' ? 'destructive' : 'secondary'}>{u.status}</Badge>
                            <Badge variant="outline">{u.role}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{u.email}</p>
                          <p className="text-sm text-muted-foreground">{u.phone}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleBanUser(u.id)}><Ban className="h-4 w-4" /></Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(u.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity">
            <SearchInput value={activitySearch} onChange={setActivitySearch} placeholder="Search activity..." />
            {filteredActivities.length === 0 ? <EmptyState icon={<Activity className="h-8 w-8" />} title="No activity" description="No activity found" /> : (
              <div className="space-y-2">
                {filteredActivities.map((a) => (
                  <Card key={a.id}>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${a.action === 'login' ? 'bg-green-500' : 'bg-primary'}`} />
                        <div className="flex-1"><span className="font-medium">{a.userName}</span> <span className="text-muted-foreground">{a.action?.replace('_', ' ')}</span></div>
                        <span className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reports">
            <SearchInput value={reportSearch} onChange={setReportSearch} placeholder="Search reports..." />
            {filteredReports.length === 0 ? <EmptyState icon={<Flag className="h-8 w-8" />} title="No reports" description="No reports found" /> : (
              <div className="space-y-4">
                {filteredReports.map((r) => (
                  <Card key={r.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{r.propertyTitle}</span>
                            {getStatusBadge(r.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">Reason: {r.reason} • By: {r.reporterName}</p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleReportAction(r)}>Review</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Ban Dialog */}
      <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Ban/Unban User</DialogTitle><DialogDescription>Are you sure?</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBanDialog(false)}>Cancel</Button>
            <Button onClick={confirmBan}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete User</DialogTitle><DialogDescription>This cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Action Dialog */}
      <Dialog open={showReportActionDialog} onOpenChange={setShowReportActionDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Update Report</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Status</Label>
              <Select value={reportStatus} onValueChange={setReportStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{REPORT_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Admin Notes</Label>
              <Textarea value={reportNotes} onChange={(e) => setReportNotes(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportActionDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveReportAction}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

// Wrap with ErrorBoundary
const AdminDashboard: React.FC = () => (
  <ErrorBoundary>
    <AdminDashboardContent />
  </ErrorBoundary>
);

export default AdminDashboard;
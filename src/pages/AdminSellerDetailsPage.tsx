import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';
import EmptyState from '@/components/common/EmptyState';
import { useToast } from '@/hooks/use-toast';
import { formatPrice, getPropertyTypeLabel } from '@/lib/formatters';
import { getSellerDetails, approveSeller, rejectSeller } from '@/services/adminService';
import { getPropertiesBySeller } from '@/services/propertyService';
import { approveProperty, rejectProperty } from '@/services/adminService';
import ImageWithFallback from '@/components/common/ImageWithFallback';
import { Seller, Property } from '@/types';
import {
  ArrowLeft, User, Mail, Phone, Calendar, Shield, Building2, FileText, Download, Eye, CheckCircle, XCircle, Clock, ExternalLink, AlertTriangle, Edit, Ban, AlertCircle,
} from 'lucide-react';

const AdminSellerDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // API state
  const [seller, setSeller] = useState<Seller | null>(null);
  const [sellerProperties, setSellerProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [sellerStatus, setSellerStatus] = useState<string>('pending');
  
  // Property action states
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [showPropertyApproveDialog, setShowPropertyApproveDialog] = useState(false);
  const [showPropertyRejectDialog, setShowPropertyRejectDialog] = useState(false);
  const [propertyStatuses, setPropertyStatuses] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const [sellerData, propertiesData] = await Promise.all([
          getSellerDetails(id),
          getPropertiesBySeller(id),
        ]);
        
        if (!sellerData) {
          setError('Seller not found');
          return;
        }
        
        // Ensure properties is always an array
        const safeProperties = Array.isArray(propertiesData) ? propertiesData : [];
        
        console.log('Seller data:', sellerData);
        console.log('Properties data:', safeProperties);
        
        setSeller(sellerData);
        setSellerProperties(safeProperties);
        setSellerStatus(sellerData.status);
        setPropertyStatuses(Object.fromEntries(safeProperties.map(p => [p.id, p.status])));
      } catch (err) {
        setError('Failed to load seller details');
        console.error('Seller details error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [id]);

  if (isLoading) return <Layout><DashboardSkeleton /></Layout>;

  if (error || !seller) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <EmptyState
            icon={<AlertCircle className="h-8 w-8 text-destructive" />}
            title="Seller Not Found"
            description={error || "This seller doesn't exist."}
            action={<Link to="/admin"><Button variant="outline">Back to Dashboard</Button></Link>}
          />
        </div>
      </Layout>
    );
  }

  const pendingProperties = sellerProperties.filter(p => propertyStatuses[p.id] === 'pending');
  const approvedProperties = sellerProperties.filter(p => propertyStatuses[p.id] === 'approved');
  const soldProperties = sellerProperties.filter(p => propertyStatuses[p.id] === 'sold');

  const handleApproveSeller = async () => {
    try {
      await approveSeller(seller.id);
      setSellerStatus('approved');
      toast({ title: 'Seller Verified', description: `${seller.name} has been verified successfully.` });
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    }
    setShowApproveDialog(false);
  };

  const handleRejectSeller = async () => {
    try {
      await rejectSeller(seller.id);
      setSellerStatus('rejected');
      toast({ title: 'Seller Rejected', description: `${seller.name}'s application has been rejected.` });
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    }
    setShowRejectDialog(false);
  };

  const handleApproveProperty = async () => {
    if (selectedPropertyId) {
      try {
        await approveProperty(selectedPropertyId);
        setPropertyStatuses(prev => ({ ...prev, [selectedPropertyId]: 'approved' }));
        toast({ title: 'Property Approved' });
      } catch {
        toast({ title: 'Error', variant: 'destructive' });
      }
    }
    setShowPropertyApproveDialog(false);
    setSelectedPropertyId(null);
  };

  const handleRejectProperty = async () => {
    if (selectedPropertyId) {
      try {
        await rejectProperty(selectedPropertyId);
        setPropertyStatuses(prev => ({ ...prev, [selectedPropertyId]: 'rejected' }));
        toast({ title: 'Property Rejected' });
      } catch {
        toast({ title: 'Error', variant: 'destructive' });
      }
    }
    setShowPropertyRejectDialog(false);
    setSelectedPropertyId(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>;
      case 'pending': return <Badge variant="secondary" className="bg-warning text-warning-foreground"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'rejected': return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'banned': return <Badge variant="destructive"><Ban className="h-3 w-3 mr-1" />Banned</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPropertyStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge className="bg-green-500">Live</Badge>;
      case 'pending': return <Badge variant="secondary" className="bg-warning text-warning-foreground">Pending</Badge>;
      case 'sold': return <Badge variant="secondary">Sold</Badge>;
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

// Safe array helper
const ensureArray = <T,>(data: T[] | null | undefined): T[] => Array.isArray(data) ? data : [];

const PropertyRow = ({ property, status, onApprove, onReject }: { property: Property; status: string; onApprove?: () => void; onReject?: () => void }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="w-24 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
            <img src={ensureArray(property.images)[0] || '/placeholder.svg'} alt={property.title} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Link to={`/property/${property.id}`} className="font-medium hover:text-primary truncate">{property.title}</Link>
              {getPropertyStatusBadge(status)}
            </div>
            <p className="text-sm text-primary">{formatPrice(property.price)}</p>
            <p className="text-xs text-muted-foreground">{property.location?.city}, {property.location?.state}</p>
          </div>
          {status === 'pending' && onApprove && onReject && (
            <div className="flex gap-2">
              <Button size="sm" onClick={onApprove}><CheckCircle className="h-4 w-4" /></Button>
              <Button size="sm" variant="destructive" onClick={onReject}><XCircle className="h-4 w-4" /></Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="bg-muted/50 py-4 border-b border-border">
        <div className="container">
          <Link to="/admin" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />Back to Admin Dashboard
          </Link>
        </div>
      </div>

      <div className="container py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold flex items-center gap-3">{seller.name}{getStatusBadge(sellerStatus)}</h1>
              <p className="text-muted-foreground">Seller ID: {seller.id}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {sellerStatus === 'pending' && (
              <>
                <Button variant="outline" className="text-destructive" onClick={() => setShowRejectDialog(true)}><XCircle className="h-4 w-4 mr-2" />Reject</Button>
                <Button onClick={() => setShowApproveDialog(true)}><CheckCircle className="h-4 w-4 mr-2" />Approve</Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-lg">Contact Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3"><Mail className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">Email</p><p className="font-medium">{seller.email}</p></div></div>
                <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">Phone</p><p className="font-medium">{seller.phone}</p></div></div>
                <div className="flex items-center gap-3"><Calendar className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">Joined</p><p className="font-medium">{new Date(seller.createdAt).toLocaleDateString()}</p></div></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Statistics</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"><span className="text-muted-foreground">Total Properties</span><span className="font-semibold">{sellerProperties.length}</span></div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"><span className="text-muted-foreground">Properties Sold</span><span className="font-semibold">{seller.totalSold}</span></div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"><span className="text-muted-foreground">Rating</span><span className="font-semibold">{seller.rating > 0 ? `${seller.rating} / 5` : 'N/A'}</span></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5" />ID Verification</CardTitle>
                <CardDescription>{seller.idProofType.toUpperCase()}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="uppercase">{seller.idProofType}</Badge>
                    {sellerStatus === 'approved' && <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild><a href={seller.idProofUrl} target="_blank" rel="noopener noreferrer"><Eye className="h-4 w-4 mr-2" />View</a></Button>
                    <Button variant="outline" size="sm" className="flex-1" asChild><a href={seller.idProofUrl} download><Download className="h-4 w-4 mr-2" />Download</a></Button>
                  </div>
                </div>
                {sellerStatus === 'pending' && (
                  <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg">
                    <p className="text-sm text-warning flex items-center gap-2"><AlertTriangle className="h-4 w-4" />Review document before approving</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" />Seller Properties</CardTitle>
                <CardDescription>{sellerProperties.length} total • {pendingProperties.length} pending</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all">
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">All ({sellerProperties.length})</TabsTrigger>
                    <TabsTrigger value="pending" className="gap-1">Pending{pendingProperties.length > 0 && <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">{pendingProperties.length}</Badge>}</TabsTrigger>
                    <TabsTrigger value="live">Live ({approvedProperties.length})</TabsTrigger>
                    <TabsTrigger value="sold">Sold ({soldProperties.length})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="space-y-4">
                    {sellerProperties.length === 0 ? <p className="text-center py-8 text-muted-foreground">No properties</p> : sellerProperties.map((p) => (
                      <PropertyRow key={p.id} property={p} status={propertyStatuses[p.id]} onApprove={() => { setSelectedPropertyId(p.id); setShowPropertyApproveDialog(true); }} onReject={() => { setSelectedPropertyId(p.id); setShowPropertyRejectDialog(true); }} />
                    ))}
                  </TabsContent>

                  <TabsContent value="pending" className="space-y-4">
                    {pendingProperties.length === 0 ? <p className="text-center py-8 text-muted-foreground">No pending properties</p> : pendingProperties.map((p) => (
                      <PropertyRow key={p.id} property={p} status={propertyStatuses[p.id]} onApprove={() => { setSelectedPropertyId(p.id); setShowPropertyApproveDialog(true); }} onReject={() => { setSelectedPropertyId(p.id); setShowPropertyRejectDialog(true); }} />
                    ))}
                  </TabsContent>

                  <TabsContent value="live" className="space-y-4">
                    {approvedProperties.length === 0 ? <p className="text-center py-8 text-muted-foreground">No live properties</p> : approvedProperties.map((p) => <PropertyRow key={p.id} property={p} status={propertyStatuses[p.id]} />)}
                  </TabsContent>

                  <TabsContent value="sold" className="space-y-4">
                    {soldProperties.length === 0 ? <p className="text-center py-8 text-muted-foreground">No sold properties</p> : soldProperties.map((p) => <PropertyRow key={p.id} property={p} status={propertyStatuses[p.id]} />)}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Approve Seller Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Approve Seller</DialogTitle><DialogDescription>Verify this seller to allow them to list properties.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>Cancel</Button>
            <Button onClick={handleApproveSeller}>Approve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Seller Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject Seller</DialogTitle><DialogDescription>Reject this seller's application.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRejectSeller}>Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Property Dialog */}
      <Dialog open={showPropertyApproveDialog} onOpenChange={setShowPropertyApproveDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Approve Property</DialogTitle><DialogDescription>Make this property live.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPropertyApproveDialog(false)}>Cancel</Button>
            <Button onClick={handleApproveProperty}>Approve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Property Dialog */}
      <Dialog open={showPropertyRejectDialog} onOpenChange={setShowPropertyRejectDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject Property</DialogTitle><DialogDescription>Reject this property listing.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPropertyRejectDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRejectProperty}>Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default AdminSellerDetailsPage;
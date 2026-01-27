import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import StatCard from '@/components/dashboard/StatCard';
import PropertyCard from '@/components/property/PropertyCard';
import EmptyState from '@/components/common/EmptyState';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice } from '@/lib/formatters';
import { getSellerProperties, getSellerInquiries, getSellerStats, updateInquiryStatus } from '@/services/sellerService';
import { createProperty, updateProperty, deleteProperty, updatePropertyStatus } from '@/services/propertyService';
import { uploadPropertyMedia } from '@/lib/firebase';
import { Property, Inquiry, SellerStats, PROPERTY_TYPES, AREA_UNITS, INDIAN_STATES } from '@/types';
import { useToast } from '@/hooks/use-toast';
import {
  Building2, Plus, MessageCircle, Eye, TrendingUp, Clock, CheckCircle, Package, Upload, Phone, Mail, User, MapPin, IndianRupee, Ruler, Edit, Trash2, Tag, AlertCircle, X, Video, Image, Navigation,
} from 'lucide-react';

const AMENITIES_OPTIONS = [
  // Basic Infrastructure
  '24/7 Water Supply', 'Electricity Connection', 'Power Backup', 'Piped Gas',
  'Drainage System', 'Waste Management', 'Street Lighting', 'Fiber Internet (FTTH)',
  
  // Security & Boundary
  'Gated Community', 'Security Guards', 'CCTV Surveillance', 'Boundary Wall', 
  'Intercom Facility', 'Fire Safety System',
  
  // Lifestyle & Recreation
  'Club House', 'Gymnasium', 'Swimming Pool', 'Kids Play Area', 'Yoga/Meditation Deck',
  'Jogging Track', 'Park/Green Belt', 'Community Hall', 'Sports Court (Tennis/BB)',
  
  // Convenience
  'Ample Parking', 'Visitor Parking', 'Elevators', 'Retail Shops On-site', 
  'EV Charging Station', 'Rainwater Harvesting', 'Solar Lighting'
];

const FEATURES_OPTIONS = [
  // Direction & Vastu
  'East Facing', 'West Facing', 'North Facing', 'South Facing', 'North-East Facing', 
  'Corner Plot', 'Vastu Compliant',
  
  // Connectivity & Location
  'Main Road Facing', 'Near Highway', 'Near Metro Station', 'Near Railway Station', 
  'Near School', 'Near Hospital', 'Near Shopping Mall', 'Airport Connectivity',
  
  // Land & Zoning
  'Residential Zone', 'Commercial Zone', 'Industrial Zone', 'Agricultural Land',
  'Institutional Land', 'Mixed Use Development', 'Conversion Potential',
  
  // Physical Attributes
  'Level Land', 'Hilly Terrain', 'Waterfront/Lake View', 'Lush Green Surroundings',
  'Quiet Neighborhood', 'Developed Area', 'Upcoming Infrastructure Project'
];

const SellerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  
  // API state
  const [properties, setProperties] = useState<Property[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [stats, setStats] = useState<SellerStats>({ totalProperties: 0, liveProperties: 0, pendingProperties: 0, soldProperties: 0, totalInquiries: 0, newInquiries: 0, totalViews: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state with all fields including latitude, longitude, amenities, features
  const [propertyForm, setPropertyForm] = useState({
    id: '', title: '', description: '', type: '', price: '', priceOnRequest: false,
    area: '', areaUnit: 'sqft', address: '', city: '', state: '', pincode: '',
    latitude: '2.5', longitude: '2.5', amenities: [] as string[], features: [] as string[]
  });
  const [images, setImages] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  
  // Dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSoldDialog, setShowSoldDialog] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  // Inside SellerDashboard component
const formRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [props, inqs, st] = await Promise.all([getSellerProperties(), getSellerInquiries(), getSellerStats()]);
        setProperties(props);
        setInquiries(inqs);
        setStats(st);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const liveProperties = properties.filter(p => p.status === 'approved');
  const pendingProperties = properties.filter(p => p.status === 'pending');
  const soldProperties = properties.filter(p => p.status === 'sold');
  const newInquiries = inquiries.filter(i => i.status === 'new');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPropertyForm(prev => ({ ...prev, [name]: value }));
  };

  const scrollToForm = () => {
  // Small timeout ensures the Tab content has rendered before scrolling
  setTimeout(() => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
};

  const handleSelectChange = (name: string, value: string) => {
    setPropertyForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setPropertyForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleFeatureToggle = (feature: string) => {
    setPropertyForm(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };





  const handleEditProperty = (property: Property) => {
    setPropertyForm({
      id: property.id, title: property.title, description: property.description, type: property.type,
      price: property.price > 0 ? property.price.toString() : '', priceOnRequest: property.price === 0,
      area: property.area.toString(), areaUnit: property.areaUnit, address: property.location.address,
      city: property.location.city, state: property.location.state, pincode: property.location.pincode,
      latitude: property.location.coordinates?.lat?.toString() || '',
      longitude: property.location.coordinates?.lng?.toString() || '',
      amenities: property.amenities || [],
      features: property.features || [],
    });
    setIsEditing(true);
    setActiveTab('add-property');
  };

  const handleDeleteProperty = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (selectedPropertyId) {
      try {
        await deleteProperty(selectedPropertyId);
        setProperties(prev => prev.filter(p => p.id !== selectedPropertyId));
        toast({ title: 'Property Deleted', description: 'The property has been removed.' });
      } catch {
        toast({ title: 'Error', description: 'Failed to delete property.', variant: 'destructive' });
      }
    }
    setShowDeleteDialog(false);
    setSelectedPropertyId(null);
  };

  const handleMarkSold = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    setShowSoldDialog(true);
  };

  const confirmSold = async () => {
    if (selectedPropertyId) {
      try {
        await updatePropertyStatus(selectedPropertyId, 'sold');
        setProperties(prev => prev.map(p => p.id === selectedPropertyId ? { ...p, status: 'sold' as const } : p));
        toast({ title: 'Property Marked as Sold', description: 'Congratulations on your sale!' });
      } catch {
        toast({ title: 'Error', description: 'Failed to update property.', variant: 'destructive' });
      }
    }
    setShowSoldDialog(false);
    setSelectedPropertyId(null);
  };

  const validateForm = (): boolean => {
    if (!propertyForm.title.trim()) {
      toast({ title: 'Validation Error', description: 'Property title is required', variant: 'destructive' });
      return false;
    }
    if (!propertyForm.type) {
      toast({ title: 'Validation Error', description: 'Property type is required', variant: 'destructive' });
      return false;
    }
    if (!propertyForm.area) {
      toast({ title: 'Validation Error', description: 'Area is required', variant: 'destructive' });
      return false;
    }
    
    if (!propertyForm.address.trim() || !propertyForm.city.trim() || !propertyForm.state || !propertyForm.pincode.trim()) {
      toast({ title: 'Validation Error', description: 'Complete address is required', variant: 'destructive' });
      return false;
    }
  
    if (propertyForm.amenities.length === 0) {
      toast({ title: 'Validation Error', description: 'Select at least one amenity', variant: 'destructive' });
      return false;
    }
    if (propertyForm.features.length === 0) {
      toast({ title: 'Validation Error', description: 'Select at least one feature', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const handleSubmitProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // Upload images and video to Firebase
      let imageUrls: string[] = [];
      let videoUrl: string | undefined;

      if (images.length > 0) {
        const tempPropertyId = propertyForm.id || `temp_${Date.now()}`;
        const allFiles = video ? [...images, video] : images;
        const totalFiles = allFiles.length;
        let uploadedCount = 0;

        const urls = await uploadPropertyMedia(allFiles, tempPropertyId, (fileIndex, progress) => {
          if (progress.progress === 100) {
            uploadedCount++;
            setUploadProgress(Math.round((uploadedCount / totalFiles) * 100));
          }
        });

        // Separate image and video URLs
        if (video) {
          videoUrl = urls[urls.length - 1];
          imageUrls = urls.slice(0, -1);
        } else {
          imageUrls = urls;
        }
      }

      const data = {
        title: propertyForm.title,
        description: propertyForm.description,
        type: propertyForm.type as Property['type'],
        price: propertyForm.priceOnRequest ? 0 : Number(propertyForm.price),
        priceOnRequest: propertyForm.priceOnRequest,
        area: Number(propertyForm.area),
        areaUnit: propertyForm.areaUnit as Property['areaUnit'],
        address: propertyForm.address,
        city: propertyForm.city,
        state: propertyForm.state,
        pincode: propertyForm.pincode,
        latitude: Number(propertyForm.latitude),
        longitude: Number(propertyForm.longitude),
        amenities: propertyForm.amenities,
        features: propertyForm.features,
        images: imageUrls.length > 0 ? imageUrls : undefined,
        video: videoUrl,
      };

      if (isEditing) {
        await updateProperty(propertyForm.id, data);
        toast({ title: 'Property Updated', description: 'Your changes require admin approval.' });
      } else {
        await createProperty(data);
        toast({ title: 'Property Submitted', description: 'Your property is under review.' });
      }

      // Reload properties
      const props = await getSellerProperties();
      setProperties(props);
      
      // Reset form
      resetForm();
      setActiveTab('properties');
    } catch {
      toast({ title: 'Error', description: 'Failed to save property.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setPropertyForm({
      id: '', title: '', description: '', type: '', price: '', priceOnRequest: false,
      area: '', areaUnit: 'sqft', address: '', city: '', state: '', pincode: '',
      latitude: '', longitude: '', amenities: [], features: []
    });
    // Revoke all preview URLs
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setImages([]);
    setImagePreviews([]);
    setVideo(null);
    setVideoPreview(null);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    resetForm();
    setActiveTab('properties');
  };

  const handleInquiryAction = async (inquiryId: string, action: 'contacted' | 'closed') => {
    try {
      await updateInquiryStatus(inquiryId, action);
      setInquiries(prev => prev.map(i => i.id === inquiryId ? { ...i, status: action } : i));
      toast({ title: action === 'contacted' ? 'Marked as Contacted' : 'Inquiry Closed' });
    } catch {
      toast({ title: 'Error', description: 'Failed to update inquiry.', variant: 'destructive' });
    }
  };

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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Seller Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.name}!</p>
          </div>
          <Button onClick={() => { resetForm(); setActiveTab('add-property'); scrollToForm(); }} className="gap-2">
            <Plus className="h-4 w-4" />Add New Property
          </Button>
        </div>

        {!user?.isVerified && (
          <Card className="mb-6 border-warning/50 bg-warning/10">
            <CardContent className="p-4 flex items-center gap-4">
              <Clock className="h-8 w-8 text-warning" />
              <div>
                <h3 className="font-semibold">Verification Pending</h3>
                <p className="text-sm text-muted-foreground">Your account is under review. Properties will be published after verification.</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard title="Total Properties" value={properties.length} icon={Building2} variant="primary" />
          <StatCard title="Live Properties" value={liveProperties.length} icon={CheckCircle} />
          <StatCard title="Sold Properties" value={soldProperties.length} icon={Package} />
          <StatCard title="New Inquiries" value={newInquiries.length} icon={MessageCircle} variant="primary" />
          <StatCard title="Total Views" value={stats.totalViews} icon={Eye} />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex-wrap">
            <TabsTrigger value="overview" className="gap-2"><TrendingUp className="h-4 w-4" />Overview</TabsTrigger>
            <TabsTrigger value="properties" className="gap-2"><Building2 className="h-4 w-4" />Properties</TabsTrigger>
            <TabsTrigger value="inquiries" className="gap-2">
              <MessageCircle className="h-4 w-4" />Inquiries
              {newInquiries.length > 0 && <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">{newInquiries.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="add-property" className="gap-2"><Plus className="h-4 w-4" />{isEditing ? 'Edit' : 'Add'} Property</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><MessageCircle className="h-5 w-5 text-primary" />Recent Inquiries</CardTitle></CardHeader>
                <CardContent>
                  {inquiries.length === 0 ? <p className="text-muted-foreground text-center py-4">No inquiries yet</p> : (
                    <div className="space-y-4">
                      {inquiries.slice(0, 3).map((inquiry) => (
                        <div key={inquiry.id} className="border rounded-lg p-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{inquiry.buyerName}</p>
                              <p className="text-sm text-muted-foreground truncate">{inquiry.propertyTitle}</p>
                            </div>
                            <Badge variant={inquiry.status === 'new' ? 'default' : 'secondary'}>{inquiry.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" />Property Performance</CardTitle></CardHeader>
                <CardContent>
                  {liveProperties.length === 0 ? <p className="text-muted-foreground text-center py-4">No live properties</p> : (
                    <div className="space-y-4">
                      {liveProperties.slice(0, 3).map((property) => (
                        <div key={property.id} className="flex items-center justify-between border rounded-lg p-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{property.title}</p>
                            <p className="text-sm text-primary">{formatPrice(property.price||0)}</p>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{property.views}</span>
                            <span className="flex items-center gap-1"><MessageCircle className="h-4 w-4" />{property.inquiries}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="properties">
            {properties.length === 0 ? (
              <EmptyState icon={<Building2 className="h-8 w-8" />} title="No properties" description="Add your first property" action={<Button onClick={() => setActiveTab('add-property')} className="gap-2"><Plus className="h-4 w-4" />Add Property</Button>} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <div key={property.id} className="relative">
                    <PropertyCard property={property} showStatus />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button size="icon-sm" variant="secondary" onClick={() => handleEditProperty(property)}><Edit className="h-3 w-3" /></Button>
                      {property.status === 'approved' && <Button size="icon-sm" variant="secondary" onClick={() => handleMarkSold(property.id)}><Tag className="h-3 w-3" /></Button>}
                      <Button size="icon-sm" variant="destructive" onClick={() => handleDeleteProperty(property.id)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="inquiries">
            {inquiries.length === 0 ? (
              <EmptyState icon={<MessageCircle className="h-8 w-8" />} title="No inquiries" description="Inquiries will appear here" />
            ) : (
              <div className="space-y-4">
                {inquiries.map((inquiry) => (
                  <Card key={inquiry.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">{inquiry.buyerName}</span>
                            <Badge variant={inquiry.status === 'new' ? 'default' : 'secondary'}>{inquiry.status}</Badge>
                          </div>
                          <Link to={`/property/${inquiry.propertyId}`} className="text-sm text-primary hover:underline">{inquiry.propertyTitle}</Link>
                          <p className="text-sm text-muted-foreground mt-2">{inquiry.message}</p>
                          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                            {inquiry.buyerPhone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{inquiry.buyerPhone}</span>}
                            <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{inquiry.buyerEmail}</span>
                          </div>
                        </div>
                        {inquiry.status === 'new' && (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleInquiryAction(inquiry.id, 'contacted')}>Mark Contacted</Button>
                            <Button size="sm" variant="outline" onClick={() => handleInquiryAction(inquiry.id, 'closed')}>Close</Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="add-property">
            <div ref={formRef} className="scroll-mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{isEditing ? 'Edit Property' : 'Add New Property'}</CardTitle>
                <CardDescription>{isEditing ? 'Update your property details' : 'Fill in the details to list your property'}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitProperty} className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="title">Property Title *</Label>
                      <Input id="title" name="title" value={propertyForm.title} onChange={handleInputChange} placeholder="e.g., 2 Acre Agricultural Land near Highway" />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea id="description" name="description" value={propertyForm.description} onChange={handleInputChange} rows={4} placeholder="Describe your property in detail..." />
                    </div>
                    <div>
                      <Label>Property Type *</Label>
                      <Select value={propertyForm.type} onValueChange={(v) => handleSelectChange('type', v)}>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>{PROPERTY_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="price">Price (₹)</Label>
                      <Input id="price" name="price" type="number" value={propertyForm.price} onChange={handleInputChange} disabled={propertyForm.priceOnRequest} placeholder="Enter price" />
                      <div className="flex items-center gap-2 mt-2">
                        <Checkbox id="priceOnRequest" checked={propertyForm.priceOnRequest} onCheckedChange={(c) => setPropertyForm(prev => ({ ...prev, priceOnRequest: !!c }))} />
                        <Label htmlFor="priceOnRequest" className="text-sm">Price on Request</Label>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="area">Area *</Label>
                      <Input id="area" name="area" type="number" value={propertyForm.area} onChange={handleInputChange} placeholder="Enter area" />
                    </div>
                    <div>
                      <Label>Area Unit</Label>
                      <Select value={propertyForm.areaUnit} onValueChange={(v) => handleSelectChange('areaUnit', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{AREA_UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2"><MapPin className="h-4 w-4" />Location Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor="address">Address *</Label>
                        <Input id="address" name="address" value={propertyForm.address} onChange={handleInputChange} placeholder="Street address" />
                      </div>
                      <div>
                        <Label htmlFor="city">District *</Label>
                        <Input id="city" name="city" value={propertyForm.city} onChange={handleInputChange} placeholder="City" />
                      </div>
                      <div>
                        <Label>State *</Label>
                        <Select value={propertyForm.state} onValueChange={(v) => handleSelectChange('state', v)}>
                          <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                          <SelectContent>{INDIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="pincode">Pincode *</Label>
                        <Input id="pincode" name="pincode" value={propertyForm.pincode} onChange={handleInputChange} placeholder="6-digit pincode" />
                      </div>
                    </div>
                    
                    {/* Coordinates */}
                    

                    <p className="text-xs text-muted-foreground">You can get coordinates from Google Maps by right-clicking on a location</p>
                  </div>

                  {/* Amenities */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Amenities * (Select at least one)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {AMENITIES_OPTIONS.map((amenity) => (
                        <div key={amenity} className="flex items-center gap-2">
                          <Checkbox
                            id={`amenity-${amenity}`}
                            checked={propertyForm.amenities.includes(amenity)}
                            onCheckedChange={() => handleAmenityToggle(amenity)}
                          />
                          <Label htmlFor={`amenity-${amenity}`} className="text-sm cursor-pointer">{amenity}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Features * (Select at least one)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {FEATURES_OPTIONS.map((feature) => (
                        <div key={feature} className="flex items-center gap-2">
                          <Checkbox
                            id={`feature-${feature}`}
                            checked={propertyForm.features.includes(feature)}
                            onCheckedChange={() => handleFeatureToggle(feature)}
                          />
                          <Label htmlFor={`feature-${feature}`} className="text-sm cursor-pointer">{feature}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Media Upload Section */}
<div className="space-y-4 border-t pt-6">
  <h3 className="font-semibold flex items-center gap-2">
    <Image className="h-4 w-4" /> Property Images
  </h3>
  
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <Label>Upload Photos ({images.length}/10)</Label>
      {images.length >= 10 && (
        <span className="text-xs text-destructive font-medium">Maximum limit reached</span>
      )}
    </div>

    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-2">
      {/* Existing Previews */}
      {imagePreviews.map((url, index) => (
        <div key={index} className="relative aspect-square rounded-md overflow-hidden border bg-muted">
          <img src={url} alt={`Property ${index + 1}`} className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => {
              setImages(prev => prev.filter((_, i) => i !== index));
              setImagePreviews(prev => {
                const newPreviews = prev.filter((_, i) => i !== index);
                URL.revokeObjectURL(prev[index]); // Clean up memory
                return newPreviews;
              });
            }}
            className="absolute top-1 right-1 bg-destructive hover:bg-destructive/90 text-white rounded-full p-1 shadow-md transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}

      {/* Upload Button - Hidden when limit is 10 */}
      {images.length < 10 && (
        <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-md cursor-pointer hover:bg-muted hover:border-primary/50 transition-all">
          <Upload className="h-6 w-6 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground mt-1">Add Photo</span>
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) {
                const newFiles = Array.from(e.target.files);
                const currentCount = images.length;
                const limit = 10;
                
                // Calculate how many more we can take
                if (currentCount + newFiles.length > limit) {
                  toast({
                    title: "Limit Exceeded",
                    description: `You can only upload up to ${limit} images.`,
                    variant: "destructive",
                  });
                }

                // Take only the files that fit within the 10-image limit
                const allowedFiles = newFiles.slice(0, limit - currentCount);
                
                setImages(prev => [...prev, ...allowedFiles]);
                setImagePreviews(prev => [
                  ...prev, 
                  ...allowedFiles.map(f => URL.createObjectURL(f))
                ]);
              }
            }}
          />
        </label>
      )}
    </div>
    <p className="text-xs text-muted-foreground">
      Upload 1 to 10 high-quality images. The first image will be used as the cover.
    </p>
  </div>
</div>
                  <div className="flex gap-4 pt-4">
                    <Button type="submit" disabled={isSubmitting} className="gap-2">
                      {isSubmitting ? (
                        <>Uploading... ({uploadProgress}%)</>
                      ) : isEditing ? (
                        'Update Property'
                      ) : (
                        'Submit Property'
                      )}
                    </Button>
                    {isEditing && <Button type="button" variant="outline" onClick={handleCancelEdit}>Cancel</Button>}
                  </div>
                </form>
              </CardContent>
            </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Property</DialogTitle><DialogDescription>This action cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark Sold Dialog */}
      <Dialog open={showSoldDialog} onOpenChange={setShowSoldDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Mark as Sold</DialogTitle><DialogDescription>Mark this property as sold?</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSoldDialog(false)}>Cancel</Button>
            <Button onClick={confirmSold}>Mark as Sold</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default SellerDashboard;

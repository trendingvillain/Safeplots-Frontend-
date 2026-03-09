import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import PropertyDetailsSkeleton from '@/components/property/PropertyDetailsSkeleton';
import ImageWithFallback from '@/components/common/ImageWithFallback';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import { formatPrice, formatArea, getPropertyTypeLabel } from '@/lib/formatters';
import { getPropertyById, getPropertiesBySeller, sendInquiry, reportProperty, trackPropertyView } from '@/services/propertyService';
import { saveProperty, unsaveProperty, getSavedProperties } from '@/services/userService';
import { Property, REPORT_REASONS } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useAnalytics } from '@/hooks/useAnalytics';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Heart,
  Share2,
  Phone,
  MessageCircle,
  CheckCircle2,
  Eye,
  Calendar,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  User,
  Shield,
  Flag,
  Building2,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const PropertyDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const { trackPropertyView: analyticsTrackView, trackInquirySent, trackPropertySaved, trackPropertyUnsaved, trackPropertyReported, trackSellerContacted } = useAnalytics();
  
  // API state
  const [property, setProperty] = useState<Property | null>(null);
  const [sellerProperties, setSellerProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [isSendingInquiry, setIsSendingInquiry] = useState(false);
  
  // Report dialog state
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showReportConfirm, setShowReportConfirm] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  
  // Unsave confirm dialog
  const [showUnsaveConfirm, setShowUnsaveConfirm] = useState(false);

  // Share state
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Load property data
  useEffect(() => {
    const loadProperty = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const prop = await getPropertyById(id);
        if (!prop) {
          setError('Property not found');
          return;
        }
        
        setProperty(prop);

        document.title = `${prop.title} | SafePlots`;
        
        // Track view in analytics and API
        analyticsTrackView(id, prop.title);
        trackPropertyView(id); // This increments the view count on the backend
        
        // Load seller's other properties
        const otherProps = await getPropertiesBySeller(prop.sellerId);
        setSellerProperties(otherProps.filter(p => p.id !== id && p.status === 'approved'));
        
        // Check if saved
        if (isAuthenticated) {
          const saved = await getSavedProperties();
          setIsSaved(saved.some(p => p.id === id));
        }
      } catch (err) {
        setError('Failed to load property');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProperty();
    return () => {
      document.title = 'SafePlots - Buy Verified Plots & Homes';
    };
  }, [id, isAuthenticated, analyticsTrackView]);

  if (isLoading) {
    return <Layout><PropertyDetailsSkeleton /></Layout>;
  }
  
  if (error || !property) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <EmptyState
            icon={<AlertCircle className="h-8 w-8 text-destructive" />}
            title="Property Not Found"
            description={error || "This property doesn't exist or has been removed."}
            action={<Link to="/properties"><Button variant="outline">Back to Properties</Button></Link>}
          />
        </div>
      </Layout>
    );
  }

  const displayPrice = property.price > 0 ? formatPrice(property.price) : 'Price on Request';
  const propertyUrl = `${window.location.origin}/property/${property.id}`;

 

  const redirectToLogin = () => {
  toast({ 
    title: 'Login Required', 
    description: 'Please login to continue.', 
    variant: 'destructive' 
  });
  // Pass the current path so the login page can redirect back here
  navigate('/auth', { state: { from: location.pathname } });
};

  const isSold = property.status === 'sold';

  const handleSave = async () => {
    if (!isAuthenticated) {
      toast({ title: 'Login Required', description: 'Please login to save properties.', variant: 'destructive' });
      redirectToLogin();
      return;
    }
    
    if (isSaved) {
      setShowUnsaveConfirm(true);
    } else {
      try {
        await saveProperty(property.id);
        setIsSaved(true);
        trackPropertySaved(property.id);
        toast({ title: 'Property saved!', description: 'You can view saved properties in your dashboard.' });
      } catch {
        toast({ title: 'Error', description: 'Failed to save property.', variant: 'destructive' });
      }
    }
  };

  const confirmUnsave = async () => {
    try {
      await unsaveProperty(property.id);
      setIsSaved(false);
      trackPropertyUnsaved(property.id);
      toast({ title: 'Removed from saved', description: 'Property removed from your saved list.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to remove property.', variant: 'destructive' });
    }
    setShowUnsaveConfirm(false);
  };

  const handleInquiry = async () => {
    if (!isAuthenticated) {
      toast({ title: 'Login Required', description: 'Please login to contact sellers.', variant: 'destructive' });
      redirectToLogin();
      return;
    }
    if (!inquiryMessage.trim()) {
      toast({ title: 'Message required', description: 'Please enter a message for the seller.', variant: 'destructive' });
      return;
    }
    
    setIsSendingInquiry(true);
    try {
      await sendInquiry(property.id, inquiryMessage);
      trackInquirySent(property.id, property.sellerId);
      toast({ title: 'Inquiry sent!', description: 'The seller will contact you soon.' });
      setInquiryMessage('');
    } catch {
      toast({ title: 'Error', description: 'Failed to send inquiry.', variant: 'destructive' });
    } finally {
      setIsSendingInquiry(false);
    }
  };

  const handleContactSeller = () => {
    if (!isAuthenticated) {
      toast({ title: 'Login Required', description: 'Please login to view seller contact.', variant: 'destructive' });
      redirectToLogin();
      return;
    }
    trackSellerContacted(property.sellerId, property.id);
    setShowContactInfo(true);
  };

  const handleReportProperty = () => {
    if (!isAuthenticated) {
      toast({ title: 'Login Required', description: 'Please login to report properties.', variant: 'destructive' });
      redirectToLogin();
      return;
    }
    setShowReportConfirm(true);
  };

  const proceedWithReport = () => {
    setShowReportConfirm(false);
    setShowReportDialog(true);
  };

  const handleSubmitReport = async () => {
    if (!reportReason) {
      toast({ title: 'Reason required', description: 'Please select a reason for reporting.', variant: 'destructive' });
      return;
    }

    setIsSubmittingReport(true);
    try {
      await reportProperty(property.id, reportReason, reportDescription);
      trackPropertyReported(property.id, reportReason);
      toast({ title: 'Report Submitted', description: 'Thank you for reporting. Our team will review this property.' });
      setShowReportDialog(false);
      setReportReason('');
      setReportDescription('');
    } catch {
      toast({ title: 'Error', description: 'Failed to submit report.', variant: 'destructive' });
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleShare = () => {
    setShowShareDialog(true);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(propertyUrl);
      setLinkCopied(true);
      toast({ title: 'Link Copied!', description: 'Property link copied to clipboard.' });
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      toast({ title: 'Error', description: 'Failed to copy link.', variant: 'destructive' });
    }
  };

  const handleShareToApp = (app: string) => {
    const title = encodeURIComponent(property.title);
    const text = encodeURIComponent(`Check out this property: ${property.title} - ${displayPrice}`);
    const url = encodeURIComponent(propertyUrl);

    let shareUrl = '';

    switch (app) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${text}%20${url}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${title}&body=${text}%20${url}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
    setShowShareDialog(false);
  };

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);

  const variants = {
    initial: { opacity: 0, x: 10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 },
  };

  return (
    <Layout>
      {/* Breadcrumb */}
      

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-muted group">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImageIndex} // Key triggers animation on change
                  variants={variants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="w-full h-full"
                >
                  <ImageWithFallback 
                    src={property.images[currentImageIndex]}  
                    alt={property.title} 
                    className={cn(
                      "w-full h-full object-cover",
                      isSold && "grayscale-[0.6] blur-[2px]"
                    )}
                  />
                </motion.div>
              </AnimatePresence>

              {isSold && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                  <div className="bg-destructive text-destructive-foreground px-8 py-4 rounded-xl shadow-2xl border-4 border-white/20 transform -rotate-12 animate-in zoom-in duration-300">
                    <p className="text-4xl md:text-6xl font-black tracking-tighter italic">SOLD OUT</p>
                  </div>
                </div>
              )}
              
              {/* Navigation Controls (Hidden if Sold) */}
              {!isSold && property.images.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                    {property.images.map((_, idx) => (
                      <button key={idx} onClick={() => setCurrentImageIndex(idx)} className={`w-2 h-2 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-primary' : 'bg-background/60'}`} />
                    ))}
                  </div>
                </>
              )}
              
              {/* Badges */}
              <div className="absolute top-4 left-4 z-30 flex gap-2">
                <Badge className="bg-background/90 text-foreground backdrop-blur-sm">{getPropertyTypeLabel(property.type)}</Badge>
                {property.isVerified && <Badge className="bg-primary text-primary-foreground"><CheckCircle2 className="h-3 w-3 mr-1" />Verified</Badge>}
                {isSold && <Badge variant="destructive" className="uppercase font-bold">Sold</Badge>}
              </div>
              
              {/* Actions */}
              <div className="absolute top-4 right-4 flex gap-2">
                <Button variant="ghost" size="icon" className="bg-background/80 backdrop-blur-sm hover:bg-background" onClick={handleSave}>
                  <Heart className={`h-5 w-5 ${isSaved ? 'fill-destructive text-destructive' : ''}`} />
                </Button>
                <Button variant="ghost" size="icon" className="bg-background/80 backdrop-blur-sm hover:bg-background" onClick={handleShare}>
                  <Share2 className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="bg-background/80 backdrop-blur-sm hover:bg-background" onClick={handleReportProperty}>
                  <Flag className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Thumbnails */}
            {property.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {property.images.map((img, idx) => (
                  <button key={idx} onClick={() => setCurrentImageIndex(idx)} className={`shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${idx === currentImageIndex ? 'border-primary' : 'border-transparent'}`}>
                    <ImageWithFallback src={img} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Property Info */}
            <div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-3">{property.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{property.location.address}, {property.location.city}, {property.location.state}</span>
                <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" />{property.views} views</span>
                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />Posted {new Date(property.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Key Details */}
            <Card>
              <CardHeader><CardTitle className="text-lg">Property Details</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted">
                    <p className="text-2xl font-heading font-bold text-primary">{displayPrice}</p>
                    <p className="text-sm text-muted-foreground">Price</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted">
                    <p className="text-2xl font-heading font-bold text-foreground">{formatArea(property.area, property.areaUnit)}</p>
                    <p className="text-sm text-muted-foreground">Area</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted">
                    <p className="text-2xl font-heading font-bold text-foreground capitalize">{property.type}</p>
                    <p className="text-sm text-muted-foreground">Type</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted">
                    <p className="text-2xl font-heading font-bold text-foreground">{property.location.pincode}</p>
                    <p className="text-sm text-muted-foreground">Pincode</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader><CardTitle className="text-lg">Description</CardTitle></CardHeader>
              <CardContent><p className="text-muted-foreground whitespace-pre-line">{property.description}</p></CardContent>
            </Card>

            {/* Amenities & Features */}
            {(property.amenities?.length > 0 || property.features?.length > 0) && (
              <Card>
                <CardHeader><CardTitle className="text-lg">Amenities & Features</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {property.amenities?.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Amenities</h4>
                      <div className="flex flex-wrap gap-2">
                        {property.amenities.map((amenity) => (
                          <Badge key={amenity} variant="secondary">{amenity}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {property.features?.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Features</h4>
                      <div className="flex flex-wrap gap-2">
                        {property.features.map((feature) => (
                          <Badge key={feature} variant="outline">{feature}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Location */}
            <Card>
              <CardHeader><CardTitle className="text-lg">Location</CardTitle></CardHeader>
              <CardContent>
                <p className="mt-4 text-muted-foreground">{property.location.address}, {property.location.city}, {property.location.state} - {property.location.pincode}</p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
  <Card className="sticky top-24">
    <CardHeader>
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-7 w-7 text-primary" />
        </div>
        <div>
          <CardTitle className="text-lg">{property.sellerName}</CardTitle>
          {property.isVerified && (
            <div className="flex items-center gap-1 text-sm text-primary">
              <Shield className="h-4 w-4" />Verified Seller
            </div>
          )}
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      {showContactInfo ? (
        <div className="flex flex-col gap-2">
          {/* WhatsApp Button */}
          <Button 
            variant="outline" 
            className="w-full gap-2 border-green-600 text-green-600 hover:bg-green-50"
            onClick={() => window.open(`https://wa.me/${property.sellerPhone.replace(/\D/g, '')}`, '_blank')}
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </Button>
          
          {/* Call Button */}
          <Button 
            className="w-full gap-2"
            onClick={() => window.location.href = `tel:${property.sellerPhone}`}
          >
            <Phone className="h-4 w-4" /> Call
          </Button>
        </div>
      ) : (
        <Button className="w-full gap-2" onClick={handleContactSeller}>
          <Phone className="h-4 w-4" /> Contact Seller
        </Button>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="inquiry">Send Inquiry</Label>
        <Textarea 
          id="inquiry" 
          placeholder="Hi, I'm interested in this property. Please share more details." 
          value={inquiryMessage} 
          onChange={(e) => setInquiryMessage(e.target.value)} 
          rows={4} 
        />
        <Button className="w-full gap-2" onClick={handleInquiry} disabled={isSendingInquiry}>
          <MessageCircle className="h-4 w-4" />
          {isSendingInquiry ? 'Sending...' : 'Send Message'}
        </Button>
      </div>
    </CardContent>
  </Card>
</div>
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Property</DialogTitle>
            <DialogDescription>Share this property with friends and family</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Copy Link */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={propertyUrl}
                readOnly
                className="flex-1 px-3 py-2 text-sm border rounded-lg bg-muted"
              />
              <Button size="sm" onClick={handleCopyLink} className="gap-2">
                {linkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {linkCopied ? 'Copied!' : 'Copy'}
              </Button>
            </div>

            {/* Share Apps */}
            <div className="grid grid-cols-3 gap-3">
              <Button variant="outline" onClick={() => handleShareToApp('whatsapp')} className="flex flex-col items-center gap-2 h-auto py-4">
                <svg className="h-6 w-6 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span className="text-xs">WhatsApp</span>
              </Button>
              
              <Button variant="outline" onClick={() => handleShareToApp('facebook')} className="flex flex-col items-center gap-2 h-auto py-4">
                <svg className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-xs">Facebook</span>
              </Button>
              
              <Button variant="outline" onClick={() => handleShareToApp('twitter')} className="flex flex-col items-center gap-2 h-auto py-4">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span className="text-xs">X (Twitter)</span>
              </Button>
              
              <Button variant="outline" onClick={() => handleShareToApp('telegram')} className="flex flex-col items-center gap-2 h-auto py-4">
                <svg className="h-6 w-6 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                <span className="text-xs">Telegram</span>
              </Button>
              
              <Button variant="outline" onClick={() => handleShareToApp('linkedin')} className="flex flex-col items-center gap-2 h-auto py-4">
                <svg className="h-6 w-6 text-blue-700" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span className="text-xs">LinkedIn</span>
              </Button>
              
              <Button variant="outline" onClick={() => handleShareToApp('email')} className="flex flex-col items-center gap-2 h-auto py-4">
                <MessageCircle className="h-6 w-6" />
                <span className="text-xs">Email</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Confirm Dialog */}
      <ConfirmDialog open={showReportConfirm} onOpenChange={setShowReportConfirm} title="Report Property" description="Are you sure you want to report this property? This will be reviewed by our team." confirmText="Continue" onConfirm={proceedWithReport} />
      
      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Property</DialogTitle>
            <DialogDescription>Please provide details about the issue</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reason for reporting</Label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger><SelectValue placeholder="Select a reason" /></SelectTrigger>
                <SelectContent>
                  {REPORT_REASONS.map((reason) => (<SelectItem key={reason.value} value={reason.value}>{reason.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Additional details</Label>
              <Textarea placeholder="Describe the issue..." value={reportDescription} onChange={(e) => setReportDescription(e.target.value)} rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmitReport} disabled={isSubmittingReport}>{isSubmittingReport ? 'Submitting...' : 'Submit Report'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unsave Confirm Dialog */}
      <ConfirmDialog open={showUnsaveConfirm} onOpenChange={setShowUnsaveConfirm} title="Remove from Saved" description="Remove this property from your saved list?" confirmText="Remove" variant="destructive" onConfirm={confirmUnsave} />
    </Layout>
  );
};

export default PropertyDetailsPage;

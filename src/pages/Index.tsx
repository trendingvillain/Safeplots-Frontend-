import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PropertyCard from '@/components/property/PropertyCard';
import PropertyCardSkeleton from '@/components/property/PropertyCardSkeleton';
import SearchBar from '@/components/property/SearchBar';
import EmptyState from '@/components/common/EmptyState';
import { getFeaturedProperties } from '@/services/propertyService';
import { useAuth } from '@/contexts/AuthContext';
import { SearchFilters, Property } from '@/types';
import {
  Shield,
  CheckCircle2,
  Users,
  Building2,
  ArrowRight,
  Star,
  MapPin,
  Phone,
  Camera,
  FileCheck,
  AlertCircle,
} from 'lucide-react';

const Index: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Set document title
  useEffect(() => {
    document.title = 'SafePlots - Buy Verified Plots & Homes Across India';
  }, []);
  
  useEffect(() => {
    const loadFeaturedProperties = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const properties = await getFeaturedProperties(6);
        setFeaturedProperties(properties);
      } catch (err) {
        setError('Failed to load featured properties');
        console.error('Error loading featured properties:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFeaturedProperties();
  }, []);
  
  const handleSearch = (filters: SearchFilters) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, String(value));
    });
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920')] bg-cover bg-center opacity-10" />
        
        {/* Content */}
        <div className="container relative z-10 py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 text-primary-foreground mb-8 animate-fade-in">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">A Trusted Property Platform</span>
            </div>
            
            {/* Headline */}
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 animate-slide-up">
              Buy Verified Plots & Homes
              <span className="block mt-2 text-primary-foreground/90">Across India</span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-8 animate-slide-up stagger-1">
              Search safe, verified plots and houses with real photos, videos, and genuine sellers.
              <br className="hidden md:block" />
              No brokers. No confusion. Just trusted property discovery.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-12 animate-slide-up stagger-2">
              <Link to="/properties">
                <Button size="xl" variant="hero" className="gap-2">
                  Search Properties
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/seller/register">
                <Button size="xl" variant="outline-white" className="gap-2">
                  Post Property
                </Button>
              </Link>
            </div>
            
            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 animate-fade-in stagger-3">
              {[
                { value: '1000+', label: 'Verified Properties' },
                { value: '500+', label: 'Happy Buyers' },
                { value: '50+', label: 'Cities Covered' },
              ].map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground">
                    {stat.value}
                  </div>
                  <div className="text-sm text-primary-foreground/70">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" className="w-full">
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              className="fill-background"
            />
          </svg>
        </div>
      </section>

      {/* Search Section */}
      <section className="relative z-20 -mt-20 pb-16">
        <div className="container">
          <SearchBar onSearch={handleSearch} />
        </div>
      </section>

      {/* Why SafePlots */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">Why Choose Us</Badge>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
              Your Safe Path to Property Ownership
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We ensure every property is verified and every seller is genuine, 
              so you can buy with confidence.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: CheckCircle2,
                title: 'Verified Sellers',
                description: 'Every seller undergoes thorough ID verification before listing.'
              },
              {
                icon: Camera,
                title: 'Real Photos & Videos',
                description: 'Browse genuine photos and videos of every property.'
              },
              {
                icon: FileCheck,
                title: 'Legal Clarity',
                description: 'Access property documents and verify ownership status.'
              },
              {
                icon: Phone,
                title: 'Direct Contact',
                description: 'Connect directly with sellers. No middlemen, no brokers.'
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group p-6 rounded-2xl bg-card border border-border/50 card-elevated"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <feature.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <Badge variant="secondary" className="mb-4">Featured</Badge>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">
                Handpicked Properties
              </h2>
              <p className="text-muted-foreground">
                Explore our curated selection of verified properties across India
              </p>
            </div>
            <Link to="/properties" className="mt-4 md:mt-0">
              <Button variant="outline" className="gap-2">
                View All Properties
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <PropertyCardSkeleton count={6} />
            </div>
          ) : error ? (
            <EmptyState
              icon={<AlertCircle className="h-8 w-8 text-destructive" />}
              title="Failed to load properties"
              description={error}
              action={
                <Button onClick={() => window.location.reload()}>
                  Retry
                </Button>
              }
            />
          ) : featuredProperties.length === 0 ? (
            <EmptyState
              icon={<Building2 className="h-8 w-8 text-muted-foreground" />}
              title="No properties available"
              description="Check back soon for new listings"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Property Types */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">Property Types</Badge>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
              Find What You're Looking For
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { type: 'plot', label: 'Plots', icon: MapPin },
              { type: 'house', label: 'Houses', icon: Building2 },
              { type: 'flat', label: 'Flats', icon: Building2 },
              { type: 'villa', label: 'Villas', icon: Building2 },
              { type: 'farmland', label: 'Farmland', icon: MapPin },
            ].map((item, idx) => (
              <Link
                key={idx}
                to={`/properties?type=${item.type}`}
                className="group p-6 rounded-2xl bg-card border border-border/50 text-center card-elevated"
              >
                <div className="w-14 h-14 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary transition-colors">
                  <item.icon className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="font-heading font-semibold text-foreground mb-1">
                  {item.label}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Browse listings
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">Testimonials</Badge>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
              Trusted by Thousands
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Ramesh Iyer',
                location: 'Chennai',
                text: 'Found my dream plot through SafePlots. The verification process gave me complete confidence in the purchase.',
                rating: 5
              },
              {
                name: 'Priya Nair',
                location: 'Bangalore',
                text: 'Excellent platform! Direct contact with sellers and verified documents made the entire process smooth.',
                rating: 5
              },
              {
                name: 'Suresh Menon',
                location: 'Hyderabad',
                text: 'Best real estate platform I\'ve used. No brokers, no hassle. Highly recommended for first-time buyers.',
                rating: 5
              },
            ].map((testimonial, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-card border border-border/50"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-foreground mb-4">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920')] bg-cover bg-center opacity-5" />
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Sell Your Property?
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8">
              List your property on SafePlots.in and connect with genuine buyers across India.
              Free listing. Verified buyers. Direct contact.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/seller/register">
                <Button size="xl" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 gap-2">
                  Post Property Free
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/properties">
                <Button size="xl" variant="outline-white">
                  Browse Properties
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
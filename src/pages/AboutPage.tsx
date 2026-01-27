import React, { useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Shield, Users, Eye, Award, CheckCircle } from 'lucide-react';

const AboutPage: React.FC = () => {
  useEffect(() => {
    document.title = 'About Us | SafePlots';
  }, []);

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/20 py-16 sm:py-24">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
              About <span className="text-primary">SafePlots</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              India's trusted platform for discovering verified plots and homes. We're on a mission to make property buying transparent, safe, and hassle-free.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-background">
        <div className="container px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Eye className="h-6 w-6 text-primary" />
              </div>
              <h2 className="font-heading text-2xl font-bold mb-4">Our Vision</h2>
              <p className="text-muted-foreground">
                To become India's most trusted property discovery platform, where every buyer can find their dream property with complete confidence and transparency.
              </p>
            </div>
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h2 className="font-heading text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground">
                To simplify property discovery by connecting verified sellers with genuine buyers, ensuring transparency at every step of the journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-center mb-12">
            Why Choose SafePlots?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { icon: Shield, title: 'Verified Listings', desc: 'Every property is verified before listing' },
              { icon: Users, title: 'Trusted Sellers', desc: 'Only approved sellers can list properties' },
              { icon: Eye, title: 'Full Transparency', desc: 'Complete property details and documents' },
              { icon: Award, title: 'Quality Assurance', desc: 'High standards for all listings' },
            ].map((item, index) => (
              <div key={index} className="bg-card rounded-xl p-6 border border-border text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-background">
        <div className="container px-4">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="max-w-4xl mx-auto space-y-6">
            {[
              { step: '1', title: 'Browse Properties', desc: 'Search through our verified listings by location, type, and budget.' },
              { step: '2', title: 'View Details', desc: 'Access complete property information, photos, and legal documents.' },
              { step: '3', title: 'Connect with Seller', desc: 'Reach out to verified sellers directly through our platform.' },
              { step: '4', title: 'Visit & Verify', desc: 'Schedule site visits and verify documents before making decisions.' },
            ].map((item, index) => (
              <div key={index} className="flex gap-4 items-start bg-card rounded-xl p-6 border border-border">
                <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-12 bg-muted/50">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm text-muted-foreground">
              <strong>Disclaimer:</strong> SafePlots.in is a property discovery platform. We do not participate in financial transactions. Buyers are advised to verify all legal documents independently before making any purchase decisions.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AboutPage;
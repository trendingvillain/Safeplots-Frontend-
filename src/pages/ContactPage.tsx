import React, { useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

const ContactPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Contact Us | SafePlots';
  }, []);

  const contactMethods = [
    {
      icon: MapPin,
      title: 'Office Address',
      content: 'CM Technology, Mukkani,\nThoothukudi - 628151',
    },
    {
      icon: Phone,
      title: 'Phone Number',
      content: '+91 75300 59315',
      href: 'tel:+917530059315',
    },
    {
      icon: Mail,
      title: 'Email Address',
      content: 'safeplotss@gmail.com',
      href: 'mailto:safeplotss@gmail.com',
    },
    {
      icon: Clock,
      title: 'Working Hours',
      content: 'Mon - Sat: 9:00 AM - 6:00 PM\nSunday: Closed',
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/20 py-16 sm:py-24">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Get in <span className="text-primary">Touch</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Have questions about a property or our verification process? 
              Reach out to us directly through any of the channels below.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Grid */}
      <section className="py-20 bg-background">
        <div className="container px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {contactMethods.map((item, index) => (
                <div 
                  key={index} 
                  className="flex flex-col items-center text-center p-8 bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <item.icon className="h-7 w-7 text-primary" />
                  </div>
                  
                  <h3 className="font-heading text-xl font-bold mb-3">{item.title}</h3>
                  
                  {item.href ? (
                    <a 
                      href={item.href} 
                      className="text-lg text-muted-foreground hover:text-primary transition-colors whitespace-pre-line font-medium"
                    >
                      {item.content}
                    </a>
                  ) : (
                    <p className="text-lg text-muted-foreground whitespace-pre-line font-medium">
                      {item.content}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Support Note */}
            <div className="mt-16 text-center">
              <div className="inline-block p-6 bg-muted/50 rounded-2xl border border-dashed border-muted-foreground/20">
                <p className="text-muted-foreground italic">
                  "Our team typically responds to all inquiries within 24 hours during working days."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ContactPage;
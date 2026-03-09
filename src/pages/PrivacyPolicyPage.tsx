import React, { useEffect } from 'react';
import Layout from '@/components/layout/Layout';

const PrivacyPolicyPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Privacy Policy | SafePlots';
  }, []);

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-muted/50 py-12 sm:py-16 border-b border-border">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16 bg-background">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto prose prose-slate dark:prose-invert">
            <div className="space-y-8">
              <div>
                <h2 className="font-heading text-xl font-bold mb-4">1. Introduction</h2>
                <p className="text-muted-foreground leading-relaxed">
                  SafePlots.in ("we," "our," or "us"), operated under CM Technology, is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
                </p>
              </div>

              <div>
                <h2 className="font-heading text-xl font-bold mb-4">2. Information We Collect</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">We may collect the following types of information:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li><strong>Personal Information:</strong> Name, email address, phone number, and address when you register or contact us.</li>
                  <li><strong>Property Information:</strong> Details about properties you list or inquire about.</li>
                  <li><strong>Usage Data:</strong> Information about how you interact with our website, including IP address, browser type, and pages visited.</li>
                  <li><strong>Cookies:</strong> We use cookies to enhance your browsing experience and analyze website traffic.</li>
                </ul>
              </div>

              <div>
                <h2 className="font-heading text-xl font-bold mb-4">3. How We Use Your Information</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">We use the collected information for:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Providing and maintaining our services</li>
                  <li>Connecting buyers with verified sellers</li>
                  <li>Sending important notifications and updates</li>
                  <li>Improving our website and user experience</li>
                  <li>Responding to your inquiries and support requests</li>
                  <li>Preventing fraudulent activities</li>
                </ul>
              </div>

              <div>
                <h2 className="font-heading text-xl font-bold mb-4">4. Information Sharing</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We do not sell your personal information. We may share your information with:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-3">
                  <li>Property sellers (when you express interest in a property)</li>
                  <li>Service providers who assist in our operations</li>
                  <li>Legal authorities when required by law</li>
                </ul>
              </div>

              <div>
                <h2 className="font-heading text-xl font-bold mb-4">5. Data Security</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
                </p>
              </div>

              <div>
                <h2 className="font-heading text-xl font-bold mb-4">6. Your Rights</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">You have the right to:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Access your personal information</li>
                  <li>Request correction of inaccurate data</li>
                  <li>Request deletion of your account and data</li>
                  <li>Opt-out of marketing communications</li>
                </ul>
              </div>

              <div>
                <h2 className="font-heading text-xl font-bold mb-4">7. Third-Party Links</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to read their privacy policies.
                </p>
              </div>

              <div>
                <h2 className="font-heading text-xl font-bold mb-4">8. Children's Privacy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children.
                </p>
              </div>

              <div>
                <h2 className="font-heading text-xl font-bold mb-4">9. Changes to This Policy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
                </p>
              </div>

              <div>
                <h2 className="font-heading text-xl font-bold mb-4">10. Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <div className="mt-3 p-4 bg-muted/50 rounded-xl text-muted-foreground">
                  <p><strong>Email:</strong> safeplotss@gmail.com</p>
                  <p><strong>Phone:</strong> +91 75300 59315</p>
                  <p className="mt-2">
                    <strong>Address: CM Technology</strong><br />
                    Mukkani, Thoothukudi,<br />
                    Tamil Nadu - 628151
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PrivacyPolicyPage;
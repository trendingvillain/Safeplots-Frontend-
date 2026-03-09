import React, { useEffect } from 'react';
import Layout from '@/components/layout/Layout';

const TermsOfServicePage: React.FC = () => {
  useEffect(() => {
    document.title = 'Terms of Service | SafePlots';
  }, []);

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-muted/50 py-12 sm:py-16 border-b border-border">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Terms of Service
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
          <div className="max-w-3xl mx-auto">
            <div className="space-y-8">
              <div>
                <h2 className="font-heading text-xl font-bold mb-4">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing and using SafePlots.in ("the Website"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                </p>
              </div>

              <div>
                <h2 className="font-heading text-xl font-bold mb-4">2. Description of Service</h2>
                <p className="text-muted-foreground leading-relaxed">
                  SafePlots.in is a property discovery platform that connects property buyers with verified sellers. We provide a platform for listing and browsing properties but do not participate in any financial transactions between parties.
                </p>
              </div>

              <div>
                <h2 className="font-heading text-xl font-bold mb-4">3. User Accounts</h2>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>You must provide accurate and complete information during registration.</li>
                  <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                  <li>You must notify us immediately of any unauthorized use of your account.</li>
                  <li>We reserve the right to suspend or terminate accounts that violate these terms.</li>
                </ul>
              </div>

              <div>
                <h2 className="font-heading text-xl font-bold mb-4">4. Property Listings</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">Sellers agree to:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Provide accurate and truthful information about properties</li>
                  <li>Have legal rights to sell or rent the listed property</li>
                  <li>Upload genuine photographs and documents</li>
                  <li>Respond to buyer inquiries in a timely manner</li>
                  <li>Not post misleading or fraudulent listings</li>
                </ul>
              </div>

              <div>
                <h2 className="font-heading text-xl font-bold mb-4">5. User Conduct</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">Users must not:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Post false, misleading, or fraudulent content</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Attempt to gain unauthorized access to the platform</li>
                  <li>Use the platform for illegal activities</li>
                  <li>Scrape or collect user data without permission</li>
                  <li>Interfere with the proper functioning of the website</li>
                </ul>
              </div>

              <div>
                <h2 className="font-heading text-xl font-bold mb-4">6. Disclaimer</h2>
                <div className="p-4 bg-destructive/10 rounded-xl border border-destructive/20">
                  <p className="text-muted-foreground leading-relaxed">
                    <strong>Important:</strong> SafePlots.in is a property discovery platform only. We do not verify the legal status of properties, ownership documents, or seller credentials beyond basic verification. Buyers are strongly advised to:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
                    <li>Conduct independent verification of all documents</li>
                    <li>Consult legal experts before any transaction</li>
                    <li>Visit properties in person before making decisions</li>
                    <li>Never make advance payments without proper verification</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="font-heading text-xl font-bold mb-4">7. Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  SafePlots.in shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from your use of our services, including but not limited to losses from property transactions, disputes between users, or inaccurate listings.
                </p>
              </div>

              <div>
                <h2 className="font-heading text-xl font-bold mb-4">8. Intellectual Property</h2>
                <p className="text-muted-foreground leading-relaxed">
                  All content on SafePlots.in, including logos, text, graphics, and software, is the property of SafePlots.in and is protected by intellectual property laws. You may not copy, modify, or distribute our content without permission.
                </p>
              </div>

              <div>
                <h2 className="font-heading text-xl font-bold mb-4">9. Fees and Payments</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Currently, basic property listing is free. We may introduce premium features or fees in the future. Any such changes will be communicated in advance.
                </p>
              </div>

              <div>
                <h2 className="font-heading text-xl font-bold mb-4">10. Termination</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to suspend or terminate your access to our services at any time, without notice, for violations of these terms or for any other reason at our sole discretion.
                </p>
              </div>

              <div>
                <h2 className="font-heading text-xl font-bold mb-4">11. Changes to Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may modify these Terms of Service at any time. Continued use of the platform after changes constitutes acceptance of the modified terms.
                </p>
              </div>

              <div>
                <h2 className="font-heading text-xl font-bold mb-4">12. Contact Information</h2>
                <p className="text-muted-foreground leading-relaxed">
                  For questions about these Terms of Service, please contact us:
                </p>
                <div className="mt-3 p-4 bg-muted/50 rounded-xl text-muted-foreground">
                  <p><strong>Email:</strong> safeplotss@gmail.com</p>
                  <p><strong>Phone:</strong> +91 75300 59315</p>
                  <p className="mt-2">
                    <strong>Address:</strong><br />
                    Mukkani, Thoothukudi,<br />
                    Tamil Nadu - 628151 </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default TermsOfServicePage;
import React from "react";

const PrivacySetting = () => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-xl font-semibold text-white mb-1">Privacy Setting</h2>
      <p className="text-sm text-gray-400 mb-8">Privacy about the system</p>

      <div className="text-gray-300 text-sm md:text-[15px] leading-relaxed space-y-4">
        <p>
          We value your privacy and are committed to protecting your personal
          information. By using our dashboard, you agree to the collection and
          use of information as outlined below:
        </p>

        <div>
          <p>1. Information We Collect</p>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li>
              Personal details such as your name, email, and contact information
              when you sign up.
            </li>
            <li>
              Business-related data that you provide for AI support services.
            </li>
            <li>
              Usage data (e.g., logins, interactions, and activity within the
              dashboard) to improve performance.
            </li>
          </ul>
        </div>

        <div>
          <p>2. How We Use Your Information</p>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li>
              To provide AI-powered call and messaging support for your
              business.
            </li>
            <li>To improve and personalize your dashboard experience.</li>
            <li>To ensure account security and prevent unauthorized access.</li>
            <li>
              To send important updates and notifications related to your
              account.
            </li>
          </ul>
        </div>

        <div>
          <p>3. Data Protection</p>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li>
              We use industry-standard security measures to protect your data.
            </li>
            <li>
              Your information will never be sold or shared with third parties
              without your consent, except as required by law.
            </li>
          </ul>
        </div>

        <div>
          <p>4. User Control</p>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li>
              You may update or delete your account information at any time.
            </li>
            <li>You can request access to the data we hold about you.</li>
            <li>
              You may unsubscribe from marketing communications whenever you
              choose.
            </li>
          </ul>
        </div>

        <p>
          5. A data handling notice clarifying that Calai does not store data
          and that transcripts are emailed only.
        </p>

        <div className="space-y-1">
          <p>
            6.A field to input or update the destination email for transcripts.
          </p>
          <p>
            A confirmation toggle (e.g., "I agree / I understand" about data
            policy).
          </p>
        </div>

        <p>
          7.Escalation settings: ability to enter a fallback number and define
          keywords or after-hours
        </p>

        <p>
          8. A preview of the transcript email format, especially for
          restaurants using auto-printing.
        </p>

        <div className="space-y-1">
          <p>9. Contact Us</p>
          <p>
            If you have any questions about this Privacy Policy or how your
            information is handled, please contact our support team at
            [support@calai.com].
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacySetting;

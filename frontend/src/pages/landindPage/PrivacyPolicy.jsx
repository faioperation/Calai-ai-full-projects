import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone } from "lucide-react";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white font-inter">
      {/* Header */}
      <header className="border-b border-white/10 px-4 md:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
        <div className="flex w-full md:w-auto items-center justify-between md:justify-start gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 shrink-0 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="text-gray-300">Hello!! Welcome to Calai</div>
        </div>

        <div className="flex  sm:flex-row items-center gap-3 sm:gap-6 text-gray-300 w-full md:w-auto justify-end sm:justify-end">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 shrink-0" />
            <span className="text-xs sm:text-sm">Enquiries@calai.info</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 shrink-0" />
            <span className="text-xs sm:text-sm">+447719436543</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className=" mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-6 text-[#E8D1FF]">
          Privacy Policy
        </h1>
        <p className="text-gray-300 leading-relaxed mb-6">
          <strong>Last updated:</strong> 4 August 2026
        </p>

        <p className="text-gray-300 leading-relaxed mb-6">
          Calai ("Calai", "we", "us" or "our") respects your privacy and is committed to protecting personal information.
        </p>
        <p className="text-gray-300 leading-relaxed mb-6">
          This Privacy Policy explains how we collect, use, process, store and protect personal information when you visit our website, make an enquiry, request a free trial, create an account or use the Calai service.
        </p>
        <p className="text-gray-300 leading-relaxed mb-6">
          Calai provides AI-powered telephone answering and order-handling services for businesses, including restaurants and takeaways.
        </p>
        <p className="text-gray-300 leading-relaxed mb-10">
          This Privacy Policy should be read alongside our Terms and Conditions, which govern the use of the Calai service.
        </p>

        <h2 className="text-2xl font-bold mb-4 text-[#E8D1FF]">
          1. Who We Are
        </h2>
        <p className="text-gray-300 leading-relaxed mb-6">
          Calai is operated by:<br />
          <strong>CALAI LTD</strong><br />
          Trading as: Calai<br />
          Company number: 16995419<br />
          Registered office: UK, London,<br />
          Email: <a href="mailto:hello@calai.info" className="text-[#E8D1FF] hover:underline">hello@calai.info</a><br />
          Website: <a href="https://www.calai.info" target="_blank" rel="noopener noreferrer" className="text-[#E8D1FF] hover:underline">www.calai.info</a>
        </p>
        <p className="text-gray-300 leading-relaxed mb-6">
          For personal information that we collect for our own purposes, such as account, billing, website and business contact information, we will generally act as the data controller.
        </p>
        <p className="text-gray-300 leading-relaxed mb-6">
          Where Calai processes information contained within customer calls on behalf of a business using our service, the business will generally act as the data controller and Calai will act as a data processor.
        </p>
        <p className="text-gray-300 leading-relaxed mb-6">
          The business determines the purposes for which Calai is used and Calai processes relevant customer information in order to provide the contracted service.
        </p>
        <p className="text-gray-300 leading-relaxed mb-10">
          Further information regarding the respective responsibilities of Calai and businesses using the service may be contained in our Terms and Conditions and any applicable data processing terms.
        </p>

        <h2 className="text-2xl font-bold mb-4 text-[#E8D1FF]">
          2. Information We Collect
        </h2>
        <p className="text-gray-300 leading-relaxed mb-4">
          The information we collect depends on how you interact with Calai.
        </p>
        
        <h3 className="text-xl font-bold mb-3 text-[#E8D1FF]">
          Website, Account and Contact Information
        </h3>
        <p className="text-gray-300 leading-relaxed mb-4">
          We may collect:
        </p>
        <ul className="list-disc list-inside text-gray-300 space-y-3 mb-6 ml-4">
          <li>Your name</li>
          <li>Email address</li>
          <li>Telephone number</li>
          <li>Business name</li>
          <li>Business address</li>
          <li>Account and login information</li>
          <li>Information submitted when requesting a free trial</li>
          <li>Information submitted when making an enquiry</li>
          <li>Communications with our support team</li>
          <li>Information you provide when creating or managing an account</li>
        </ul>

        <h3 className="text-xl font-bold mb-3 text-[#E8D1FF]">
          Business Information
        </h3>
        <p className="text-gray-300 leading-relaxed mb-4">
          Businesses may provide information required to configure and operate their Calai service, including:
        </p>
        <ul className="list-disc list-inside text-gray-300 space-y-3 mb-6 ml-4">
          <li>Menus and prices</li>
          <li>Opening hours</li>
          <li>Delivery and collection information</li>
          <li>Delivery areas</li>
          <li>FAQs</li>
          <li>Special offers</li>
          <li>Business policies</li>
          <li>Contact information</li>
          <li>Call handling preferences</li>
          <li>AI instructions and configurations</li>
          <li>Documents uploaded to configure the service</li>
          <li>Printer and operational settings</li>
        </ul>

        <h3 className="text-xl font-bold mb-3 text-[#E8D1FF]">
          Customer Call Information
        </h3>
        <p className="text-gray-300 leading-relaxed mb-4">
          When Calai handles a telephone call on behalf of a business, information may be processed during that interaction.
          Depending on the call, this may include:
        </p>
        <ul className="list-disc list-inside text-gray-300 space-y-3 mb-6 ml-4">
          <li>Customer name</li>
          <li>Telephone number or caller ID</li>
          <li>Delivery address</li>
          <li>Postcode</li>
          <li>Order details</li>
          <li>Collection or delivery preference</li>
          <li>Special requests or order instructions</li>
          <li>Call date and time</li>
          <li>Call duration</li>
          <li>Call transcript</li>
          <li>Call recording, where recording is enabled</li>
          <li>AI-generated call or order summaries</li>
        </ul>
        <p className="text-gray-300 leading-relaxed mb-10">
          Calai is designed to process only information reasonably necessary to provide the requested service.
        </p>

        <h2 className="text-2xl font-bold mb-4 text-[#E8D1FF]">
          3. Where We Obtain Information
        </h2>
        <p className="text-gray-300 leading-relaxed mb-4">
          We may receive personal information:
        </p>
        <ul className="list-disc list-inside text-gray-300 space-y-3 mb-10 ml-4">
          <li>Directly from you</li>
          <li>From a business that uses Calai</li>
          <li>From customers who telephone a business using Calai</li>
          <li>Through use of the Calai website or dashboard</li>
          <li>From service providers involved in delivering the Calai service</li>
          <li>Automatically through technical logs and similar technologies where necessary for security and operation of the service</li>
        </ul>

        <h2 className="text-2xl font-bold mb-4 text-[#E8D1FF]">
          4. How We Use Information
        </h2>
        <p className="text-gray-300 leading-relaxed mb-4">
          We may process information to:
        </p>
        <ul className="list-disc list-inside text-gray-300 space-y-3 mb-6 ml-4">
          <li>Provide and operate the Calai service</li>
          <li>Create and manage accounts</li>
          <li>Set up and configure AI assistants</li>
          <li>Answer customer telephone calls</li>
          <li>Respond to customer enquiries</li>
          <li>Take and communicate food orders</li>
          <li>Process delivery and collection information</li>
          <li>Generate call transcripts</li>
          <li>Generate order and call summaries</li>
          <li>Send order information to the relevant business</li>
          <li>Automatically send orders to configured printers</li>
          <li>Transfer calls to the relevant business where required</li>
          <li>Provide technical and customer support</li>
          <li>Monitor service reliability and performance</li>
          <li>Maintain account and platform security</li>
          <li>Detect and prevent fraud, abuse and unauthorised access</li>
          <li>Improve the functionality and performance of the service</li>
          <li>Process subscriptions, payments and billing information</li>
          <li>Send important service, account and security communications</li>
          <li>Respond to enquiries and free trial requests</li>
          <li>Comply with applicable legal and regulatory obligations</li>
          <li>Establish, exercise or defend legal claims where necessary</li>
        </ul>
        <p className="text-gray-300 leading-relaxed mb-10">
          Commercial matters including subscriptions, usage allowances, additional charges, cancellations and service availability are governed by our Terms and Conditions.
        </p>

        <h2 className="text-2xl font-bold mb-4 text-[#E8D1FF]">
          5. Artificial Intelligence
        </h2>
        <p className="text-gray-300 leading-relaxed mb-4">
          Calai uses artificial intelligence and related technologies to provide its services.
          AI may be used to:
        </p>
        <ul className="list-disc list-inside text-gray-300 space-y-3 mb-6 ml-4">
          <li>Understand what a caller is saying</li>
          <li>Respond to questions</li>
          <li>Identify requested menu items</li>
          <li>Process food orders</li>
          <li>Understand delivery information</li>
          <li>Generate transcripts and summaries</li>
          <li>Identify when a call should be transferred to a person</li>
          <li>Assist with other configured customer-service functions</li>
        </ul>
        <p className="text-gray-300 leading-relaxed mb-6">
          AI systems may occasionally misunderstand information or produce inaccurate results.
          Businesses remain responsible for determining how Calai is configured and used within their operations.
        </p>
        <p className="text-gray-300 leading-relaxed mb-10">
          Calai is not designed to make automated decisions about individuals that produce legal or similarly significant effects.
          Additional limitations and responsibilities concerning use of the AI service are contained in our Terms and Conditions.
        </p>

        <h2 className="text-2xl font-bold mb-4 text-[#E8D1FF]">
          6. Call Recordings and Transcripts
        </h2>
        <p className="text-gray-300 leading-relaxed mb-6">
          Where call recording is enabled, telephone calls handled through Calai may be recorded and transcribed.
          Callers may be informed that they are interacting with a virtual assistant and/or that the call is being recorded where required.
        </p>
        <p className="text-gray-300 leading-relaxed mb-6">
          Recordings and transcripts may contain personal information voluntarily provided during the conversation.
          Access to recordings and transcripts is restricted to authorised users and service providers where access is necessary to provide, secure or support the service.
        </p>
        <p className="text-gray-300 leading-relaxed mb-6">
          Call recordings and transcripts are automatically deleted after 30 days.
          Once deleted in accordance with our retention processes, they will no longer be available through the Calai service.
        </p>
        <p className="text-gray-300 leading-relaxed mb-10">
          Calai does not sell recordings, transcripts or customer information.
          Businesses using Calai are responsible for ensuring that their use of call recording and customer information complies with applicable laws and for providing any notices required in connection with their own processing activities.
        </p>

        <h2 className="text-2xl font-bold mb-4 text-[#E8D1FF]">
          7. Data Retention
        </h2>
        <p className="text-gray-300 leading-relaxed mb-4">
          We retain personal information only for as long as reasonably necessary for the purpose for which it was collected and to meet applicable legal, accounting, security and regulatory requirements.
          Our standard retention approach includes:
        </p>
        <ul className="list-disc list-inside text-gray-300 space-y-3 mb-6 ml-4">
          <li><strong>Call recordings and transcripts</strong> – automatically deleted after 30 days.</li>
          <li><strong>Active business account information</strong> – retained while the account remains active and where required to provide the service.</li>
          <li><strong>Uploaded menus, business documents and configuration information</strong> – may be retained for up to 6 months following cancellation before deletion.</li>
          <li><strong>Financial and transaction records</strong> – may be retained for longer where required by accounting, taxation or other legal requirements.</li>
          <li><strong>Security and technical records</strong> – may be retained where reasonably necessary to investigate security incidents, prevent fraud or protect the service.</li>
        </ul>
        <p className="text-gray-300 leading-relaxed mb-10">
          Information may also be retained where reasonably necessary to establish, exercise or defend legal claims.
          Technical backups operated by Calai or its service providers may take additional time to cycle out following deletion from active systems.
        </p>

        <h2 className="text-2xl font-bold mb-4 text-[#E8D1FF]">
          8. Lawful Basis for Processing
        </h2>
        <p className="text-gray-300 leading-relaxed mb-6">
          Where UK data protection law applies, Calai will process personal information only where an appropriate lawful basis exists.
          Depending on the circumstances, this may include:
        </p>
        <ul className="list-disc list-inside text-gray-300 space-y-3 mb-6 ml-4">
          <li><strong>Contract</strong> – where processing is necessary to provide services requested by or contracted with a customer.</li>
          <li><strong>Legitimate interests</strong> – where processing is reasonably necessary to operate, secure, maintain or improve our business and services and those interests are not overridden by an individual's rights.</li>
          <li><strong>Legal obligation</strong> – where we are required to process information to comply with applicable law.</li>
          <li><strong>Consent</strong> – where consent is required for a particular processing activity.</li>
        </ul>
        <p className="text-gray-300 leading-relaxed mb-10">
          Where Calai acts as a processor on behalf of a business, the relevant business is responsible for establishing the appropriate lawful basis for its processing of customer personal information.
        </p>

        <h2 className="text-2xl font-bold mb-4 text-[#E8D1FF]">
          9. Sensitive Personal Information
        </h2>
        <p className="text-gray-300 leading-relaxed mb-6">
          Calai is not designed to intentionally collect unnecessary sensitive or special-category personal information.
          Callers should avoid providing sensitive personal information unless it is reasonably necessary for their interaction with the business.
        </p>
        <p className="text-gray-300 leading-relaxed mb-10">
          Because telephone conversations are controlled by callers, individuals may voluntarily disclose information that Calai did not request.
          Where such information is processed, we will handle it in accordance with applicable data protection requirements.
        </p>

        <h2 className="text-2xl font-bold mb-4 text-[#E8D1FF]">
          10. Children's Information
        </h2>
        <p className="text-gray-300 leading-relaxed mb-6">
          Calai is not specifically designed or marketed as a service for children.
          However, because Calai answers telephone calls for businesses such as restaurants and takeaways, a person under the age of 18 may occasionally interact with the service.
        </p>
        <p className="text-gray-300 leading-relaxed mb-10">
          We do not intentionally request unnecessary information about children.
          Any personal information provided during such an interaction will be processed only as reasonably necessary to handle the relevant enquiry or order and in accordance with applicable data protection law.
        </p>

        <h2 className="text-2xl font-bold mb-4 text-[#E8D1FF]">
          11. Sharing Information
        </h2>
        <p className="text-gray-300 leading-relaxed mb-4">
          Calai does not sell personal information.
          We may use trusted third-party service providers where necessary to operate and provide the Calai service.
          These may include providers of:
        </p>
        <ul className="list-disc list-inside text-gray-300 space-y-3 mb-6 ml-4">
          <li>Cloud infrastructure and hosting</li>
          <li>Artificial intelligence processing</li>
          <li>Speech recognition</li>
          <li>Voice technology</li>
          <li>Telecommunications</li>
          <li>Email and communications</li>
          <li>Payment processing</li>
          <li>Security and monitoring</li>
          <li>Technical infrastructure</li>
        </ul>
        <p className="text-gray-300 leading-relaxed mb-4">
          These providers may process information where necessary to provide their services to Calai and are subject to applicable contractual, confidentiality, security and data protection requirements.
        </p>
        <p className="text-gray-300 leading-relaxed mb-4">
          Information may also be disclosed:
        </p>
        <ul className="list-disc list-inside text-gray-300 space-y-3 mb-10 ml-4">
          <li>Where required by law</li>
          <li>In response to a valid request from a court, regulator or law enforcement authority</li>
          <li>Where reasonably necessary to prevent fraud or serious misuse</li>
          <li>Where necessary to protect the rights, property or security of Calai, our customers or others</li>
          <li>In connection with a legitimate corporate transaction, subject to appropriate safeguards</li>
        </ul>

        <h2 className="text-2xl font-bold mb-4 text-[#E8D1FF]">
          12. International Data Transfers
        </h2>
        <p className="text-gray-300 leading-relaxed mb-6">
          Some of the technology and service providers used by Calai may process information outside the United Kingdom.
        </p>
        <p className="text-gray-300 leading-relaxed mb-10">
          Where personal information is transferred internationally, we will take appropriate steps to ensure that the transfer complies with applicable UK data protection requirements.
          This may include relying on recognised adequacy arrangements, appropriate contractual safeguards or other legally recognised transfer mechanisms.
        </p>

        <h2 className="text-2xl font-bold mb-4 text-[#E8D1FF]">
          13. Payments
        </h2>
        <p className="text-gray-300 leading-relaxed mb-6">
          Payments for Calai subscriptions and other charges may be processed through third-party payment providers.
          Where payment information is entered directly through a payment provider, Calai does not need to directly store complete payment card details.
        </p>
        <p className="text-gray-300 leading-relaxed mb-10">
          The payment provider will process payment information in accordance with its own privacy and security requirements.
          Subscription prices, usage allowances, additional usage charges, billing arrangements, refunds and cancellations are governed by our Terms and Conditions.
        </p>

        <h2 className="text-2xl font-bold mb-4 text-[#E8D1FF]">
          14. Data Security
        </h2>
        <p className="text-gray-300 leading-relaxed mb-4">
          We use appropriate technical and organisational measures designed to protect personal information against:
        </p>
        <ul className="list-disc list-inside text-gray-300 space-y-3 mb-6 ml-4">
          <li>Unauthorised access</li>
          <li>Accidental loss</li>
          <li>Misuse</li>
          <li>Unauthorised disclosure</li>
          <li>Alteration</li>
          <li>Destruction</li>
        </ul>
        <p className="text-gray-300 leading-relaxed mb-6">
          Access to systems and information is restricted where appropriate.
          Businesses are responsible for keeping their account credentials secure and for notifying Calai if they believe their account has been compromised.
        </p>
        <p className="text-gray-300 leading-relaxed mb-10">
          Although we take reasonable measures to protect information, no internet-based or electronic system can guarantee absolute security.
        </p>

        <h2 className="text-2xl font-bold mb-4 text-[#E8D1FF]">
          15. Data Breaches
        </h2>
        <p className="text-gray-300 leading-relaxed mb-10">
          We maintain procedures for identifying, investigating and responding to suspected personal data breaches.
          Where required by applicable data protection law, we will notify the relevant supervisory authority and/or affected individuals within the applicable legal timeframes.
        </p>

        <h2 className="text-2xl font-bold mb-4 text-[#E8D1FF]">
          16. Your Data Protection Rights
        </h2>
        <p className="text-gray-300 leading-relaxed mb-4">
          Depending on the circumstances, UK data protection law may give you the right to:
        </p>
        <ul className="list-disc list-inside text-gray-300 space-y-3 mb-6 ml-4">
          <li>Request access to personal information held about you</li>
          <li>Request correction of inaccurate or incomplete information</li>
          <li>Request deletion of personal information in certain circumstances</li>
          <li>Request restriction of processing</li>
          <li>Object to certain processing</li>
          <li>Request transfer of your information where applicable</li>
          <li>Withdraw consent where processing relies on consent</li>
          <li>Raise a complaint regarding the handling of your information</li>
        </ul>
        <p className="text-gray-300 leading-relaxed mb-6">
          These rights may be subject to legal exemptions and will depend on the circumstances of the processing.
          To make a request, contact: <a href="mailto:hello@calai.info" className="text-[#E8D1FF] hover:underline">hello@calai.info</a>
        </p>
        <p className="text-gray-300 leading-relaxed mb-10">
          We may request reasonable information to verify your identity before fulfilling a request.
          If your request relates to information processed by Calai on behalf of a restaurant or other business, we may need to refer your request to that business as the relevant data controller.
        </p>

        <h2 className="text-2xl font-bold mb-4 text-[#E8D1FF]">
          17. Complaints and the ICO
        </h2>
        <p className="text-gray-300 leading-relaxed mb-6">
          If you have concerns about how Calai handles your personal information, you can contact us at: <a href="mailto:hello@calai.info" className="text-[#E8D1FF] hover:underline">hello@calai.info</a>
        </p>
        <p className="text-gray-300 leading-relaxed mb-10">
          You also have the right to complain to the Information Commissioner's Office (ICO), the UK's independent data protection regulator.
          You are not required to contact Calai before making a complaint to the ICO.
          Information about your rights and how to make a complaint is available through the ICO's official website.
        </p>

        <h2 className="text-2xl font-bold mb-4 text-[#E8D1FF]">
          18. Cookies and Website Technologies
        </h2>
        <p className="text-gray-300 leading-relaxed mb-6">
          The Calai website may use cookies and similar technologies.
          Some cookies may be strictly necessary for the website, account login, security or other essential functionality.
        </p>
        <p className="text-gray-300 leading-relaxed mb-10">
          Where we use optional cookies, such as certain analytics or marketing technologies, we will request consent where required by law.
          Users may be provided with cookie controls where applicable and may also manage certain cookies through their browser settings.
        </p>

        <h2 className="text-2xl font-bold mb-4 text-[#E8D1FF]">
          19. Marketing Communications
        </h2>
        <p className="text-gray-300 leading-relaxed mb-6">
          Where permitted by law, Calai may contact existing or prospective business customers about our services.
          Where consent is required, marketing communications will only be sent with the appropriate consent.
        </p>
        <p className="text-gray-300 leading-relaxed mb-10">
          You may unsubscribe from marketing communications at any time by using the unsubscribe option provided or contacting us.
          Unsubscribing from marketing will not prevent Calai from sending necessary communications relating to your account, billing, security or operation of the service.
        </p>

        <h2 className="text-2xl font-bold mb-4 text-[#E8D1FF]">
          20. Third-Party Websites
        </h2>
        <p className="text-gray-300 leading-relaxed mb-6">
          The Calai website may contain links to websites or services operated by third parties.
        </p>
        <p className="text-gray-300 leading-relaxed mb-10">
          We do not control those third parties and are not responsible for their privacy practices, security or content.
          We recommend reviewing the relevant third party's privacy information before providing personal information to them.
        </p>

        <h2 className="text-2xl font-bold mb-4 text-[#E8D1FF]">
          21. Responsibilities of Businesses Using Calai
        </h2>
        <p className="text-gray-300 leading-relaxed mb-6">
          Businesses using Calai may have their own obligations under the UK GDPR, Data Protection Act 2018, Privacy and Electronic Communications Regulations and other applicable legislation.
          Businesses are responsible for ensuring that their own collection and use of customer information is lawful and that appropriate privacy information is provided to their customers where required.
        </p>
        <p className="text-gray-300 leading-relaxed mb-10">
          Where a business determines the purposes and means of processing customer information, that business will generally be the data controller and Calai will process relevant information on its behalf in providing the service.
          Additional responsibilities, restrictions and contractual requirements relating to use of Calai are set out in our Terms and Conditions.
        </p>

        <h2 className="text-2xl font-bold mb-4 text-[#E8D1FF]">
          22. Changes to This Privacy Policy
        </h2>
        <p className="text-gray-300 leading-relaxed mb-4">
          We may update this Privacy Policy from time to time to reflect:
        </p>
        <ul className="list-disc list-inside text-gray-300 space-y-3 mb-6 ml-4">
          <li>Changes to the Calai service</li>
          <li>Changes to the technology we use</li>
          <li>Changes to our data practices</li>
          <li>Changes to applicable laws or regulations</li>
          <li>Changes to our business operations</li>
        </ul>
        <p className="text-gray-300 leading-relaxed mb-10">
          The latest version will be published on our website and the "Last updated" date will be changed accordingly.
          Where appropriate, we may provide additional notice of material changes.
        </p>

        <h2 className="text-2xl font-bold mb-4 text-[#E8D1FF]">
          23. Contact Us
        </h2>
        <p className="text-gray-300 leading-relaxed mb-6">
          For questions about this Privacy Policy, requests relating to your personal information, or concerns about how information is handled, please contact:
        </p>
        <p className="text-gray-300 leading-relaxed mb-6">
          <strong>Calai</strong><br />
          Operated by: Calai Ltd.<br />
          Company number: 16995419<br />
          Registered office: London, UK.<br />
          Email: <a href="mailto:support@calai.info" className="text-[#E8D1FF] hover:underline">support@calai.info</a><br />
          Website: <a href="https://www.calai.info" target="_blank" rel="noopener noreferrer" className="text-[#E8D1FF] hover:underline">www.calai.info</a>
        </p>
        <p className="text-gray-300 leading-relaxed mb-10">
          For matters concerning subscriptions, service usage, AI limitations, business responsibilities, payments, additional usage charges, cancellations, service availability and other contractual matters, please refer to our Terms and Conditions.
        </p>
      </main>
    </div>
  );
};

export default PrivacyPolicy;

import Header from "@/components/Layout/Header";
import React from "react";
import Footer from "@/components/Footer";

const PrivacyPolicyPage = () => {
  return (
    <div>
      <Header />
      <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-sans">
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 sm:p-8 lg:p-10">
          {/* Privacy Policy Title */}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4 text-center">
            BlackAndSell Privacy Policy
          </h1>

          {/* Last Updated Date */}
          <p className="text-sm text-gray-500 mb-6 text-center">
            <strong className="font-semibold">Last Updated:</strong> July 23,
            2025
          </p>

          {/* Introduction */}
          <p className="text-gray-700 mb-6 leading-relaxed">
            This Privacy Policy describes how{" "}
            <span className="font-semibold">BlackAndSell</span> ("we," "our," or
            "us") collects, uses, and discloses your information when you use
            our mobile application,{" "}
            <span className="font-semibold">BlackAndSell</span> (the "App"),
            which serves as a marketplace, social media platform, learning
            management system (LMS), and service provider platform.
          </p>
          <p className="text-gray-700 mb-8 leading-relaxed">
            By using the App, you agree to the collection and use of information
            in accordance with this Privacy Policy. If you do not agree with the
            terms of this Privacy Policy, please do not use the App.
          </p>

          {/* Section 1: Information We Collect */}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
            1. Information We Collect
          </h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            We collect various types of information to provide and improve the
            BlackAndSell App, including its marketplace, social media, LMS, and
            service provider features.
          </p>

          {/* Subsection 1.1: Personal Data */}
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-3">
            1.1. Personal Data
          </h3>
          <p className="text-gray-700 mb-4 leading-relaxed">
            While using BlackAndSell, we may ask you to provide certain
            personally identifiable information to contact or identify you
            ("Personal Data"). This may include, but is not limited to:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-6 pl-4 space-y-2">
            <li>Email address</li>
            <li>First name and last name</li>
            <li>Phone number</li>
            <li>Address, State, Province, ZIP/Postal code, City</li>
            <li>
              Payment information (for marketplace transactions or service
              bookings)
            </li>
            <li>
              Profile information (e.g., bio, profile picture, business details)
            </li>
          </ul>

          {/* Subsection 1.2: Usage Data */}
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-3">
            1.2. Usage Data
          </h3>
          <p className="text-gray-700 mb-4 leading-relaxed">
            We collect information that your device sends when you use
            BlackAndSell ("Usage Data"), including when you interact with the
            marketplace, social media features, LMS, or service provider
            functionalities.
          </p>
          <p className="text-gray-700 mb-6 leading-relaxed">
            This Usage Data may include your device's Internet Protocol address
            (e.g., IP address), browser type, browser version, pages visited
            within the App, time and date of your visit, time spent on those
            pages, unique device identifiers, and other diagnostic data. For
            mobile access, this may include your device type, unique device ID,
            mobile operating system, mobile browser type, and other diagnostic
            data.
          </p>

          {/* Subsection 1.3: Camera Access and Image Collection */}
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-3">
            1.3. Camera Access and Image Collection
          </h3>
          <p className="text-gray-700 mb-4 leading-relaxed">
            BlackAndSell may request access to your device’s camera for specific
            functionalities, including:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 pl-4 space-y-2">
            <li>
              <strong className="font-semibold">Marketplace Listings:</strong>{" "}
              To capture images of products or services you wish to list or
              sell.
            </li>
            <li>
              <strong className="font-semibold">Social Media Posts:</strong> To
              create and share posts, stories, or other content on the social
              media platform.
            </li>
            <li>
              <strong className="font-semibold">Profile Customization:</strong>{" "}
              To upload a profile picture or other images for your user or
              business profile.
            </li>
            <li>
              <strong className="font-semibold">Identity Verification:</strong>{" "}
              For verifying identity during account creation, marketplace
              transactions, or service provider bookings, where a photo of your
              ID may be required.
            </li>
            <li>
              <strong className="font-semibold">LMS Content:</strong> To upload
              images or videos for course materials or user-generated content
              within the LMS.
            </li>
          </ul>
          <p className="text-gray-700 mb-3 leading-relaxed font-bold">
            Important Notes Regarding Camera Access:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-6 pl-4 space-y-2">
            <li>
              <strong className="font-semibold">Explicit Consent:</strong> We
              will always request your explicit permission before accessing your
              camera. You can manage permissions via your device settings.
            </li>
            <li>
              <strong className="font-semibold">
                No Storage Without Upload:
              </strong>{" "}
              We <strong className="font-bold">do not</strong> store or share
              photos or videos unless you choose to upload them for a specific
              purpose (e.g., product listings, social posts, or profile
              updates).
            </li>
            <li>
              <strong className="font-semibold">No Unintended Access:</strong>{" "}
              We <strong className="font-bold">do not</strong> record video or
              audio without your express permission and only for features
              requiring such access (e.g., video posts or LMS content).
            </li>
            <li>
              <strong className="font-semibold">Purpose-Limited Use:</strong>{" "}
              Uploaded images or videos are used only for the intended purpose
              (e.g., product images for listings, profile pictures for display).
            </li>
            <li>
              <strong className="font-semibold">
                No Background Recording:
              </strong>{" "}
              The App does not capture images or videos in the background
              without your interaction.
            </li>
          </ul>

          {/* Subsection 1.4: Location Data */}
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-3">
            1.4. Location Data
          </h3>
          <p className="text-gray-700 mb-4 leading-relaxed">
            With your permission, we may collect and store information about
            your location ("Location Data") to enhance features such as
            marketplace search, service provider availability, or location-based
            social media interactions.
          </p>
          <p className="text-gray-700 mb-6 leading-relaxed">
            You can enable or disable location services at any time through your
            device settings.
          </p>

          {/* Section 2: Use of Data */}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
            2. Use of Data
          </h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            <span className="font-semibold">BlackAndSell</span> uses collected
            data to:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-6 pl-4 space-y-2">
            <li>
              Operate and maintain the App’s marketplace, social media, LMS, and
              service provider features
            </li>
            <li>Facilitate transactions and bookings in the marketplace</li>
            <li>
              Enable social media interactions, such as posts, comments, and
              follows
            </li>
            <li>Deliver and manage LMS courses and user progress</li>
            <li>Notify you about updates, changes, or account activities</li>
            <li>Provide customer support and respond to inquiries</li>
            <li>
              Analyze usage to improve the App’s functionality and user
              experience
            </li>
            <li>
              Monitor and prevent technical issues or fraudulent activities
            </li>
            <li>
              Provide personalized content, recommendations, or promotions
              (unless you opt out)
            </li>
            <li>
              Fulfill contractual obligations, including billing and payments
            </li>
            <li>Comply with legal requirements or enforce our policies</li>
          </ul>

          {/* Section 3: Retention of Data */}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
            3. Retention of Data
          </h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            <span className="font-semibold">BlackAndSell</span> retains your
            Personal Data only as long as necessary for the purposes outlined in
            this Privacy Policy, such as providing marketplace, social media,
            LMS, and service provider functionalities.
          </p>
          <p className="text-gray-700 mb-6 leading-relaxed">
            We retain Usage Data for internal analysis, typically for a shorter
            period, unless needed for security, functionality improvements, or
            legal obligations.
          </p>

          {/* Section 4: Transfer of Data */}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
            4. Transfer of Data
          </h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            Your information, including Personal Data, may be transferred to and
            stored on servers outside your state, province, or country, where
            data protection laws may differ.
          </p>
          <p className="text-gray-700 mb-6 leading-relaxed">
            By using BlackAndSell, you consent to such transfers. We take
            reasonable steps to ensure your data is handled securely and in
            accordance with this Privacy Policy.
          </p>

          {/* Section 5: Disclosure of Data */}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
            5. Disclosure of Data
          </h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            We may disclose your information in the following cases:
          </p>

          {/* Subsection 5.1: Legal Requirements */}
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-3">
            5.1. Legal Requirements
          </h3>
          <p className="text-gray-700 mb-6 leading-relaxed">
            <span className="font-semibold">BlackAndSell</span> may disclose
            your Personal Data if required by law or in response to valid
            requests from public authorities.
          </p>

          {/* Subsection 5.2: Business Transactions */}
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-3">
            5.2. Business Transactions
          </h3>
          <p className="text-gray-700 mb-6 leading-relaxed">
            If <span className="font-semibold">BlackAndSell</span> is involved
            in a merger, acquisition, or asset sale, your Personal Data may be
            transferred. We will notify you before such a transfer occurs.
          </p>

          {/* Subsection 5.3: Other Cases */}
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-3">
            5.3. Other Cases
          </h3>
          <ul className="list-disc list-inside text-gray-700 mb-6 pl-4 space-y-2">
            <li>To subsidiaries or affiliates</li>
            <li>To service providers supporting our App’s operations</li>
            <li>To fulfill the purpose for which you provided the data</li>
            <li>With your consent for other purposes</li>
            <li>
              To protect the rights, property, or safety of BlackAndSell, our
              users, or others
            </li>
          </ul>

          {/* Section 6: Security of Data */}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
            6. Security of Data
          </h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            We prioritize the security of your data, using commercially
            acceptable measures to protect it. However, no method of
            transmission or storage is 100% secure, and we cannot guarantee
            absolute security.
          </p>

          {/* Section 7: Service Providers */}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
            7. Service Providers
          </h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            We engage third-party service providers to support BlackAndSell’s
            operations, such as payment processing, cloud storage, or analytics.
            These providers access your Personal Data only to perform specific
            tasks and are obligated to protect it.
          </p>

          {/* Section 8: Links to Other Sites */}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
            8. Links to Other Sites
          </h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            BlackAndSell may include links to third-party sites. We are not
            responsible for their content or privacy practices. Please review
            the privacy policies of any third-party sites you visit.
          </p>

          {/* Section 9: Children's Privacy */}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
            9. Children's Privacy
          </h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            BlackAndSell is not intended for children under 13. We do not
            knowingly collect Personal Data from children under 13. If we become
            aware of such data, we will take steps to delete it.
          </p>

          {/* Section 10: Changes to This Privacy Policy */}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
            10. Changes to This Privacy Policy
          </h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            We may update this Privacy Policy periodically. Changes will be
            posted on this page, and we will notify you via email or an in-App
            notice. Please review this policy regularly.
          </p>

          {/* Section 11: Contact Us */}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
            11. Contact Us
          </h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            For questions about this Privacy Policy, contact us:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-6 pl-4 space-y-2">
            <li>
              By email:{" "}
              <span className="font-semibold">blackandsell@gmail.com</span>
            </li>
            <li>
              By visiting:{" "}
              <span className="font-semibold">
                https://blacknsell.vercel.app/contact
              </span>
            </li>
          </ul>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
export const metadata = {
  title: "Privacy Policy | BlackAndSell",
  description: "Learn about our privacy practices and how we handle your data.",
};

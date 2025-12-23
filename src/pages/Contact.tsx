import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactPageClient from "@/components/contact/ContactPageClient";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <ContactPageClient />
      </main>
      <Footer />
    </div>
  );
};

export default Contact;

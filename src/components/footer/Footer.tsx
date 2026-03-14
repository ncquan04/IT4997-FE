import { useI18n } from "../../contexts/I18nContext";
import CustomerServiceIcon from "../../icons/CustomerServiceIcon";
import DeliveryIcon from "../../icons/DeliveryIcon";
import AccountSection from "./components/AccountSection";
import FeatureCard from "./components/FeatureCard";
import QuickLinkSection from "./components/QuickLinkSection";
import SupportSection from "./components/SupportSection";

const Footer = () => {
  const i18n = useI18n();

  return (
    <main className="flex flex-col pt-12 sm:pt-16 md:pt-24 lg:pt-32 gap-12 md:gap-16 lg:gap-24">
      <section className="flex flex-col sm:flex-row flex-wrap justify-center items-center sm:items-start gap-8 md:gap-12 lg:gap-16 px-4 sm:px-6 md:px-8" aria-label="Features">
        <FeatureCard 
          icon={<DeliveryIcon width={40} height={40}/>}
          title={i18n.t("FREE AND FAST DELIVERY")}
          description={i18n.t("Free delivery for all orders over $140")}
        />
        <FeatureCard 
          icon={<CustomerServiceIcon width={40} height={40}/>}
          title={i18n.t("24/7 CUSTOMER SERVICE")}
          description={i18n.t("Friendly 24/7 customer support")}
        />
        <FeatureCard 
          icon={<CustomerServiceIcon width={40} height={40}/>}
          title={i18n.t("MONEY BACK GUARANTEE")}
          description={i18n.t("We return money within 30 days")}
        />
      </section>
      <footer className="w-full bg-black pt-8 md:pt-12 pb-6 px-4 sm:px-6 md:px-8 lg:px-12" role="contentinfo">
        <nav className="flex flex-col md:flex-row justify-center md:justify-around gap-8 md:gap-6 pb-8 md:pb-12 max-w-7xl mx-auto" aria-label="Footer navigation">
          <section className="flex-1 md:flex-none md:max-w-40" aria-label="Brand">
            <p className="text-xl font-semibold text-white">Apex</p>
          </section>
          <SupportSection />
          <AccountSection />
          <QuickLinkSection />
        </nav>
        <p className="text-sm md:text-base text-center text-gray-500">
          &copy; 2025 Apex. {i18n.t("All rights reserved.")}
        </p>
      </footer>
    </main>
  );
};

export default Footer;

import PageTransition from "../../components/common/PageTransition";
import { HORIZONTAL_PADDING_REM } from "../../constants";
import EmailIcon from "../../icons/EmailIcon";
import PhoneIcon2 from "../../icons/PhoneIcon2";
import ContactInfo from "./components/ContactInfo";
import ContactSubmitForm from "./components/ContactSubmitForm";

const ContactPage = () => {
  return (
    <PageTransition>
      <main
        className="w-full pt-4 md:pt-8 pb-8 md:pb-12 flex flex-col lg:flex-row items-stretch gap-4 md:gap-8 px-4 sm:px-8 md:px-12 lg:px-[var(--horizontal-padding)]"
        style={
          {
            "--horizontal-padding": `${HORIZONTAL_PADDING_REM}rem`,
          } as React.CSSProperties
        }
      >
        <aside className="flex flex-col gap-4 md:gap-8 w-full lg:max-w-[340px] p-4 md:p-8 shadow-sm rounded-sm">
          <ContactInfo
            icon={<PhoneIcon2 />}
            title={"Call To Us"}
            description={[
              "We are available 24/7, 7 days a week.",
              "Phone: +8801611112222",
            ]}
          />
          <hr className="w-full h-[1px] bg-black border-0" />
          <ContactInfo
            icon={<EmailIcon />}
            title={"Write To Us"}
            description={[
              "Fill out our form and we will contact you within 24 hours.",
              "Emails: customer@apex.com",
              "Emails: support@apex.com",
            ]}
          />
        </aside>
        <ContactSubmitForm />
      </main>
    </PageTransition>
  );
};

export default ContactPage;

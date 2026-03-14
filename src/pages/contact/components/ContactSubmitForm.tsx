import { useState } from "react";
import { useI18n } from "../../../contexts/I18nContext";
import CommonButton from "../../../components/common/CommonButton";

const ContactSubmitForm = () => {
  const i18n = useI18n();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmitForm = () => {};

  const onButtonClick = () => {};

  return (
    <section className="self-stretch flex flex-1 flex-col gap-4 shadow-sm rounded-sm p-4 md:p-8">
      <form
        onSubmit={handleSubmitForm}
        className="flex flex-col gap-4 md:gap-6 h-full"
      >
        <div className="w-full flex flex-col md:flex-row gap-3 md:gap-4 justify-between items-stretch md:items-center">
          <input
            type="text"
            className="w-full md:w-1/3 h-[45px] md:h-[50px] px-3 md:px-4 py-2 rounded-sm bg-secondary text-sm md:text-base text-text2 font-normal"
            placeholder={i18n.t("Your Name")}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
            aria-label={i18n.t("Your Name")}
            required
          />
          <input
            type="email"
            className="w-full md:w-1/3 h-[45px] md:h-[50px] px-3 md:px-4 py-2 rounded-sm bg-secondary text-sm md:text-base text-text2 font-normal"
            placeholder={i18n.t("Your Email")}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            aria-label={i18n.t("Your Email")}
            required
          />
          <input
            type="tel"
            className="w-full md:w-1/3 h-[45px] md:h-[50px] px-3 md:px-4 py-2 rounded-sm bg-secondary text-sm md:text-base text-text2 font-normal"
            placeholder={i18n.t("Your Phone")}
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
            }}
            aria-label={i18n.t("Your Phone")}
            required
          />
        </div>
        <textarea
          className="flex flex-1 min-h-[150px] md:min-h-[200px] px-3 md:px-4 py-3 md:py-4 rounded-sm bg-secondary text-sm md:text-base text-text2 font-normal resize-none"
          placeholder={i18n.t("Your Message")}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
          }}
          aria-label={i18n.t("Your Message")}
          required
        />
        <div className="w-full sm:w-[215px] h-[50px] md:h-[56px] sm:ml-auto">
          <CommonButton label="Send Message" onClick={onButtonClick} />
        </div>
      </form>
    </section>
  );
};

export default ContactSubmitForm;

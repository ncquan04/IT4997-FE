import { useI18n } from "../../../contexts/I18nContext";
import OurStoryImage from "../../../assets/images/OurStory.png";

const OurStory = () => {
  const i18n = useI18n();

  return (
    <section className="flex flex-col lg:flex-row justify-between items-center gap-8 md:gap-12 lg:gap-16 lg:-mr-[var(--horizontal-padding)]">
      <article className="flex flex-1 flex-wrap flex-col gap-4 md:gap-6 lg:gap-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-semibold text-black">
          {i18n.t("Our Story")}
        </h1>
        <p className="text-sm sm:text-base font-medium text-black whitespace-pre-line">
          {i18n.t(
            "Launched in 2015, Exclusive is South Asia's premier online shopping makterplace with an active presense in Bangladesh. Supported by wide range of tailored marketing, data and service solutions, Exclusive has 10,500 sallers and 300 brands and serves 3 millioons customers across the region. \n\n Exclusive has more than 1 Million products to offer, growing at a very fast. Exclusive offers a diverse assotment in categories ranging from consumer."
          )}
        </p>
      </article>
      <figure className="w-full lg:w-auto flex justify-center lg:justify-end">
        <img
          src={OurStoryImage}
          alt="Our Story"
          className="w-full max-w-md lg:max-w-none"
        />
      </figure>
    </section>
  );
};

export default OurStory;

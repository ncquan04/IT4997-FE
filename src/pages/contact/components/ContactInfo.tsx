interface ContactInfoProps {
  icon: React.ReactNode;
  title: string;
  description: string[];
}

const ContactInfo = (props: ContactInfoProps) => {
  return (
    <section className="flex flex-col gap-3 md:gap-4">
      <header className="flex flex-row gap-2 justify-start items-center">
        <div
          className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-secondary2 flex justify-center items-center flex-shrink-0"
          aria-hidden="true"
        >
          {props.icon}
        </div>
        <h2 className="text-sm md:text-base text-black font-medium">
          {props.title}
        </h2>
      </header>
      <address className="not-italic">
        {props.description.map((desc, index) => (
          <p
            key={index}
            className="text-xs md:text-sm text-black font-normal leading-relaxed"
          >
            {desc}
          </p>
        ))}
      </address>
    </section>
  );
};

export default ContactInfo;

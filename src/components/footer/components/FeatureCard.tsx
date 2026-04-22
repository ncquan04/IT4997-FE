interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = (props: FeatureCardProps) => {
  return (
    <div className="flex flex-col gap-1.5 md:gap-2 justify-center items-center text-center w-full md:max-w-70">
      <div className="w-10 h-10 md:w-20 md:h-20 rounded-full bg-[#36373888] flex justify-center items-center">
        <div className="w-8 h-8 md:w-14.5 md:h-14.5 flex justify-center items-center bg-button rounded-full">
          {props.icon}
        </div>
      </div>
      <h3 className="text-black font-semibold text-[10px] leading-tight md:text-xl">
        {props.title}
      </h3>
      <p className="text-black font-medium text-[10px] leading-tight md:text-sm hidden sm:block">
        {props.description}
      </p>
    </div>
  );
};

export default FeatureCard;

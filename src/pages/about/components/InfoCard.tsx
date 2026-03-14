import type { JSX } from "react";
import { useI18n } from "../../../contexts/I18nContext";

interface InfoCardProps {
  icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
  title: string;
  description: string;
}

const InfoCard = (props: InfoCardProps) => {
  const i18n = useI18n();

  return (
    <article className="w-full max-w-[270px] h-[200px] sm:h-[230px] rounded-sm border-1 border-[#00000033] flex flex-col justify-center items-center gap-3 sm:gap-4 p-4">
      <div className="flex w-[70px] h-[70px] sm:w-[80px] sm:h-[80px] rounded-full justify-center items-center bg-[#36373833]">
        <div className="flex w-[50px] h-[50px] sm:w-[58px] sm:h-[58px] rounded-full bg-black justify-center items-center">
          <props.icon aria-hidden="true" />
        </div>
      </div>
      <h3 className="text-2xl sm:text-3xl text-black font-bold">
        {i18n.t(props.title)}
      </h3>
      <p className="text-sm sm:text-base font-medium text-black text-center">
        {i18n.t(props.description)}
      </p>
    </article>
  );
};

export default InfoCard;

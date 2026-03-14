import InstagramIcon from "../../../icons/InstagramIcon";
import LinkedInIcon from "../../../icons/LinkedInIcon";
import TwitterIcon from "../../../icons/TwitterIcon";

interface LeaderCardProps {
  name: string;
  position: string;
  image: string;
}

const LeaderCard = (props: LeaderCardProps) => {
  return (
    <article className="flex flex-col items-center sm:items-start gap-3 sm:gap-4 w-full max-w-sm sm:max-w-none">
      <figure className="w-full">
        <img
          src={props.image}
          alt={props.name}
          className="w-full h-auto object-cover"
        />
      </figure>
      <h3 className="text-2xl sm:text-3xl font-medium text-black text-center sm:text-left">
        {props.name}
      </h3>
      <p className="text-sm sm:text-base font-normal text-black text-center sm:text-left">
        {props.position}
      </p>
      <nav
        className="flex flex-row gap-2 sm:gap-3"
        aria-label="Social media links"
      >
        <a href="#" aria-label="Twitter">
          <TwitterIcon className="hover:cursor-pointer w-5 h-5 sm:w-6 sm:h-6" />
        </a>
        <a href="#" aria-label="Instagram">
          <InstagramIcon className="hover:cursor-pointer w-5 h-5 sm:w-6 sm:h-6" />
        </a>
        <a href="#" aria-label="LinkedIn">
          <LinkedInIcon className="hover:cursor-pointer w-5 h-5 sm:w-6 sm:h-6" />
        </a>
      </nav>
    </article>
  );
};

export default LeaderCard;

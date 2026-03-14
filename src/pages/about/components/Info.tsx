import DollarIcon from "../../../icons/DollarIcon";
import MarketIcon from "../../../icons/MarketIcon";
import MoneyBagIcon from "../../../icons/MoneyBagIcon";
import ShoppingBagIcon from "../../../icons/ShoppingBagIcon";
import InfoCard from "./InfoCard";

const Infos = [
  {
    icon: MarketIcon,
    title: "10.5K",
    description: "Sellers active our site",
  },
  {
    icon: DollarIcon,
    title: "33K",
    description: "Monthly product sale",
  },
  {
    icon: ShoppingBagIcon,
    title: "45.5K",
    description: "Customers active in our site",
  },
  {
    icon: MoneyBagIcon,
    title: "25K",
    description: "Annual gross sale in our site",
  },
];

const Info = () => {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 justify-items-center">
      {Infos.map((info, index) => (
        <InfoCard
          key={index}
          icon={info.icon}
          title={info.title}
          description={info.description}
        />
      ))}
    </section>
  );
};

export default Info;

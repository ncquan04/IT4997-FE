import TomCruiseImage from "../../../assets/images/TomCruise.png";
import EmmaWatsonImage from "../../../assets/images/EmmaWatson.png";
import WillSmithImage from "../../../assets/images/WillSmith.png";
import LeaderCard from "./LeaderCard";

const LEADERS = [
  {
    name: "Tom Cruise",
    position: "Founder & Chairman",
    image: TomCruiseImage,
  },
  {
    name: "Emma Watson",
    position: "Managing Director",
    image: EmmaWatsonImage,
  },
  {
    name: "Will Smith",
    position: "Product Designer",
    image: WillSmithImage,
  },
];

const Leaders = () => {
  return (
    <section className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-12 justify-items-center lg:justify-items-stretch">
      {LEADERS.map((leader, index) => (
        <LeaderCard
          key={index}
          name={leader.name}
          position={leader.position}
          image={leader.image}
        />
      ))}
    </section>
  );
};

export default Leaders;

import StarIcon from "../../../icons/StarIcon";

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex flex-row gap-1">
      {Array.from({ length: 5 }, (_, index) => (
        <StarIcon
          key={index}
          width={20}
          height={20}
          fill={index < rating ? "#FFAD33" : '#000'}
          opacity={index < rating ? 1 : 0.25}
        />
      ))}
    </div>
  );
};

export default StarRating;

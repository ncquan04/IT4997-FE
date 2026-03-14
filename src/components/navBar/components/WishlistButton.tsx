import HeartIcon from "../../../icons/HeartIcon";

const WishlistButton = () => {
  const handleClick = () => {
    window.location.href = "/wishlist";
  };

  return (
    <button
      type="button"
      className="p-2 md:px-4 md:py-0 justify-center items-center hover:cursor-pointer"
      onClick={handleClick}
      aria-label="Open wishlist"
    >
      <HeartIcon />
    </button>
  );
};

export default WishlistButton;

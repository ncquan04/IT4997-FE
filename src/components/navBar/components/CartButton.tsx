import CartIcon from "../../../icons/CartIcon";

const CartButton = () => {
  const handleClick = () => {
    window.location.href = "/cart";
  };

  return (
    <button
      type="button"
      className="p-2 justify-center items-center hover:cursor-pointer"
      onClick={handleClick}
      aria-label="Open cart"
    >
      <CartIcon width={24} height={24} />
    </button>
  );
};

export default CartButton;

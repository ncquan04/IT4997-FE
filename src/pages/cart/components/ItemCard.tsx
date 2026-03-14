import { useState } from "react";
import QuantitySelector from "../../../components/common/quantitySelector/QuantitySelector";
import { formatPrice } from "../../../utils";
import type { ICartResponseItem } from "../../../services/api/api.cart";
import { useAppDispatch } from "../../../redux/store";
import cartAsync from "../../../redux/async-thunk/cart.thunk";
import TrashIcon from "../../../icons/TrashIcon";

const ItemCard = ({ item }: { item: ICartResponseItem }) => {
  const dispatch = useAppDispatch();
  const [quantity, setQuantity] = useState<number>(item.quantity);

  const product = item.product;
  const variant = product.selectedVariant;

  const handleQuantityChange = (newQuantity: number) => {
    if (variant) {
      dispatch(
        cartAsync.updateCartItemThunk({
          productId: product._id,
          variantId: variant._id,
          quantity: newQuantity,
        })
      ).then(() => {
        dispatch(cartAsync.fetchCart());
      });
    }
  };

  const handleRemove = () => {
    if (variant) {
      dispatch(
        cartAsync.removeFromCartThunk({
          productId: product._id,
          variantId: variant._id,
        })
      ).then(() => {
        dispatch(cartAsync.fetchCart());
      });
    }
  };

  const price = variant?.price || 0;
  const subtotal = price * quantity;

  return (
    <article className="flex flex-col md:flex-row justify-between items-center px-8 py-4 shadow-sm rounded-lg gap-4 md:gap-0">
      <div className="w-full md:w-4/12 flex justify-start items-center gap-4">
        <div className="w-24 h-24 shrink-0 flex items-center justify-center bg-gray-50 rounded-md">
          <img
            src={variant?.images?.[0]}
            alt={product.title}
            className="max-w-full max-h-full object-contain"
          />
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-medium text-text2 line-clamp-2">
            {product.title}
          </h3>
          {variant && (
            <p className="text-sm text-text2 opacity-80">
              {variant.colorName} - {variant.version}
            </p>
          )}
        </div>
      </div>
      <div className="w-full md:w-2/12 flex justify-between md:justify-center items-center">
        <span className="md:hidden text-base font-medium text-text2">
          Price:
        </span>
        <span className="text-base font-normal text-text2">
          {formatPrice(price)}
        </span>
      </div>
      <div className="w-full md:w-3/12 flex justify-center">
        <QuantitySelector
          maxQuantity={variant?.quantity || 10}
          quantity={quantity}
          setQuantity={setQuantity}
          onQuantityChange={handleQuantityChange}
        />
      </div>
      <div className="w-full md:w-2/12 flex justify-between md:justify-end items-center gap-4">
        <div className="flex items-center gap-2 justify-between w-full md:w-auto">
          <span className="md:hidden text-base font-medium text-text2">
            Subtotal:
          </span>
          <span className="text-base font-normal text-text2">
            {formatPrice(subtotal)}
          </span>
        </div>
      </div>
      <div className="w-full md:w-1/12 flex justify-end items-center">
        <button
          onClick={handleRemove}
          className="group p-2 hover:bg-red-50 rounded-full transition-all duration-200"
          title="Remove item"
        >
          <TrashIcon
            width={20}
            height={20}
            className="fill-red-500 group-hover:scale-110 transition-transform duration-200"
          />
        </button>
      </div>
    </article>
  );
};

export default ItemCard;

import PageTransition from "../../components/common/PageTransition";
import { useEffect } from "react";
import Wishlist from "./components/Wishlist";
import { HORIZONTAL_PADDING_REM } from "../../constants";
import JustForYou from "./components/JustForYou";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { fetchWishlist } from "../../redux/async-thunk/wishlist.thunk";

const WishlistPage = () => {
  const dispatch = useAppDispatch();
  const { wishlistItems, isLoading } = useAppSelector((state) => state.wishlist);

  useEffect(() => {
    const promise = dispatch(fetchWishlist());
    return () => {
        promise.abort();
    };
  }, [dispatch]);
  
  return (
    <PageTransition>
      <main
        className="flex flex-col gap-12 md:gap-16 lg:gap-24 px-4 sm:px-6 md:px-8 lg:px-[var(--horizontal-padding)] py-4 md:py-6 lg:py-8"
        style={
          {
            "--horizontal-padding": `${HORIZONTAL_PADDING_REM}rem`,
          } as React.CSSProperties
        }
      >
        <section aria-labelledby="wishlist-heading">
          <div className="flex items-center justify-between mb-6">
            <h1 id="wishlist-heading" className="text-xl font-medium">
              Wishlist ({wishlistItems.length})
            </h1>
          </div>
          
          {wishlistItems.length > 0 ? (
             <Wishlist products={wishlistItems} />
          ) : (
            !isLoading && <div className="text-center py-10">Your wishlist is empty.</div>
          )}
        </section>
        <section aria-labelledby="just-for-you-heading">
          <h2 id="just-for-you-heading" className="sr-only">
            Just For You
          </h2>
          <JustForYou />
        </section>
      </main>
    </PageTransition>
  );
};

export default WishlistPage;

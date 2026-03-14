import SectionTag from "../../../components/common/sectionTag/SectionTag";
import { Product } from "../../../shared/models/product-model";
import ItemBanner from "../components/ItemBanner";

interface FeaturedSectionProps {
  featuredProducts: Product[];
}

const FeaturedSection = (props: FeaturedSectionProps) => {
  const fiveFeaturedProducts = props.featuredProducts.slice(0, 5);

  return (
    <section
      className="flex flex-col gap-4 md:gap-6 lg:gap-8"
      aria-labelledby="featured-section-title"
    >
      <div className="flex flex-row justify-between items-center">
        <SectionTag title="Featured" />
      </div>
      <div
        className="flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-8"
        role="list"
      >
        {fiveFeaturedProducts[0] && (
          <div
            className="w-full lg:w-128 h-64 sm:h-96 lg:h-128"
            role="listitem"
          >
            <ItemBanner ratio="1:1" item={fiveFeaturedProducts[0]} />
          </div>
        )}
        <div className="flex flex-1 flex-col gap-4 md:gap-6 lg:gap-8">
          {fiveFeaturedProducts[1] && (
            <div className="w-full h-48 sm:h-56 md:h-60" role="listitem">
              <ItemBanner ratio="16:9" item={fiveFeaturedProducts[1]} />
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 lg:gap-8">
            {fiveFeaturedProducts[2] && (
              <div
                className="w-full sm:w-1/2 h-48 sm:h-56 md:h-60"
                role="listitem"
              >
                <ItemBanner ratio="16:9" item={fiveFeaturedProducts[2]} />
              </div>
            )}
            {fiveFeaturedProducts[3] && (
              <div
                className="w-full sm:w-1/2 h-48 sm:h-56 md:h-60"
                role="listitem"
              >
                <ItemBanner ratio="16:9" item={fiveFeaturedProducts[3]} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;

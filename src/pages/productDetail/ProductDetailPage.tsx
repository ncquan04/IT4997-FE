import PageTransition from "../../components/common/PageTransition";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductDetail from "./components/ProductDetail";
import { HORIZONTAL_PADDING_REM } from "../../constants";
import RelatedItems from "./components/RelatedItems";
import type { Product } from "../../shared/models/product-model";
import { fetchProductById } from "../../services/api/api.products";
import ProductSpecs from "./components/ProductSpecs";

const ProductDetailPage = () => {
  const { productId } = useParams<{ productId: string }>();

  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      const product = await fetchProductById(productId!);
      setProduct(product);
    };
    fetchProduct();
  }, [productId]);

  if (!product) {
    return (
      <PageTransition>
        <main className="w-full min-h-screen flex items-center justify-center">
          <section className="text-center">
            <h1 className="text-2xl font-bold text-red-500">
              Product Not Found
            </h1>
            <p className="text-gray-600 mt-2">Product with does not exist.</p>
          </section>
        </main>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <main
        className="flex flex-col gap-8 md:gap-12 lg:gap-16 px-4 sm:px-6 md:px-8 lg:px-(--horizontal-padding) py-4 md:py-6 lg:py-8"
        style={
          {
            "--horizontal-padding": `${HORIZONTAL_PADDING_REM}rem`,
          } as React.CSSProperties
        }
      >
        <ProductDetail product={product} />
        <ProductSpecs specifications={product.specifications} />
        <RelatedItems product={product} />
      </main>
    </PageTransition>
  );
};

export default ProductDetailPage;

import type { ISpecItem } from "../../../shared/models/product-model";

interface ProductSpecsProps {
  specifications: ISpecItem[];
}

const ProductSpecs = ({ specifications }: ProductSpecsProps) => {
  if (!specifications || specifications.length === 0) {
    return null;
  }

  return (
    <section className="w-full flex flex-col gap-4">
      <h2 className="self-start text-xl sm:text-2xl text-black font-semibold text-center">
        Specifications
      </h2>
      <div className="border border-gray-200 rounded-sm overflow-hidden">
        <table className="w-full text-sm text-left text-gray-700">
          <tbody>
            {specifications.map((spec, index) => (
              <tr
                key={index}
                className={`border-b border-gray-100 last:border-none ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                <td className="px-4 py-3 font-medium text-black w-1/3 sm:w-1/4 border-r border-gray-100">
                  {spec.key}
                </td>
                <td className="px-4 py-3 whitespace-pre-wrap">{spec.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ProductSpecs;

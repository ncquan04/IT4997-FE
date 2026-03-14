const SaleTag = ({
  salePercent,
  style,
}: {
  salePercent: number;
  style?: React.CSSProperties;
}) => {
  return (
    <div
      className="pl-3 pr-3 pb-1 pt-1 z-5 bg-secondary2 rounded-sm flex items-center justify-center"
      style={style}
    >
      <span className="text-sm text-white font-medium">-{salePercent}%</span>
    </div>
  );
};

export default SaleTag;

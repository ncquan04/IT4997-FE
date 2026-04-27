const colorMap = {
  blue: "bg-blue-50 border-blue-200 text-blue-700",
  green: "bg-green-50 border-green-200 text-green-700",
  yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
  red: "bg-red-50 border-red-200 text-red-700",
  purple: "bg-purple-50 border-purple-200 text-purple-700",
};

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  color?: keyof typeof colorMap;
}

export const StatCard = ({
  label,
  value,
  sub,
  color = "blue",
}: StatCardProps) => (
  <div className={`border rounded-xl p-3 sm:p-4 ${colorMap[color]}`}>
    <p className="text-xs font-medium opacity-70 mb-1 leading-tight">{label}</p>
    <p className="text-sm sm:text-base lg:text-xl font-bold break-all leading-tight">
      {value}
    </p>
    {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
  </div>
);

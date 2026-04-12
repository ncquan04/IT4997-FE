interface DateRangePickerProps {
  from: string;
  to: string;
  granularity: "day" | "month" | "year";
  onChange: (f: string, t: string, g: "day" | "month" | "year") => void;
}

export const DateRangePicker = ({
  from,
  to,
  granularity,
  onChange,
}: DateRangePickerProps) => (
  <div className="flex flex-wrap items-center gap-3">
    <div className="flex items-center gap-1">
      <label className="text-sm text-gray-500">From</label>
      <input
        type="date"
        value={from}
        className="border border-gray-200 rounded px-2 py-1 text-sm"
        onChange={(e) => onChange(e.target.value, to, granularity)}
      />
    </div>
    <div className="flex items-center gap-1">
      <label className="text-sm text-gray-500">To</label>
      <input
        type="date"
        value={to}
        className="border border-gray-200 rounded px-2 py-1 text-sm"
        onChange={(e) => onChange(from, e.target.value, granularity)}
      />
    </div>
    <select
      value={granularity}
      className="border border-gray-200 rounded px-2 py-1 text-sm"
      onChange={(e) =>
        onChange(from, to, e.target.value as "day" | "month" | "year")
      }
    >
      <option value="day">By Day</option>
      <option value="month">By Month</option>
      <option value="year">By Year</option>
    </select>
  </div>
);

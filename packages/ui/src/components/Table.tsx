import * as React from "react";
import { cn } from "./utils";

export interface Column<T = any> {
  header: string;
  accessor: string;
  render?: (row: T) => React.ReactNode;
}

export interface TableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  className?: string;
  tableClassName?: string;
}

export function Table({ columns, data, className, tableClassName }: TableProps) {
  return (
    <div className={cn("w-full overflow-x-auto border border-slate-100 rounded-xl", className)}>
      <table className={cn("w-full text-left text-sm border-collapse", tableClassName)}>
        <thead className="bg-slate-50/70 border-b border-slate-100">
          <tr>
            {columns.map((col, i) => (
              <th
                key={i}
                className="px-6 py-4 text-slate-500 font-semibold tracking-wider text-xs uppercase"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-10 text-center text-slate-400">
                No items found.
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50/40 transition-colors">
                {columns.map((col, j) => (
                  <td key={j} className="px-6 py-4 text-slate-700 font-medium">
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Table({ columns, data }: any) {
  return (
    <table className="w-full text-left text-sm">
      <thead className="bg-[#393e46]/50 border-b border-[#00adb5]/10">
        <tr>
          {columns.map((col: any, i: number) => (
            <th
              key={i}
              className="px-5 py-4 text-[#eeeeee]/50 font-semibold"
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {data.map((row: any, i: number) => (
          <tr key={i} className="border-b border-[#00adb5]/10">
            {columns.map((col: any, j: number) => (
              <td key={j} className="px-5 py-4">
                {col.render ? col.render(row) : row[col.accessor]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
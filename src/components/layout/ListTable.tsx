/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from "react";
import { ArrowUpDown } from "lucide-react";

export interface Column<T> {
  key: string;
  label: React.ReactNode;
  sortable?: boolean;
  sortKey?: string;
  className?: string;
}

interface ListTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (item: T) => string | number;
  onRowClick?: (item: T, e: React.MouseEvent) => void;
  selectedRowKey?: string | number | null;
  sortConfig?: { field: string; direction: "asc" | "desc" | null } | null;
  onSort?: (field: string) => void;
  renderRowCells?: (item: T) => React.ReactNode;
  renderRow?: (item: T, isSelected: boolean) => React.ReactNode;
  tableId?: string;
  className?: string;
}

export function ListTable<T>({
  columns,
  data,
  rowKey,
  onRowClick,
  selectedRowKey,
  sortConfig,
  onSort,
  renderRowCells,
  renderRow,
  tableId,
  className = "",
}: ListTableProps<T>) {
  return (
    <table id={tableId} className={`min-w-full divide-y divide-gray-200 dark:divide-[#2d2d2d] ${className}`}>
      <thead className="bg-gray-50 dark:bg-[#2d2d2d] sticky top-0 z-20">
        <tr>
          {columns.map((column) => {
            const isSortable = column.sortable && onSort;
            const sortKey = column.sortKey || column.key;
            const isSorted = sortConfig && sortConfig.field === sortKey && sortConfig.direction;

            return (
              <th
                key={column.key}
                scope="col"
                onClick={() => isSortable && onSort(sortKey)}
                className={`px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap select-none ${
                  isSortable ? "cursor-pointer hover:bg-gray-150 dark:hover:bg-[#2d2d2d] transition-colors group" : ""
                } ${column.className || ""}`}
              >
                {isSortable ? (
                  <div className="flex items-center gap-1.5 font-semibold">
                    {column.label}
                    <ArrowUpDown
                      className={`w-3.5 h-3.5 transition-opacity ${
                        isSorted
                          ? "opacity-100 text-primary-600 dark:text-primary-400"
                          : "opacity-0 group-hover:opacity-50 text-gray-400"
                      }`}
                    />
                  </div>
                ) : (
                  column.label
                )}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody className="bg-white dark:bg-[#1e1e1e] divide-y divide-gray-200 dark:divide-[#2d2d2d]">
        {data.map((item) => {
          const key = rowKey(item);
          const isSelected = selectedRowKey === key;
          
          if (renderRow) {
            return <React.Fragment key={key}>{renderRow(item, isSelected)}</React.Fragment>;
          }

          return (
            <tr
              key={key}
              id={`row-${key}`}
              className={`hover:bg-gray-50/50 dark:hover:bg-[#2d2d2d]/30 transition-colors group cursor-pointer ${
                isSelected ? "bg-primary-50/25 dark:bg-primary-950/15" : ""
              }`}
              onClick={(e) => onRowClick && onRowClick(item, e)}
            >
              {renderRowCells ? renderRowCells(item) : null}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default ListTable;

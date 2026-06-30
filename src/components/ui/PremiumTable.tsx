import React, { useRef } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { motion, AnimatePresence } from 'motion/react';
import { Typography } from './Typography';
import { Icon } from './Icon';
import { cn } from '../../utils/cn';
import { GlassSurface } from './GlassSurface';

export interface PremiumTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  emptyStateTitle?: string;
  emptyStateMessage?: string;
  onRowClick?: (row: TData) => void;
  className?: string;
}

export function PremiumTable<TData, TValue>({
  columns,
  data,
  loading = false,
  emptyStateTitle = 'Nenhum registro encontrado',
  emptyStateMessage = 'Não há dados disponíveis para exibição no momento.',
  onRowClick,
  className
}: PremiumTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const tableContainerRef = useRef<HTMLDivElement>(null);

  const { rows } = table.getRowModel();

  // Virtualizer for massive datasets
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 64, // estimated row height
    overscan: 10,
  });

  return (
    <GlassSurface intensity="subtle" className={cn("flex flex-col h-full w-full overflow-hidden border border-white/5", className)}>
      {/* Floating Header */}
      <div className="flex-none border-b border-white/10 bg-slate-900/80 backdrop-blur-md z-20">
        {table.getHeaderGroups().map((headerGroup) => (
          <div key={headerGroup.id} className="flex px-4">
            {headerGroup.headers.map((header) => {
              return (
                <div
                  key={header.id}
                  className="flex h-12 flex-1 items-center px-2"
                  style={{ width: header.getSize() }}
                >
                  {header.isPlaceholder ? null : (
                    <div
                      className={cn(
                        "flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-400 uppercase",
                        header.column.getCanSort() && "cursor-pointer select-none hover:text-white transition-colors"
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <Icon 
                          name={
                            header.column.getIsSorted() === 'asc' ? 'solar:alt-arrow-up-linear' :
                            header.column.getIsSorted() === 'desc' ? 'solar:alt-arrow-down-linear' :
                            'solar:sort-vertical-linear'
                          }
                          className={cn("h-3 w-3", header.column.getIsSorted() ? "text-emerald-400" : "text-slate-600")}
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Body Area with Virtualization & Loading States */}
      <div 
        ref={tableContainerRef}
        className="flex-1 overflow-auto relative custom-scrollbar"
      >
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 p-4 flex flex-col gap-4"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-14 w-full rounded-xl bg-slate-800/30 animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent bg-[length:200%_100%] border border-white/5" />
              ))}
            </motion.div>
          ) : rows.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, filter: 'blur(4px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/50 text-slate-500 mb-4 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                 <Icon name="solar:inbox-line-bold-duotone" className="h-8 w-8" />
              </div>
              <Typography variant="h5" className="text-slate-300">{emptyStateTitle}</Typography>
              <Typography variant="body" color="muted" className="mt-1 max-w-sm">{emptyStateMessage}</Typography>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const row = rows[virtualRow.index];
                return (
                  <div
                    key={row.id}
                    className={cn(
                      "absolute top-0 left-0 w-full flex px-4 transition-colors duration-200 border-b border-white/5 hover:bg-white/[0.02]",
                      row.getIsSelected() && "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/15",
                      onRowClick && "cursor-pointer"
                    )}
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    onClick={() => onRowClick?.(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <div
                        key={cell.id}
                        className="flex flex-1 items-center px-2"
                        style={{ width: cell.column.getSize() }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    ))}
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GlassSurface>
  );
}

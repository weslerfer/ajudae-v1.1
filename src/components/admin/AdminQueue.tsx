/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RefreshCw, CheckSquare, Square, ChevronDown, ChevronUp } from 'lucide-react';
import { Typography } from '../ui/Typography';
import { GlassSurface } from '../ui/GlassSurface';
import { Button } from '../ui/Button';

interface AdminQueueProps<T> {
  title: string;
  description: string;
  items: T[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleAll: () => void;
  isProcessing: boolean;
  renderItemSummary: (item: T) => React.ReactNode;
  renderItemDetails: (item: T) => React.ReactNode;
  onRefresh?: () => void;
  batchActions?: React.ReactNode;
  emptyMessage?: string;
  keyExtractor?: (item: T) => string;
}

export function AdminQueue<T extends { id: string }>({
  title,
  description,
  items,
  selectedIds,
  onToggleSelect,
  onToggleAll,
  isProcessing,
  renderItemSummary,
  renderItemDetails,
  onRefresh,
  batchActions,
  emptyMessage = 'Fila vazia. Nenhuma pendência encontrada.',
  keyExtractor = (item) => item.id,
}: AdminQueueProps<T>) {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const allSelected = items.length > 0 && selectedIds.size === items.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <Typography variant="h4">{title}</Typography>
          <Typography variant="caption" color="secondary">{description}</Typography>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {batchActions && selectedIds.size > 0 && (
            <div className="animate-fade-in flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 mr-2">
                {selectedIds.size} selecionado(s)
              </span>
              {batchActions}
            </div>
          )}
          {onRefresh && (
            <Button variant="secondary" size="sm" onClick={onRefresh} disabled={isProcessing}>
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
      </div>

      <GlassSurface intensity="subtle" className="p-0 border-slate-800 overflow-hidden">
        {/* Header (Mass Select) */}
        {items.length > 0 && (
          <div className="flex items-center px-4 py-3 border-b border-white/5 bg-slate-900/50">
            <button onClick={onToggleAll} className="p-1 -ml-1 mr-3 text-slate-400 hover:text-white transition-colors">
              {allSelected ? <CheckSquare className="w-5 h-5 text-indigo-400" /> : 
               someSelected ? <CheckSquare className="w-5 h-5 text-indigo-400 opacity-50" /> : 
               <Square className="w-5 h-5" />}
            </button>
            <Typography variant="caption" className="font-bold text-slate-400 uppercase tracking-wider">
              Item
            </Typography>
          </div>
        )}

        <div className="divide-y divide-white/5">
          {items.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <Typography variant="body">{emptyMessage}</Typography>
            </div>
          ) : (
            items.map((item) => {
              const id = keyExtractor(item);
              const isSelected = selectedIds.has(id);
              const isExpanded = expandedId === id;

              return (
                <div key={id} className={`transition-colors ${isSelected ? 'bg-indigo-500/5' : 'hover:bg-white/5'}`}>
                  <div className="flex items-center px-4 py-3">
                    <button 
                      onClick={() => onToggleSelect(id)} 
                      className="p-1 -ml-1 mr-3 text-slate-400 hover:text-white transition-colors shrink-0"
                    >
                      {isSelected ? <CheckSquare className="w-5 h-5 text-indigo-400" /> : <Square className="w-5 h-5" />}
                    </button>
                    
                    <div className="flex-1 min-w-0" onClick={() => toggleExpand(id)}>
                      {renderItemSummary(item)}
                    </div>
                    
                    <button 
                      onClick={() => toggleExpand(id)}
                      className="p-2 ml-2 text-slate-500 hover:text-white transition-colors rounded-lg shrink-0"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Drawer Details */}
                  {isExpanded && (
                    <div className="bg-slate-950/50 border-t border-white/5 p-4 animate-fade-in">
                      {renderItemDetails(item)}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </GlassSurface>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import { UserProfile } from '../types';

export interface AuditContext {
  actorId: string;
  action: string;
  targetId: string;
  timestamp: string;
  source: string;
  requestId: string;
}

export function useAdminQueue<T extends { id: string }>(
  adminUser: UserProfile | null,
  initialItems: T[] = []
) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  const generateAuditPayload = (action: string, targetId: string): AuditContext | null => {
    if (!adminUser) return null;
    return {
      actorId: adminUser.id,
      action,
      targetId,
      timestamp: new Date().toISOString(),
      source: 'admin_dashboard',
      requestId: crypto.randomUUID(),
    };
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === items.length && items.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i.id)));
    }
  };

  const executeBatch = async (
    actionName: string,
    actionFn: (ids: string[], audits: AuditContext[]) => Promise<void>
  ) => {
    if (selectedIds.size === 0) return;
    setIsProcessing(true);
    
    const ids = Array.from(selectedIds);
    const audits = ids.map(id => generateAuditPayload(actionName, id)).filter(Boolean) as AuditContext[];

    try {
      await actionFn(ids, audits);
      // Clean selection after success
      setSelectedIds(new Set());
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    items,
    setItems,
    selectedIds,
    toggleSelection,
    toggleAll,
    executeBatch,
    isProcessing,
  };
}

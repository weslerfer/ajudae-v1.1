/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { SystemNotification } from '../types';

export default function GlobalPopupManager() {
  const [popups, setPopups] = useState<SystemNotification[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchPopups = async () => {
      try {
        const res = await api.getNotifications();
        const unreadPopups = (res.notifications || []).filter((n: SystemNotification) => n.tipo === 'popup' && !n.is_read);
        setPopups(unreadPopups);
      } catch(e) {}
    };
    fetchPopups();
    // Re-fetch periodically or just once
    const interval = setInterval(fetchPopups, 30000);
    return () => clearInterval(interval);
  }, []);

  if (popups.length === 0 || currentIndex >= popups.length) return null;

  const currentPopup = popups[currentIndex];

  const handleAcknowledge = async () => {
    try {
      await api.markNotificationRead(currentPopup.id);
      setCurrentIndex(prev => prev + 1);
    } catch(e) {
      console.error(e);
      // Even if it fails, advance so we don't block
      setCurrentIndex(prev => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-indigo-500/20 rounded-3xl w-full max-w-sm shadow-2xl p-6 relative overflow-hidden text-center transform hover:scale-[1.02] transition-transform">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        
        <h3 className="text-lg font-black text-white tracking-widest uppercase font-mono mb-4 text-indigo-400">
          {currentPopup.titulo}
        </h3>
        
        <p className="text-xs text-slate-300 font-sans leading-relaxed mb-6 whitespace-pre-wrap">
          {currentPopup.mensagem}
        </p>

        <button
          onClick={handleAcknowledge}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold uppercase tracking-widest text-xs py-3.5 rounded-xl transition-colors cursor-pointer"
        >
          Ok, Entendi
        </button>
      </div>
    </div>
  );
}

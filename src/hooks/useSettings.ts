/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { UserProfile } from '../types';

export interface AppSettings {
  // Aparência
  tema: 'dark' | 'light' | 'system';
  densidade: 'padrao' | 'compacta';
  reduzirAnimacoes: boolean;
  
  // Notificações
  notifyEmail: boolean;
  notifyPush: boolean;
  notifyFinanceiro: boolean;
  notifyConvites: boolean;
  
  // Privacidade
  perfilPublico: boolean;
  compartilharDadosAnalytics: boolean;
  
  // Segurança Avançada (Mocks)
  doisFatoresAtivo: boolean;
  dispositivosConfiaveis: number;
}

const defaultSettings: AppSettings = {
  tema: 'dark',
  densidade: 'padrao',
  reduzirAnimacoes: false,
  notifyEmail: true,
  notifyPush: true,
  notifyFinanceiro: true,
  notifyConvites: true,
  perfilPublico: false,
  compartilharDadosAnalytics: true,
  doisFatoresAtivo: false,
  dispositivosConfiaveis: 1
};

export function useSettings(user: UserProfile) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  // Load from local storage or backend mock
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`ajudae_settings_${user.id}`);
      if (saved) {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) });
      }
    } catch (e) {
      console.warn('Failed to load settings', e);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      localStorage.setItem(`ajudae_settings_${user.id}`, JSON.stringify(next));
      return next;
    });
  };

  return {
    settings,
    updateSetting,
    loading
  };
}

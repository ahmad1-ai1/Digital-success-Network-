import { devStore } from '../store/devStore';
import { BusinessSettings } from '../types';

export const settingsService = {
  getSettings(): BusinessSettings {
    return devStore.getData().settings;
  },

  updateSettings(
    updates: Partial<BusinessSettings>,
    actorId = 'usr-admin-01'
  ): BusinessSettings & { success: boolean; error?: string } {
    let newSettings: BusinessSettings = { ...devStore.getData().settings };
    devStore.save(data => {
      const prev = JSON.stringify(data.settings);
      data.settings = {
        ...data.settings,
        ...updates
      };
      newSettings = data.settings;

      data.auditLogs.unshift({
        id: `audit-${Date.now()}`,
        actorId,
        actorName: 'DSN Admin',
        action: 'UPDATE_SETTINGS',
        entity: 'BusinessSettings',
        entityId: 'global_settings',
        previousValue: prev,
        newValue: JSON.stringify(data.settings),
        timestamp: new Date().toISOString()
      });
    });
    return {
      ...newSettings,
      success: true
    };
  }
};

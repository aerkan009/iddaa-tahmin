import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hakederi.app',
  appName: 'Prodigy AI',
  webDir: 'dist', // KANKA SADECE BURANIN 'dist' OLDUĞUNDAN EMİN OL
  bundledWebRuntime: false,
  plugins: {
    AdMob: {
      initializeForTesting: true,
    },
  },
};

export default config;

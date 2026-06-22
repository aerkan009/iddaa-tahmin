import { useState, useEffect } from 'react';

export type AdState = 'loading' | 'showing' | 'dismissed';

const APP_OPEN_AD_UNIT_ID = 'ca-app-pub-6440512201259891/3908832715';

export function useCapacitorAdMob(): AdState {
  const [adState, setAdState] = useState<AdState>('loading');

  useEffect(() => {
    let cancelled = false;
    let appListener: { remove: () => void } | undefined;

    const forceDismiss = setTimeout(() => {
      if (!cancelled) setAdState('dismissed');
    }, 5000);

    async function start() {
      try {
        const { Capacitor } = await import('@capacitor/core');

        if (!Capacitor.isNativePlatform()) {
          setAdState('showing');
          await new Promise((r) => setTimeout(r, 2000));
          if (!cancelled) setAdState('dismissed');
          return;
        }

        const { AdMob } = await import('@capacitor-community/admob');
        const { App } = await import('@capacitor/app');

        await AdMob.initialize();

        setAdState('showing');
        await new Promise((r) => setTimeout(r, 1000));
        if (!cancelled) setAdState('dismissed');

        const aListener = await App.addListener('appStateChange', ({ isActive }: { isActive: boolean }) => {
          if (!isActive || cancelled) return;
          AdMob.prepareAppOpenAd({ adId: APP_OPEN_AD_UNIT_ID })
            .then(() => AdMob.showAppOpenAd())
            .catch(() => {});
        });
        appListener = aListener;
      } catch {
        if (!cancelled) {
          setAdState('showing');
          await new Promise((r) => setTimeout(r, 2000));
          if (!cancelled) setAdState('dismissed');
        }
      }
    }

    start();

    return () => {
      cancelled = true;
      clearTimeout(forceDismiss);
      appListener?.remove();
    };
  }, []);

  return adState;
}

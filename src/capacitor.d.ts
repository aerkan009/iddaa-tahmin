declare module '@capacitor/core' {
  export const Capacitor: {
    isNativePlatform: () => boolean;
  };
}

declare module '@capacitor-community/admob' {
  interface ListenerHandle {
    remove: () => void;
  }

  export interface RewardAdOptions {
    adId: string;
    isTesting?: boolean;
  }

  export interface AdMobRewardItem {
    amount?: number;
    type?: string;
  }

  export enum RewardAdPluginEvents {
    Rewarded = 'onRewardedVideoAdReward',
    Dismissed = 'onRewardedVideoAdDismissed',
  }

  export enum BannerAdSize {
    ADAPTIVE_BANNER = 'ADAPTIVE_BANNER',
  }

  export enum BannerAdPosition {
    BOTTOM_CENTER = 'BOTTOM_CENTER',
  }

  export interface BannerAdOptions {
    adId: string;
    adSize: BannerAdSize;
    position: BannerAdPosition;
    margin?: number;
    isTesting?: boolean;
  }

  export const AdMob: {
    initialize: (options?: { requestTrackingAuthorization?: boolean }) => Promise<void>;
    showBanner: (options: BannerAdOptions) => Promise<void>;
    hideBanner: () => Promise<void>;
    prepareAppOpenAd: (options: { adId: string }) => Promise<void>;
    showAppOpenAd: () => Promise<void>;
    prepareRewardVideoAd: (options: RewardAdOptions) => Promise<void>;
    showRewardVideoAd: () => Promise<void>;
    removeAllListeners: () => Promise<void>;
    addListener: (eventName: string, handler: (...args: any[]) => void) => Promise<ListenerHandle>;
  };
}

declare module '@capacitor/app' {
  interface AppStateChangeEvent {
    isActive: boolean;
  }

  interface ListenerHandle {
    remove: () => void;
  }

  export const App: {
    addListener: (eventName: string, handler: (event: AppStateChangeEvent) => void) => Promise<ListenerHandle>;
  };
}

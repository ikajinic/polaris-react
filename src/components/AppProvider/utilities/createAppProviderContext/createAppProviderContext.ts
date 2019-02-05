import {noop} from '@shopify/javascript-utilities/other';
import createAppBridgeApp, {
  getShopOrigin,
  LifecycleHook,
  AppConfig,
  DispatchActionHook,
} from '@shopify/app-bridge';
import {AppProviderProps, Context} from '../../types';
import {StickyManager} from '../withSticky';
import ScrollLockManager from '../ScrollLockManager';
import Intl from '../Intl';
import Link from '../Link';

export interface CreateAppProviderContext extends AppProviderProps {
  stickyManager?: StickyManager;
  scrollLockManager?: ScrollLockManager;
  subscribe?(callback: () => void): void;
  unsubscribe?(callback: () => void): void;
}

export default function createAppProviderContext({
  i18n,
  linkComponent,
  apiKey,
  shopOrigin,
  forceRedirect,
  stickyManager,
  scrollLockManager,
  subscribe = noop,
  unsubscribe = noop,
}: CreateAppProviderContext = {}): Context {
  const intl = new Intl(i18n);
  const link = new Link(linkComponent);
  const appBridge = apiKey
    ? createApp({
        apiKey,
        shopOrigin: shopOrigin || getShopOrigin(),
        forceRedirect,
      })
    : undefined;

  return {
    polaris: {
      intl,
      link,
      stickyManager: stickyManager || new StickyManager(),
      scrollLockManager: scrollLockManager || new ScrollLockManager(),
      subscribe,
      unsubscribe,
      appBridge,
    },
  };
}

export const setClientInterfaceHook: DispatchActionHook = function(next) {
  return function(action) {
    action.clientInterface = {
      name: '@shopify/polaris',
      version: window.Polaris.VERSION,
    };
    return next(action);
  };
};

function createApp(appBridgeConfig: AppConfig) {
  const app = createAppBridgeApp(appBridgeConfig);
  if (app.hooks) {
    app.hooks.set(LifecycleHook.DispatchAction, setClientInterfaceHook);
  }
  return app;
}

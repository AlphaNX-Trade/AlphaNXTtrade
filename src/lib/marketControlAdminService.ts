import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { createAuditLog } from '@/lib/auditLogService';

export interface MarketControls {
  marketEnabled: boolean;
  tradingEnabled: boolean;
  futuresEnabled: boolean;
  optionsEnabled: boolean;
  commodityEnabled: boolean;
  disabledStocks: string[];
}

const LOCAL_MARKET_CONTROLS_KEY = 'alphanxt_market_controls';

const DEFAULT_CONTROLS: MarketControls = {
  marketEnabled: true,
  tradingEnabled: true,
  futuresEnabled: true,
  optionsEnabled: true,
  commodityEnabled: true,
  disabledStocks: [],
};

export function getLocalMarketControls(): MarketControls {
  try {
    const raw = localStorage.getItem(LOCAL_MARKET_CONTROLS_KEY);
    return raw ? { ...DEFAULT_CONTROLS, ...JSON.parse(raw) } : DEFAULT_CONTROLS;
  } catch {
    return DEFAULT_CONTROLS;
  }
}

export async function fetchMarketControls(): Promise<MarketControls> {
  try {
    const ref = doc(db, 'system_settings', 'market_controls');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as MarketControls;
      const combined = { ...DEFAULT_CONTROLS, ...data };
      localStorage.setItem(LOCAL_MARKET_CONTROLS_KEY, JSON.stringify(combined));
      return combined;
    }
  } catch (err) {
    console.warn('Failed to fetch market controls from Firestore, using local:', err);
  }
  return getLocalMarketControls();
}

export async function updateMarketControls(
  adminEmail: string,
  adminUid: string,
  newControls: MarketControls,
  reason = 'Admin toggle market settings',
): Promise<void> {
  const prevControls = getLocalMarketControls();
  localStorage.setItem(LOCAL_MARKET_CONTROLS_KEY, JSON.stringify(newControls));

  try {
    const ref = doc(db, 'system_settings', 'market_controls');
    await setDoc(ref, {
      ...newControls,
      updatedAt: serverTimestamp(),
      updatedBy: adminEmail,
    });
  } catch (err) {
    console.warn('Failed to persist market controls to Firestore:', err);
  }

  await createAuditLog({
    adminEmail,
    adminUid,
    actionCategory: 'MARKET',
    actionName: 'UPDATE_MARKET_CONTROLS',
    reason,
    previousState: JSON.stringify(prevControls),
    newState: JSON.stringify(newControls),
    details: `Updated market availability settings`,
  });
}

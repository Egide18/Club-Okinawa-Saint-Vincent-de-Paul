/** Détection du type d'appareil / téléphone à partir du User-Agent (donnée collectée RGPD). */

export interface DeviceInfo {
  raw: string;
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  phoneModel: string;
  os: string;
  browser: string;
}

export function parseUserAgent(ua: string | null | undefined): DeviceInfo {
  const raw = (ua || '').slice(0, 500);
  const lower = raw.toLowerCase();

  let deviceType: DeviceInfo['deviceType'] = 'unknown';
  if (/tablet|ipad|playbook|silk/.test(lower) || (/android/.test(lower) && !/mobile/.test(lower))) {
    deviceType = 'tablet';
  } else if (/mobile|iphone|ipod|android|blackberry|iemobile|opera mini|phone/.test(lower)) {
    deviceType = 'mobile';
  } else if (raw.length > 0) {
    deviceType = 'desktop';
  }

  // Modèle de téléphone
  let phoneModel = 'Inconnu';
  if (/iphone/.test(lower)) {
    const m = raw.match(/iPhone(?:; CPU[^)]*)?/i);
    phoneModel = m ? `Apple ${m[0].slice(0, 40)}` : 'Apple iPhone';
  } else if (/ipad/.test(lower)) {
    phoneModel = 'Apple iPad';
  } else {
    const androidModel = raw.match(/Android[^;]*;\s*([^;)]+)/i);
    if (androidModel?.[1]) {
      const cleaned = androidModel[1].trim().slice(0, 48);
      if (!/build/i.test(cleaned) || cleaned.length > 6) phoneModel = cleaned;
    }
    if (phoneModel === 'Inconnu') {
      if (/samsung|sm-/i.test(raw)) phoneModel = 'Samsung ' + (raw.match(/SM-[A-Z0-9]+/i)?.[0] ?? '').trim();
      else if (/huawei/i.test(raw)) phoneModel = 'Huawei';
      else if (/xiaomi|redmi|mi\s/i.test(raw)) phoneModel = 'Xiaomi/Redmi';
      else if (/tecno/i.test(raw)) phoneModel = 'Tecno';
      else if (/infinix/i.test(raw)) phoneModel = 'Infinix';
      else if (/itel/i.test(raw)) phoneModel = 'Itel';
      else if (/oppo/i.test(raw)) phoneModel = 'Oppo';
      else if (/vivo/i.test(raw)) phoneModel = 'Vivo';
      else if (/pixel/i.test(raw)) phoneModel = 'Google Pixel';
      else if (deviceType === 'desktop') phoneModel = 'Ordinateur';
      else if (deviceType === 'tablet') phoneModel = 'Tablette';
      else if (deviceType === 'mobile') phoneModel = 'Smartphone';
    }
  }

  // OS
  let os = 'Inconnu';
  const ios = raw.match(/OS (\d+[_.]\d+[_.]?\d*)/i);
  const android = raw.match(/Android (\d+(?:\.\d+)*)/i);
  if (/windows nt/i.test(raw)) os = 'Windows';
  else if (/mac os x/i.test(raw) && !/iphone|ipad/i.test(raw)) os = 'macOS';
  else if (ios && /iphone|ipad|mac/i.test(raw)) os = `iOS ${ios[1].replace(/_/g, '.')}`;
  else if (android) os = `Android ${android[1]}`;
  else if (/linux/i.test(raw)) os = 'Linux';
  else if (/cros/i.test(raw)) os = 'ChromeOS';

  // Navigateur
  let browser = 'Inconnu';
  if (/edg\//i.test(raw)) browser = 'Edge';
  else if (/opr\/|opera/i.test(raw)) browser = 'Opera';
  else if (/firefox\/|fxios/i.test(raw)) browser = 'Firefox';
  else if (/crios/i.test(raw)) browser = 'Chrome (iOS)';
  else if (/chrome\/|chromium/i.test(raw)) browser = 'Chrome';
  else if (/safari\//i.test(raw)) browser = 'Safari';

  return { raw, deviceType, phoneModel: phoneModel.slice(0, 80), os: os.slice(0, 40), browser: browser.slice(0, 40) };
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim().slice(0, 64);
  return (headers.get('x-real-ip') || 'inconnue').slice(0, 64);
}

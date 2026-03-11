const KEY = 'celestial_hide_energy_radar';

export function getHideEnergyRadar(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function setHideEnergyRadar(hide: boolean): void {
  try {
    if (hide) localStorage.setItem(KEY, '1');
    else localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

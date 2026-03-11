export interface GeoDistrict {
  id: string;
  name_en: string;
  name_local: string;
  lat: number | null;
  lng: number | null;
}

export interface GeoCity {
  id: string;
  name_en: string;
  name_local: string;
  districts: GeoDistrict[];
}

export interface GeoRegion {
  id: string;
  name_en: string;
  name_local: string;
  cities: GeoCity[];
}

export interface GeoCountry {
  code: string;       // CN / US / JP ...
  name_en: string;
  name_local: string; // 中国 / 美国 / 日本 ...
  regions: GeoRegion[];
}

// 默认使用世界多语言数据（包含所有国家），
// 再用本地 china_regions.json 转换的 geoHierarchy_cn.json 覆盖中国的层级，
// 这样既保留其它国家，又能让中国用完整中文数据。
// @ts-ignore
import worldData from './geoHierarchy_multi.json';
// @ts-ignore
import chinaData from './geoHierarchy_cn.json';

const baseHierarchy = worldData as GeoCountry[];
const chinaHierarchy = chinaData as GeoCountry[];

// 找到世界数据里 code === 'CN' 的国家，用本地中国层级覆盖它的 regions / 名称
const worldChina = baseHierarchy.find((c) => c.code === 'CN');
const localChina = chinaHierarchy.find((c) => c.code === 'CN');

if (worldChina && localChina) {
  worldChina.name_local = localChina.name_local || worldChina.name_local;
  worldChina.name_en = worldChina.name_en || localChina.name_en;
  worldChina.regions = localChina.regions;
}

export const GEO_HIERARCHY = baseHierarchy;

export function findDistrictByIds(
  countryCode: string,
  regionId: string,
  cityId: string,
  districtId: string,
): GeoDistrict | undefined {
  const country = GEO_HIERARCHY.find((c) => c.code === countryCode);
  if (!country) return;
  const region = country.regions.find((r) => r.id === regionId);
  if (!region) return;
  const city = region.cities.find((c) => c.id === cityId);
  if (!city) return;
  return city.districts.find((d) => d.id === districtId);
}


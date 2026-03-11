import { useTranslation } from 'react-i18next';
import { GEO_HIERARCHY, findDistrictByIds } from '@/lib/geoHierarchy';

export interface GeoSelection {
  countryCode: string;
  regionId: string;
  cityId: string;
  districtId: string;
  fullNameLocal: string;
  lat: number | null;
  lng: number | null;
}

interface GeoCascadePickerProps {
  value?: GeoSelection | null;
  onChange: (sel: GeoSelection | null) => void;
}

const GeoCascadePicker = ({ value, onChange }: GeoCascadePickerProps) => {
  const { i18n } = useTranslation();
  const lang = i18n.language || 'en';

  // 国家多语言名称映射：按需要逐步补充
  const COUNTRY_LABELS: Record<string, Record<string, string>> = {
    CN: {
      zh: '中国',
      en: 'China',
      ko: '중국',
      es: 'China',
      hi: 'चीन',
      ar: 'الصين',
      fr: 'Chine',
    },
    US: {
      zh: '美国',
      en: 'United States',
      ko: '미국',
      es: 'Estados Unidos',
      hi: 'संयुक्त राज्य',
      ar: 'الولايات المتحدة',
      fr: 'États-Unis',
    },
    JP: {
      zh: '日本',
      en: 'Japan',
      ko: '일본',
      es: 'Japón',
      hi: 'जापान',
      ar: 'اليابان',
      fr: 'Japon',
    },
    KR: {
      zh: '韩国',
      en: 'South Korea',
      ko: '대한민국',
      es: 'Corea del Sur',
      hi: 'दक्षिण कोरिया',
      ar: 'كوريا الجنوبية',
      fr: 'Corée du Sud',
    },
    GB: {
      zh: '英国',
      en: 'United Kingdom',
      ko: '영국',
      es: 'Reino Unido',
      hi: 'यूनाइटेड किंगडम',
      ar: 'المملكة المتحدة',
      fr: 'Royaume-Uni',
    },
    FR: {
      zh: '法国',
      en: 'France',
      ko: '프랑스',
      es: 'Francia',
      hi: 'फ़्रांस',
      ar: 'فرنسا',
      fr: 'France',
    },
    DE: {
      zh: '德国',
      en: 'Germany',
      ko: '독일',
      es: 'Alemania',
      hi: 'जर्मनी',
      ar: 'ألمانيا',
      fr: 'Allemagne',
    },
    ES: {
      zh: '西班牙',
      en: 'Spain',
      ko: '스페인',
      es: 'España',
      hi: 'स्पेन',
      ar: 'إسبانيا',
      fr: 'Espagne',
    },
    BR: {
      zh: '巴西',
      en: 'Brazil',
      ko: '브라질',
      es: 'Brasil',
      hi: 'ब्राज़ील',
      ar: 'البرازيل',
      fr: 'Brésil',
    },
    RU: {
      zh: '俄罗斯',
      en: 'Russia',
      ko: '러시아',
      es: 'Rusia',
      hi: 'रूस',
      ar: 'روسيا',
      fr: 'Russie',
    },
    IN: {
      zh: '印度',
      en: 'India',
      ko: '인도',
      es: 'India',
      hi: 'भारत',
      ar: 'الهند',
      fr: 'Inde',
    },
    TH: {
      zh: '泰国',
      en: 'Thailand',
      ko: '태국',
      es: 'Tailandia',
      hi: 'थाईलैंड',
      ar: 'تايلاند',
      fr: 'Thaïlande',
    },
    VN: {
      zh: '越南',
      en: 'Vietnam',
      ko: '베트남',
      es: 'Vietnam',
      hi: 'वियतनाम',
      ar: 'فيتنام',
      fr: 'Viêt Nam',
    },
    ID: {
      zh: '印尼',
      en: 'Indonesia',
      ko: '인도네시아',
      es: 'Indonesia',
      hi: 'इंडोनेशिया',
      ar: 'إندونيسيا',
      fr: 'Indonésie',
    },
    SA: {
      zh: '沙特阿拉伯',
      en: 'Saudi Arabia',
      ko: '사우디아라비아',
      es: 'Arabia Saudita',
      hi: 'सऊदी अरब',
      ar: 'المملكة العربية السعودية',
      fr: 'Arabie saoudite',
    },
    // 其它国家暂时使用英文，后续可在这里继续补
  };

  // 中国省级行政区中文名映射（仅在中文界面使用）
  const CN_REGION_ZH: Record<string, string> = {
    Anhui: '安徽省',
    Beijing: '北京市',
    Chongqing: '重庆市',
    Fujian: '福建省',
    Gansu: '甘肃省',
    Guangdong: '广东省',
    Guangxi: '广西壮族自治区',
    Guizhou: '贵州省',
    Hainan: '海南省',
    Hebei: '河北省',
    Heilongjiang: '黑龙江省',
    Henan: '河南省',
    Hubei: '湖北省',
    Hunan: '湖南省',
    'Inner Mongolia': '内蒙古自治区',
    Jiangsu: '江苏省',
    Jiangxi: '江西省',
    Jilin: '吉林省',
    Liaoning: '辽宁省',
    Ningxia: '宁夏回族自治区',
    Qinghai: '青海省',
    Shaanxi: '陕西省',
    Shandong: '山东省',
    Shanghai: '上海市',
    Shanxi: '山西省',
    Sichuan: '四川省',
    Tianjin: '天津市',
    Tibet: '西藏自治区',
    Xinjiang: '新疆维吾尔自治区',
    Yunnan: '云南省',
    Zhejiang: '浙江省',
    'Hong Kong SAR': '香港特别行政区',
    'Macau SAR': '澳门特别行政区',
    Taiwan: '台湾省',
  };

  // 中国常用城市 / 县的中文映射（只列出典型城市和部分县，长尾保持英文）
  const CN_CITY_ZH: Record<string, string> = {
    Beijing: '北京市',
    Shanghai: '上海市',
    Guangzhou: '广州市',
    Shenzhen: '深圳市',
    Chongqing: '重庆市',
    Tianjin: '天津市',
    Chengdu: '成都市',
    Wuhan: '武汉市',
    Nanjing: '南京市',
    Hangzhou: '杭州市',
    "Xi'an": '西安市',
    Changsha: '长沙市',
    Zhengzhou: '郑州市',
    Jinan: '济南市',
    Qingdao: '青岛市',
    Fuzhou: '福州市',
    Xiamen: '厦门市',
    Suzhou: '苏州市',
    Ningbo: '宁波市',
    Wuxi: '无锡市',
    Hefei: '合肥市',
    Kunming: '昆明市',
    Guiyang: '贵阳市',
    Nanning: '南宁市',
    Urumqi: '乌鲁木齐市',
    Lhasa: '拉萨市',
    // 部分县级示例
    Anfu: '安福县',
    Anyi: '安义县',
  };

  const langKey =
    lang.startsWith('zh') ? 'zh'
    : lang.startsWith('ko') ? 'ko'
    : lang.startsWith('es') ? 'es'
    : lang.startsWith('hi') ? 'hi'
    : lang.startsWith('ar') ? 'ar'
    : lang.startsWith('fr') ? 'fr'
    : 'en';

  const getCountryLabel = (code: string, fallbackEn: string) => {
    const map = COUNTRY_LABELS[code];
    if (!map) return fallbackEn;
    return map[langKey] || fallbackEn;
  };

  const getRegionLabel = (countryCode: string, nameEn: string) => {
    if (countryCode === 'CN' && langKey === 'zh') {
      return CN_REGION_ZH[nameEn] || nameEn;
    }
    return nameEn;
  };

  const getCityLabel = (countryCode: string, nameEn: string) => {
    if (countryCode === 'CN' && langKey === 'zh') {
      return CN_CITY_ZH[nameEn] || nameEn;
    }
    return nameEn;
  };

  const defaultCountry = GEO_HIERARCHY[0];
  const countryCode = value?.countryCode || defaultCountry.code;
  const country = GEO_HIERARCHY.find((c) => c.code === countryCode) || defaultCountry;

  const defaultRegion = country.regions[0];
  const regionId = value?.regionId || defaultRegion.id;
  const region = country.regions.find((r) => r.id === regionId) || defaultRegion;

  const defaultCity = region.cities[0];
  const cityId = value?.cityId || defaultCity.id;
  const city = region.cities.find((c) => c.id === cityId) || defaultCity;

  const defaultDistrict = city.districts[0];
  const districtId = value?.districtId || defaultDistrict.id;
  const district = city.districts.find((d) => d.id === districtId) || defaultDistrict;

  const applyChange = (
    nextCountryCode: string,
    nextRegionId: string,
    nextCityId: string,
    nextDistrictId: string,
  ) => {
    const d = findDistrictByIds(nextCountryCode, nextRegionId, nextCityId, nextDistrictId);
    if (!d) {
      onChange(null);
      return;
    }
    const cty = GEO_HIERARCHY.find((c) => c.code === nextCountryCode)!;
    const reg = cty.regions.find((r) => r.id === nextRegionId)!;
    const cityNode = reg.cities.find((c) => c.id === nextCityId)!;
    onChange({
      countryCode: nextCountryCode,
      regionId: nextRegionId,
      cityId: nextCityId,
      districtId: nextDistrictId,
      fullNameLocal: `${cty.name_local} ${reg.name_local} ${cityNode.name_local} ${d.name_local}`,
      lat: d.lat ?? null,
      lng: d.lng ?? null,
    });
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        {/* 国家 */}
        <div>
          <label className="input-label">国家</label>
          <select
            className="glass-select"
            value={country.code}
            onChange={(e) => {
              const nc = e.target.value;
              const ncCountry = GEO_HIERARCHY.find((c) => c.code === nc)!;
              const nr = ncCountry.regions[0];
              const ncCity = nr.cities[0];
              const nd = ncCity.districts[0];
              applyChange(nc, nr.id, ncCity.id, nd.id);
            }}
          >
            {GEO_HIERARCHY.map((c) => (
              <option key={c.code} value={c.code}>
                {getCountryLabel(c.code, c.name_en)}
              </option>
            ))}
          </select>
        </div>

        {/* 省份 */}
        <div>
          <label className="input-label">省份</label>
          <select
            className="glass-select"
            value={region.id}
            onChange={(e) => {
              const nrId = e.target.value;
              const nr = country.regions.find((r) => r.id === nrId)!;
              const ncCity = nr.cities[0];
              const nd = ncCity.districts[0];
              applyChange(country.code, nr.id, ncCity.id, nd.id);
            }}
          >
            {country.regions.map((r) => (
              <option key={r.id} value={r.id}>
                {getRegionLabel(country.code, r.name_en)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* 城市 */}
        <div>
          <label className="input-label">城市</label>
          <select
            className="glass-select"
            value={city.id}
            onChange={(e) => {
              const ncId = e.target.value;
              const nc = region.cities.find((c) => c.id === ncId)!;
              const nd = nc.districts[0];
              applyChange(country.code, region.id, nc.id, nd.id);
            }}
          >
            {region.cities.map((c) => (
              <option key={c.id} value={c.id}>
                {getCityLabel(country.code, c.name_en)}
              </option>
            ))}
          </select>
        </div>

        {/* 区县 */}
        <div>
          <label className="input-label">区县</label>
          <select
            className="glass-select"
            value={district.id}
            onChange={(e) => {
              const ndId = e.target.value;
              applyChange(country.code, region.id, city.id, ndId);
            }}
          >
            {city.districts.map((d) => (
              <option key={d.id} value={d.id}>
                {country.code === 'CN' && langKey === 'zh' ? d.name_local : d.name_en}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default GeoCascadePicker;


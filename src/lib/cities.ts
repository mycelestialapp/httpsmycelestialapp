// Global city database with lat/lng for True Solar Time calculation
import { CHINA_DISTRICTS } from './chinaDistricts';

export interface CityEntry {
  name: string; // Display name (English)
  nameZh?: string; // Chinese name
  country: string;
  lat: number;
  lng: number;
}

// 常见国家的中文名（用于按“美国”“英国”等搜索）
const COUNTRY_ZH: Record<string, string> = {
  CN: '中国',
  HK: '香港',
  MO: '澳门',
  TW: '台湾',
  US: '美国',
  CA: '加拿大',
  MX: '墨西哥',
  GB: '英国',
  FR: '法国',
  DE: '德国',
  IT: '意大利',
  ES: '西班牙',
  RU: '俄罗斯',
  JP: '日本',
  KR: '韩国',
  VN: '越南',
  TH: '泰国',
  SG: '新加坡',
  MY: '马来西亚',
  ID: '印尼',
  PH: '菲律宾',
  IN: '印度',
  AE: '阿联酋',
  SA: '沙特',
  TR: '土耳其',
  BR: '巴西',
  AR: '阿根廷',
  CL: '智利',
  AU: '澳大利亚',
  NZ: '新西兰',
};

export const GLOBAL_CITIES: CityEntry[] = [
  // China
  { name: "Beijing", nameZh: "北京", country: "CN", lat: 39.9042, lng: 116.4074 },
  { name: "Shanghai", nameZh: "上海", country: "CN", lat: 31.2304, lng: 121.4737 },
  { name: "Guangzhou", nameZh: "广州", country: "CN", lat: 23.1291, lng: 113.2644 },
  { name: "Shenzhen", nameZh: "深圳", country: "CN", lat: 22.5431, lng: 114.0579 },
  { name: "Chengdu", nameZh: "成都", country: "CN", lat: 30.5728, lng: 104.0668 },
  { name: "Chongqing", nameZh: "重庆", country: "CN", lat: 29.4316, lng: 106.9123 },
  { name: "Hangzhou", nameZh: "杭州", country: "CN", lat: 30.2741, lng: 120.1551 },
  { name: "Wuhan", nameZh: "武汉", country: "CN", lat: 30.5928, lng: 114.3055 },
  { name: "Nanjing", nameZh: "南京", country: "CN", lat: 32.0603, lng: 118.7969 },
  { name: "Xi'an", nameZh: "西安", country: "CN", lat: 34.3416, lng: 108.9398 },
  { name: "Changsha", nameZh: "长沙", country: "CN", lat: 28.2282, lng: 112.9388 },
  { name: "Tianjin", nameZh: "天津", country: "CN", lat: 39.3434, lng: 117.3616 },
  { name: "Suzhou", nameZh: "苏州", country: "CN", lat: 31.2990, lng: 120.5853 },
  { name: "Zhengzhou", nameZh: "郑州", country: "CN", lat: 34.7466, lng: 113.6254 },
  { name: "Dongguan", nameZh: "东莞", country: "CN", lat: 23.0208, lng: 113.7518 },
  { name: "Qingdao", nameZh: "青岛", country: "CN", lat: 36.0671, lng: 120.3826 },
  { name: "Kunming", nameZh: "昆明", country: "CN", lat: 25.0389, lng: 102.7183 },
  { name: "Dalian", nameZh: "大连", country: "CN", lat: 38.9140, lng: 121.6147 },
  { name: "Shenyang", nameZh: "沈阳", country: "CN", lat: 41.8057, lng: 123.4315 },
  { name: "Harbin", nameZh: "哈尔滨", country: "CN", lat: 45.8038, lng: 126.5350 },
  { name: "Fuzhou", nameZh: "福州", country: "CN", lat: 26.0745, lng: 119.2965 },
  { name: "Jinan", nameZh: "济南", country: "CN", lat: 36.6512, lng: 117.1201 },
  { name: "Hefei", nameZh: "合肥", country: "CN", lat: 31.8206, lng: 117.2272 },
  { name: "Guiyang", nameZh: "贵阳", country: "CN", lat: 26.6470, lng: 106.6302 },
  { name: "Nanning", nameZh: "南宁", country: "CN", lat: 22.8170, lng: 108.3665 },
  { name: "Lanzhou", nameZh: "兰州", country: "CN", lat: 36.0611, lng: 103.8343 },
  { name: "Taiyuan", nameZh: "太原", country: "CN", lat: 37.8706, lng: 112.5489 },
  { name: "Shijiazhuang", nameZh: "石家庄", country: "CN", lat: 38.0428, lng: 114.5149 },
  { name: "Urumqi", nameZh: "乌鲁木齐", country: "CN", lat: 43.8256, lng: 87.6168 },
  { name: "Lhasa", nameZh: "拉萨", country: "CN", lat: 29.6500, lng: 91.1000 },
  { name: "Hohhot", nameZh: "呼和浩特", country: "CN", lat: 40.8423, lng: 111.7498 },
  { name: "Haikou", nameZh: "海口", country: "CN", lat: 20.0174, lng: 110.3492 },
  { name: "Yinchuan", nameZh: "银川", country: "CN", lat: 38.4872, lng: 106.2309 },
  { name: "Xining", nameZh: "西宁", country: "CN", lat: 36.6171, lng: 101.7782 },
  // Taiwan, HK, Macau
  { name: "Taipei", nameZh: "台北", country: "TW", lat: 25.0330, lng: 121.5654 },
  { name: "Kaohsiung", nameZh: "高雄", country: "TW", lat: 22.6273, lng: 120.3014 },
  { name: "Taichung", nameZh: "台中", country: "TW", lat: 24.1477, lng: 120.6736 },
  { name: "Hong Kong", nameZh: "香港", country: "HK", lat: 22.3193, lng: 114.1694 },
  { name: "Macau", nameZh: "澳门", country: "MO", lat: 22.1987, lng: 113.5439 },
  // Japan
  { name: "Tokyo", nameZh: "东京", country: "JP", lat: 35.6762, lng: 139.6503 },
  { name: "Osaka", nameZh: "大阪", country: "JP", lat: 34.6937, lng: 135.5023 },
  { name: "Kyoto", nameZh: "京都", country: "JP", lat: 35.0116, lng: 135.7681 },
  { name: "Yokohama", nameZh: "横滨", country: "JP", lat: 35.4437, lng: 139.6380 },
  { name: "Nagoya", nameZh: "名古屋", country: "JP", lat: 35.1815, lng: 136.9066 },
  { name: "Sapporo", nameZh: "札幌", country: "JP", lat: 43.0618, lng: 141.3545 },
  { name: "Fukuoka", nameZh: "福冈", country: "JP", lat: 33.5904, lng: 130.4017 },
  // Korea
  { name: "Seoul", nameZh: "首尔", country: "KR", lat: 37.5665, lng: 126.9780 },
  { name: "Busan", nameZh: "釜山", country: "KR", lat: 35.1796, lng: 129.0756 },
  { name: "Incheon", nameZh: "仁川", country: "KR", lat: 37.4563, lng: 126.7052 },
  // Southeast Asia
  { name: "Singapore", nameZh: "新加坡", country: "SG", lat: 1.3521, lng: 103.8198 },
  { name: "Bangkok", nameZh: "曼谷", country: "TH", lat: 13.7563, lng: 100.5018 },
  { name: "Chiang Mai", nameZh: "清迈", country: "TH", lat: 18.7883, lng: 98.9853 },
  { name: "Kuala Lumpur", nameZh: "吉隆坡", country: "MY", lat: 3.1390, lng: 101.6869 },
  { name: "Jakarta", nameZh: "雅加达", country: "ID", lat: -6.2088, lng: 106.8456 },
  { name: "Manila", nameZh: "马尼拉", country: "PH", lat: 14.5995, lng: 120.9842 },
  { name: "Ho Chi Minh City", nameZh: "胡志明市", country: "VN", lat: 10.8231, lng: 106.6297 },
  { name: "Hanoi", nameZh: "河内", country: "VN", lat: 21.0278, lng: 105.8342 },
  // South Asia
  { name: "Mumbai", nameZh: "孟买", country: "IN", lat: 19.0760, lng: 72.8777 },
  { name: "New Delhi", nameZh: "新德里", country: "IN", lat: 28.6139, lng: 77.2090 },
  { name: "Bangalore", nameZh: "班加罗尔", country: "IN", lat: 12.9716, lng: 77.5946 },
  { name: "Kolkata", nameZh: "加尔各答", country: "IN", lat: 22.5726, lng: 88.3639 },
  { name: "Chennai", nameZh: "金奈", country: "IN", lat: 13.0827, lng: 80.2707 },
  // Middle East
  { name: "Dubai", nameZh: "迪拜", country: "AE", lat: 25.2048, lng: 55.2708 },
  { name: "Abu Dhabi", nameZh: "阿布扎比", country: "AE", lat: 24.4539, lng: 54.3773 },
  { name: "Riyadh", nameZh: "利雅得", country: "SA", lat: 24.7136, lng: 46.6753 },
  { name: "Istanbul", nameZh: "伊斯坦布尔", country: "TR", lat: 41.0082, lng: 28.9784 },
  { name: "Tel Aviv", nameZh: "特拉维夫", country: "IL", lat: 32.0853, lng: 34.7818 },
  // Europe
  { name: "London", nameZh: "伦敦", country: "GB", lat: 51.5074, lng: -0.1278 },
  { name: "Paris", nameZh: "巴黎", country: "FR", lat: 48.8566, lng: 2.3522 },
  { name: "Berlin", nameZh: "柏林", country: "DE", lat: 52.5200, lng: 13.4050 },
  { name: "Munich", nameZh: "慕尼黑", country: "DE", lat: 48.1351, lng: 11.5820 },
  { name: "Frankfurt", nameZh: "法兰克福", country: "DE", lat: 50.1109, lng: 8.6821 },
  { name: "Madrid", nameZh: "马德里", country: "ES", lat: 40.4168, lng: -3.7038 },
  { name: "Barcelona", nameZh: "巴塞罗那", country: "ES", lat: 41.3874, lng: 2.1686 },
  { name: "Rome", nameZh: "罗马", country: "IT", lat: 41.9028, lng: 12.4964 },
  { name: "Milan", nameZh: "米兰", country: "IT", lat: 45.4642, lng: 9.1900 },
  { name: "Amsterdam", nameZh: "阿姆斯特丹", country: "NL", lat: 52.3676, lng: 4.9041 },
  { name: "Moscow", nameZh: "莫斯科", country: "RU", lat: 55.7558, lng: 37.6173 },
  { name: "St. Petersburg", nameZh: "圣彼得堡", country: "RU", lat: 59.9311, lng: 30.3609 },
  { name: "Vienna", nameZh: "维也纳", country: "AT", lat: 48.2082, lng: 16.3738 },
  { name: "Zurich", nameZh: "苏黎世", country: "CH", lat: 47.3769, lng: 8.5417 },
  { name: "Stockholm", nameZh: "斯德哥尔摩", country: "SE", lat: 59.3293, lng: 18.0686 },
  { name: "Copenhagen", nameZh: "哥本哈根", country: "DK", lat: 55.6761, lng: 12.5683 },
  { name: "Oslo", nameZh: "奥斯陆", country: "NO", lat: 59.9139, lng: 10.7522 },
  { name: "Helsinki", nameZh: "赫尔辛基", country: "FI", lat: 60.1699, lng: 24.9384 },
  { name: "Warsaw", nameZh: "华沙", country: "PL", lat: 52.2297, lng: 21.0122 },
  { name: "Prague", nameZh: "布拉格", country: "CZ", lat: 50.0755, lng: 14.4378 },
  { name: "Budapest", nameZh: "布达佩斯", country: "HU", lat: 47.4979, lng: 19.0402 },
  { name: "Athens", nameZh: "雅典", country: "GR", lat: 37.9838, lng: 23.7275 },
  { name: "Lisbon", nameZh: "里斯本", country: "PT", lat: 38.7223, lng: -9.1393 },
  { name: "Dublin", nameZh: "都柏林", country: "IE", lat: 53.3498, lng: -6.2603 },
  { name: "Edinburgh", nameZh: "爱丁堡", country: "GB", lat: 55.9533, lng: -3.1883 },
  { name: "Manchester", nameZh: "曼彻斯特", country: "GB", lat: 53.4808, lng: -2.2426 },
  // North America
  { name: "New York", nameZh: "纽约", country: "US", lat: 40.7128, lng: -74.0060 },
  { name: "Los Angeles", nameZh: "洛杉矶", country: "US", lat: 34.0522, lng: -118.2437 },
  { name: "San Francisco", nameZh: "旧金山", country: "US", lat: 37.7749, lng: -122.4194 },
  { name: "Chicago", nameZh: "芝加哥", country: "US", lat: 41.8781, lng: -87.6298 },
  { name: "Houston", nameZh: "休斯顿", country: "US", lat: 29.7604, lng: -95.3698 },
  { name: "Miami", nameZh: "迈阿密", country: "US", lat: 25.7617, lng: -80.1918 },
  { name: "Seattle", nameZh: "西雅图", country: "US", lat: 47.6062, lng: -122.3321 },
  { name: "Boston", nameZh: "波士顿", country: "US", lat: 42.3601, lng: -71.0589 },
  { name: "Washington D.C.", nameZh: "华盛顿", country: "US", lat: 38.9072, lng: -77.0369 },
  { name: "Toronto", nameZh: "多伦多", country: "CA", lat: 43.6532, lng: -79.3832 },
  { name: "Vancouver", nameZh: "温哥华", country: "CA", lat: 49.2827, lng: -123.1207 },
  { name: "Montreal", nameZh: "蒙特利尔", country: "CA", lat: 45.5017, lng: -73.5673 },
  { name: "Mexico City", nameZh: "墨西哥城", country: "MX", lat: 19.4326, lng: -99.1332 },
  // South America
  { name: "São Paulo", nameZh: "圣保罗", country: "BR", lat: -23.5505, lng: -46.6333 },
  { name: "Rio de Janeiro", nameZh: "里约热内卢", country: "BR", lat: -22.9068, lng: -43.1729 },
  { name: "Buenos Aires", nameZh: "布宜诺斯艾利斯", country: "AR", lat: -34.6037, lng: -58.3816 },
  { name: "Lima", nameZh: "利马", country: "PE", lat: -12.0464, lng: -77.0428 },
  { name: "Bogotá", nameZh: "波哥大", country: "CO", lat: 4.7110, lng: -74.0721 },
  { name: "Santiago", nameZh: "圣地亚哥", country: "CL", lat: -33.4489, lng: -70.6693 },
  // Oceania
  { name: "Sydney", nameZh: "悉尼", country: "AU", lat: -33.8688, lng: 151.2093 },
  { name: "Melbourne", nameZh: "墨尔本", country: "AU", lat: -37.8136, lng: 144.9631 },
  { name: "Auckland", nameZh: "奥克兰", country: "NZ", lat: -36.8485, lng: 174.7633 },
  // Africa
  { name: "Cairo", nameZh: "开罗", country: "EG", lat: 30.0444, lng: 31.2357 },
  { name: "Lagos", nameZh: "拉各斯", country: "NG", lat: 6.5244, lng: 3.3792 },
  { name: "Johannesburg", nameZh: "约翰内斯堡", country: "ZA", lat: -26.2041, lng: 28.0473 },
  { name: "Cape Town", nameZh: "开普敦", country: "ZA", lat: -33.9249, lng: 18.4241 },
  { name: "Nairobi", nameZh: "内罗毕", country: "KE", lat: -1.2921, lng: 36.8219 },
  { name: "Casablanca", nameZh: "卡萨布兰卡", country: "MA", lat: 33.5731, lng: -7.5898 },
];

/** 全球城市 + 中国省市区（到县区）合并列表 */
export const ALL_LOCATIONS: CityEntry[] = [...GLOBAL_CITIES, ...CHINA_DISTRICTS];

/** Search cities and districts by name (English, Chinese) */
export function searchCities(query: string, limit = 12): CityEntry[] {
  if (!query || query.length < 1) return [];
  const q = query.toLowerCase().trim();
  return ALL_LOCATIONS
    .filter((c) => {
      const countryZh = COUNTRY_ZH[c.country] || '';
      return (
        c.name.toLowerCase().includes(q) || // 英文城市名
        (c.nameZh && c.nameZh.includes(query)) || // 中文城市名
        c.country.toLowerCase().includes(q) || // 国家代码（US / CN 等）
        (!!countryZh && countryZh.includes(query)) // 国家中文名（美国 / 日本 等）
      );
    })
    .slice(0, limit);
}

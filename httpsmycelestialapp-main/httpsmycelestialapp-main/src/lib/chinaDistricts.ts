/**
 * 中国省市区（到县区级）用于出生地选择与真太阳时
 * 格式与 CityEntry 一致，nameZh 为「省/市 市 区」或「市 区县」
 */
import type { CityEntry } from './cities';

export const CHINA_DISTRICTS: CityEntry[] = [
  // 北京市
  { name: "Beijing Dongcheng", nameZh: "北京市东城区", country: "CN", lat: 39.9289, lng: 116.4164 },
  { name: "Beijing Xicheng", nameZh: "北京市西城区", country: "CN", lat: 39.9123, lng: 116.3659 },
  { name: "Beijing Chaoyang", nameZh: "北京市朝阳区", country: "CN", lat: 39.9219, lng: 116.4435 },
  { name: "Beijing Haidian", nameZh: "北京市海淀区", country: "CN", lat: 39.9599, lng: 116.2981 },
  { name: "Beijing Fengtai", nameZh: "北京市丰台区", country: "CN", lat: 39.8585, lng: 116.2872 },
  { name: "Beijing Shijingshan", nameZh: "北京市石景山区", country: "CN", lat: 39.9062, lng: 116.2228 },
  { name: "Beijing Tongzhou", nameZh: "北京市通州区", country: "CN", lat: 39.9098, lng: 116.6584 },
  { name: "Beijing Shunyi", nameZh: "北京市顺义区", country: "CN", lat: 40.1301, lng: 116.6546 },
  { name: "Beijing Changping", nameZh: "北京市昌平区", country: "CN", lat: 40.2208, lng: 116.2312 },
  { name: "Beijing Daxing", nameZh: "北京市大兴区", country: "CN", lat: 39.7269, lng: 116.3414 },
  { name: "Beijing Mentougou", nameZh: "北京市门头沟区", country: "CN", lat: 39.9405, lng: 116.1016 },
  { name: "Beijing Fangshan", nameZh: "北京市房山区", country: "CN", lat: 39.7477, lng: 116.1433 },
  { name: "Beijing Huairou", nameZh: "北京市怀柔区", country: "CN", lat: 40.316, lng: 116.6318 },
  { name: "Beijing Pinggu", nameZh: "北京市平谷区", country: "CN", lat: 40.1448, lng: 117.1123 },
  { name: "Beijing Miyun", nameZh: "北京市密云区", country: "CN", lat: 40.3763, lng: 116.8432 },
  { name: "Beijing Yanqing", nameZh: "北京市延庆区", country: "CN", lat: 40.4566, lng: 115.9744 },
  // 上海市
  { name: "Shanghai Huangpu", nameZh: "上海市黄浦区", country: "CN", lat: 31.2318, lng: 121.4844 },
  { name: "Shanghai Xuhui", nameZh: "上海市徐汇区", country: "CN", lat: 31.1880, lng: 121.4365 },
  { name: "Shanghai Changning", nameZh: "上海市长宁区", country: "CN", lat: 31.2202, lng: 121.4246 },
  { name: "Shanghai Jing'an", nameZh: "上海市静安区", country: "CN", lat: 31.2230, lng: 121.4454 },
  { name: "Shanghai Putuo", nameZh: "上海市普陀区", country: "CN", lat: 31.2496, lng: 121.3955 },
  { name: "Shanghai Hongkou", nameZh: "上海市虹口区", country: "CN", lat: 31.2645, lng: 121.5051 },
  { name: "Shanghai Yangpu", nameZh: "上海市杨浦区", country: "CN", lat: 31.2596, lng: 121.5257 },
  { name: "Shanghai Pudong", nameZh: "上海市浦东新区", country: "CN", lat: 31.2215, lng: 121.5444 },
  { name: "Shanghai Minhang", nameZh: "上海市闵行区", country: "CN", lat: 31.1130, lng: 121.3821 },
  { name: "Shanghai Baoshan", nameZh: "上海市宝山区", country: "CN", lat: 31.4052, lng: 121.4894 },
  { name: "Shanghai Jiading", nameZh: "上海市嘉定区", country: "CN", lat: 31.3756, lng: 121.2651 },
  { name: "Shanghai Jinshan", nameZh: "上海市金山区", country: "CN", lat: 30.7413, lng: 121.3419 },
  { name: "Shanghai Songjiang", nameZh: "上海市松江区", country: "CN", lat: 31.0322, lng: 121.2277 },
  { name: "Shanghai Qingpu", nameZh: "上海市青浦区", country: "CN", lat: 31.1512, lng: 121.1242 },
  { name: "Shanghai Fengxian", nameZh: "上海市奉贤区", country: "CN", lat: 30.9178, lng: 121.4740 },
  { name: "Shanghai Chongming", nameZh: "上海市崇明区", country: "CN", lat: 31.6239, lng: 121.3974 },
  // 广东省
  { name: "Guangzhou Tianhe", nameZh: "广东省广州市天河区", country: "CN", lat: 23.1249, lng: 113.3612 },
  { name: "Guangzhou Yuexiu", nameZh: "广东省广州市越秀区", country: "CN", lat: 23.1292, lng: 113.2668 },
  { name: "Guangzhou Liwan", nameZh: "广东省广州市荔湾区", country: "CN", lat: 23.1259, lng: 113.2430 },
  { name: "Guangzhou Haizhu", nameZh: "广东省广州市海珠区", country: "CN", lat: 23.0833, lng: 113.3174 },
  { name: "Guangzhou Baiyun", nameZh: "广东省广州市白云区", country: "CN", lat: 23.1579, lng: 113.2733 },
  { name: "Guangzhou Panyu", nameZh: "广东省广州市番禺区", country: "CN", lat: 22.9372, lng: 113.3841 },
  { name: "Shenzhen Nanshan", nameZh: "广东省深圳市南山区", country: "CN", lat: 22.5315, lng: 113.9303 },
  { name: "Shenzhen Futian", nameZh: "广东省深圳市福田区", country: "CN", lat: 22.5410, lng: 114.0556 },
  { name: "Shenzhen Luohu", nameZh: "广东省深圳市罗湖区", country: "CN", lat: 22.5484, lng: 114.1317 },
  { name: "Shenzhen Bao'an", nameZh: "广东省深圳市宝安区", country: "CN", lat: 22.5547, lng: 113.8831 },
  { name: "Shenzhen Longgang", nameZh: "广东省深圳市龙岗区", country: "CN", lat: 22.7204, lng: 114.2478 },
  { name: "Dongguan Nancheng", nameZh: "广东省东莞市南城", country: "CN", lat: 23.0205, lng: 113.7518 },
  { name: "Foshan Chancheng", nameZh: "广东省佛山市禅城区", country: "CN", lat: 23.0094, lng: 113.1224 },
  // 浙江省
  { name: "Hangzhou Xihu", nameZh: "浙江省杭州市西湖区", country: "CN", lat: 30.2591, lng: 120.1304 },
  { name: "Hangzhou Shangcheng", nameZh: "浙江省杭州市上城区", country: "CN", lat: 30.2426, lng: 120.1693 },
  { name: "Hangzhou Gongshu", nameZh: "浙江省杭州市拱墅区", country: "CN", lat: 30.3190, lng: 120.1421 },
  { name: "Hangzhou Binjiang", nameZh: "浙江省杭州市滨江区", country: "CN", lat: 30.2084, lng: 120.2110 },
  { name: "Ningbo Haishu", nameZh: "浙江省宁波市海曙区", country: "CN", lat: 29.8745, lng: 121.5504 },
  { name: "Ningbo Jiangbei", nameZh: "浙江省宁波市江北区", country: "CN", lat: 29.8864, lng: 121.5548 },
  { name: "Wenzhou Lucheng", nameZh: "浙江省温州市鹿城区", country: "CN", lat: 28.0151, lng: 120.6552 },
  // 江苏省
  { name: "Nanjing Xuanwu", nameZh: "江苏省南京市玄武区", country: "CN", lat: 32.0487, lng: 118.7978 },
  { name: "Nanjing Qinhuai", nameZh: "江苏省南京市秦淮区", country: "CN", lat: 32.0391, lng: 118.7947 },
  { name: "Nanjing Jianye", nameZh: "江苏省南京市建邺区", country: "CN", lat: 31.9960, lng: 118.7317 },
  { name: "Suzhou Gusu", nameZh: "江苏省苏州市姑苏区", country: "CN", lat: 31.3056, lng: 120.6173 },
  { name: "Suzhou Industrial", nameZh: "江苏省苏州市工业园区", country: "CN", lat: 31.3173, lng: 120.6804 },
  { name: "Wuxi Liangxi", nameZh: "江苏省无锡市梁溪区", country: "CN", lat: 31.5747, lng: 120.3035 },
  // 四川省
  { name: "Chengdu Wuhou", nameZh: "四川省成都市武侯区", country: "CN", lat: 30.6424, lng: 104.0435 },
  { name: "Chengdu Jinjiang", nameZh: "四川省成都市锦江区", country: "CN", lat: 30.6561, lng: 104.0810 },
  { name: "Chengdu Qingyang", nameZh: "四川省成都市青羊区", country: "CN", lat: 30.6744, lng: 104.0625 },
  { name: "Chengdu High-tech", nameZh: "四川省成都市高新区", country: "CN", lat: 30.5745, lng: 104.0617 },
  // 湖北省
  { name: "Wuhan Wuchang", nameZh: "湖北省武汉市武昌区", country: "CN", lat: 30.5539, lng: 114.3160 },
  { name: "Wuhan Jianghan", nameZh: "湖北省武汉市江汉区", country: "CN", lat: 30.6031, lng: 114.2708 },
  { name: "Wuhan Hongshan", nameZh: "湖北省武汉市洪山区", country: "CN", lat: 30.5006, lng: 114.3436 },
  // 陕西省
  { name: "Xi'an Beilin", nameZh: "陕西省西安市碑林区", country: "CN", lat: 34.2411, lng: 108.9402 },
  { name: "Xi'an Yanta", nameZh: "陕西省西安市雁塔区", country: "CN", lat: 34.2141, lng: 108.9466 },
  { name: "Xi'an Weiyang", nameZh: "陕西省西安市未央区", country: "CN", lat: 34.2932, lng: 108.9462 },
  // 河南省
  { name: "Zhengzhou Jinshui", nameZh: "河南省郑州市金水区", country: "CN", lat: 34.7975, lng: 113.6605 },
  { name: "Zhengzhou Guancheng", nameZh: "河南省郑州市管城回族区", country: "CN", lat: 34.7536, lng: 113.6774 },
  // 山东省
  { name: "Jinan Lixia", nameZh: "山东省济南市历下区", country: "CN", lat: 36.6664, lng: 117.0768 },
  { name: "Qingdao Shinan", nameZh: "山东省青岛市市南区", country: "CN", lat: 36.0752, lng: 120.4124 },
  { name: "Qingdao Shibei", nameZh: "山东省青岛市市北区", country: "CN", lat: 36.0876, lng: 120.3749 },
  // 台湾
  { name: "Taipei Zhongzheng", nameZh: "台湾台北市中正区", country: "TW", lat: 25.0324, lng: 121.5214 },
  { name: "Taipei Da'an", nameZh: "台湾台北市大安区", country: "TW", lat: 25.0330, lng: 121.5435 },
  { name: "New Taipei Banqiao", nameZh: "台湾新北市板桥区", country: "TW", lat: 25.0123, lng: 121.4637 },
  { name: "Taoyuan Taoyuan", nameZh: "台湾桃园市桃园区", country: "TW", lat: 24.9936, lng: 121.3010 },
  // 香港
  { name: "HK Central", nameZh: "香港中西区", country: "HK", lat: 22.2864, lng: 114.1544 },
  { name: "HK Kowloon City", nameZh: "香港九龙城区", country: "HK", lat: 22.3232, lng: 114.1916 },
  { name: "HK Sha Tin", nameZh: "香港沙田区", country: "HK", lat: 22.3793, lng: 114.1954 },
];

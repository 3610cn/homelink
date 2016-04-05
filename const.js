var INVALID_HOUSE_LIST_URL = 'http://user.lianjia.com/site/housedata/?filter=1&p=1&perPage=300';
var DEFAULT_LIST_PIC = 'http://static1.ljcdn.com/h5/images/default/default_lianjia_small.png?_v=20160330192650'
// 关注小区列表
var COMMUNITY_FAV_LIST = 'http://user.lianjia.com/site/communitydata/?perPage=100';
// 根据小区和城市查询房源列表
var HOUSE_LIST_TPL = 'http://m.api.lianjia.com/house/ershoufang/searchv2?channel=ershoufang&community_id=${resblockId}&city_id=${cityId}&limit_count=100&limit_offset=0&access_token=1.0000c754c957704eae68d2f40954ed74c2&device_id=6f384597-4820-4700-bd7d-db2be72f51f5&room_count=2&sort=priceTotal+asc&utm_source=';
// 关注房源_南京
var FAV_URL_NJ = 'http://nj.lianjia.com/api/SetHouseFav?id=${house_code}&isFav=${tag}';
// 关注房源_上海
var FAV_URL_SH = 'http://sh.lianjia.com/ershoufang/addMyFavorHouse.json?houseSellId=${house_code}';
// 取消关注房源_上海
var UNFAV_URL_SH = 'http://sh.lianjia.com/ershoufang/delMyFavorHouse.json?houseSellId=${house_code}';
// 详细页面
var DETAIL_URL = 'http://${cityCode}.lianjia.com/ershoufang/${houseId}.html';

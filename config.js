var config = {
    // 请求缓存时间
    CACHE_MAX_AGE: 300 * 1000,
    // 所有关注房源
    INVALID_HOUSE_LIST_URL: 'http://user.lianjia.com/site/housedata/?filter=1&p=1&perPage=300',
    // 默认图片地址
    DEFAULT_LIST_PIC: 'http://static1.ljcdn.com/h5/images/default/default_lianjia_small.png?_v=20160330192650',
    // 关注小区列表
    COMMUNITY_FAV_LIST: 'http://user.lianjia.com/site/communitydata/?perPage=100',
    // 根据小区和城市查询房源列表
    HOUSE_LIST_TPL: 'http://m.api.lianjia.com/house/ershoufang/searchv2?channel=ershoufang&community_id=${resblockId}&city_id=${cityId}&limit_count=100&limit_offset=0&access_token=1.0000c754c957704eae68d2f40954ed74c2&device_id=6f384597-4820-4700-bd7d-db2be72f51f5&room_count=2&sort=priceTotal+asc&utm_source=',
    // 关注房源_南京
    FAV_URL_NJ: 'http://nj.lianjia.com/api/SetHouseFav?id=${house_code}&isFav=${tag}',
    // 关注房源_上海
    FAV_URL_SH: 'http://sh.lianjia.com/ershoufang/addMyFavorHouse.json?houseSellId=${house_code}',
    // 取消关注房源_上海
    UNFAV_URL_SH: 'http://sh.lianjia.com/ershoufang/delMyFavorHouse.json?houseSellId=${house_code}',
    // 详细页面
    DETAIL_URL: 'http://${cityCode}.lianjia.com/ershoufang/${houseId}.html'
};

if (window.define) {
    window.define(function (require) {return config;});
}
else {
    window.config = config;
}

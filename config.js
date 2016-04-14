var config = {
    // 请求缓存时间
    CACHE_MAX_AGE: 3 * 1000,
    // 所有关注房源
    FAV_HOUSE_LIST_URL: 'http://user.lianjia.com/site/housedata/?filter=1&p=1&perPage=300',
    FAV_HOUSE_LIST_URL_SH: 'http://user.sh.lianjia.com/favor/getMyFavorHouseList.json?v=1460465067829&pageNo=1&pageSize=300',
    // 默认图片地址
    DEFAULT_LIST_PIC: 'http://static1.ljcdn.com/h5/images/default/default_lianjia_small.png?_v=20160330192650',
    // 关注小区列表
    COMMUNITY_FAV_LIST: 'http://user.lianjia.com/site/communitydata/?perPage=100',
    COMMUNITY_FAV_LIST_SH: 'http://user.sh.lianjia.com/favor/getMyFavorPropertyList.json?v=1460454444656&pageNo=1&pageSize=400',
    // 根据小区和城市查询房源列表
    HOUSE_LIST_TPL: 'http://m.api.lianjia.com/house/ershoufang/searchv2?channel=ershoufang&community_id=${resblockId}&city_id=${cityId}&limit_count=100&limit_offset=0&access_token=1.0000c754c957704eae68d2f40954ed74c2&device_id=6f384597-4820-4700-bd7d-db2be72f51f5' + /**'&room_count=2'*/ + '&sort=priceTotal+asc&utm_source=',
    HOUSE_LIST_TPL_SH: 'http://soa.dooioo.com/api/v4/online/house/ershoufang/search?access_token=7poanTTBCymmgE0FOn1oKp&channel=ershoufang&cityCode=sh&client=wap&community_id=${communityId}&limit_count=200&limit_offset=0',
    // 关注房源
    DO_FAV_URL: 'http://nj.lianjia.com/api/SetHouseFav?id=${houseId}&isFav=${tag}',
    DO_FAV_URL_SH: 'http://sh.lianjia.com/ershoufang/addMyFavorHouse.json',
    // 取消关注房源_上海
    DO_UNFAV_URL_SH: 'http://sh.lianjia.com/ershoufang/delMyFavorHouse.json',
    // 详细页面
    DETAIL_URL: 'http://${cityCode}.lianjia.com/ershoufang/${houseId}.html',
    // 看房记录
    SEE_RECORD_URL: 'http://m.api.lianjia.com/house/house/seeRecord?house_code=${houseId}&limit_offset=0&access_token=1.008a3b4ee9dad02a7c8b8b3c4bac1948aa&utm_source=&device_id=dc228312a16266a991a0e0e4cc011976',
    SEE_RECORD_URL_SH: 'http://soa.dooioo.com/api/v4/online/house/ershoufang/seeRecord?access_token=7poanTTBCymmgE0FOn1oKp&client=wap&houseSellId=${houseId}&limit_offset=0'
};

if (window.define) {
    window.define(function (require) {return config;});
}
else {
    window.config = config;
}

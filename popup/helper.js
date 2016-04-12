define(
    function (require) {

        var store = require('store');
        var config = require('../config');
        var util = require('../util');

        function getCity() {
            return store.get('city');
        }

        function getDetailUrl(houseId) {
            var city = getCity();
            return util.format(
                config.DETAIL_URL,
                {
                    cityCode: city,
                    houseId: city === 'sh' ? ('sh' + houseId) : houseId
                }
            );
        }

        /**
         * m.lianjia.com和www.lianjia.com的api接口不一样
         * 这里要适配一下
         */
        function convertMHouseData(data) {
            var result = {};
            result.houseId = data.house_code;
            result.title = data.title;
            result.floorStat = data.floor_state;
            result.imgSrc = data.cover_pic;
            result.communityName = data.community_name;
            result.roomNum = data.blueprint_bedroom_num + '室' + data.blueprint_hall_num + '厅';
            result.square = data.area;
            result.price = data.price;
            result.unitPrice = data.unit_price;
            result.type = 'all';
            result.viewUrl = getDetailUrl(result.houseId);
            return result;
        }

        /**
         * m.lianjia.com和www.lianjia.com的api接口不一样
         * 这里要适配一下
         */
        function convertDooiooHouseData(data) {
            var result = {};
            result.houseId = data.houseSellId;
            result.title = data.title;
            result.floorStat = data.floorTypeName;
            result.imgSrc = data.mainPhotoUrl;
            result.communityName = data.propertyName;
            result.roomNum = data.room + '室' + data.hall + '厅';
            result.square = data.plateName;
            result.price = data.showPrice;
            result.unitPrice = data.unitPrice;
            result.viewUrl = getDetailUrl(result.houseId);
            result.valid = data.isSole === false;
            return result;
        }

        return {

            getCity: getCity,

            getCityCode: function () {
                var city = getCity();
                return {
                    nj: '320100'
                }[city];
            },

            getCommunityFavListUrl: function () {
                var city = getCity();
                return city === 'sh' ? config.COMMUNITY_FAV_LIST_SH : COMMUNITY_FAV_LIST;
            },

            getHouseListUrl: function (communityId) {
                var city = getCity();
                var cityCode = this.getCityCode();
                if (city === 'sh') {
                    return util.format(
                        config.HOUSE_LIST_TPL_SH,
                        {communityId: communityId}
                    );
                }
                else {
                    return util.format(
                        config.HOUSE_LIST_TPL,
                        {
                            resblockId: communityId,
                            cityId: cityCode
                        }
                    );
                }
            },

            getFavHouseListUrl: function () {
                var city = getCity();
                return city === 'sh' ? config.FAV_HOUSE_LIST_URL_SH : config.FAV_HOUSE_LIST_URL;
            },

            convertData: function (item) {
                if (item.house_code) {
                    return convertMHouseData(item);
                }
                else if (item.houseSellId) {
                    return convertDooiooHouseData(item);
                }
            }

        };
    }
);

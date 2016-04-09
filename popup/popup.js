/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab is found.
 */

define(
    function (require) {

        require('etpl/tpl!popup/list.tpl.html');

        var etpl = require('etpl');
        var $ = require('zepto');
        var util = require('util');
        var config = require('config');

        function showStatus(message) {
            $('#status').html(message).show();
        }

        function hideStatus() {
            $('#status').hide();
        }

        /**
         * 获取所有关注小区的房源
         */
        function getAllHouseList() {
            return util.getJSON(config.COMMUNITY_FAV_LIST).then(
                function (response) {
                    var data = response.data;
                    if (Array.isArray(data.list)) {
                        var urls = data.list.map(
                            function (item) {
                                return util.format(config.HOUSE_LIST_TPL, item);
                            }
                        );
                        return util.getJSONs(urls);
                    }
                    return Promise.resolved();
                }
            ).then(
                function (datas) {
                    var houses = [];
                    datas.forEach(
                        function (arg) {
                            houses = houses.concat(arg.data.list);
                        }
                    );
                    var filtedHouses = houses.filter(
                        item => {
                            return focusIds.indexOf(item.house_code) === -1
                        }
                    );
                    filtedHouses = filtedHouses.map(
                        item => {
                            var item = convertData(item);
                            item.isFaved = false;
                            return item;
                        }
                    );
                    renderList({list: filtedHouses}, {domId: '#all'});

                    // 获取所有房源id，以获取看房列表
                    var houseIds = houses.map(item => item.house_code);
                    getSeeRecordList(houseIds);
                }
            );
        }

        /**
         * 获取关注房源中已下架列表
         */
        function getFocusHouseList(callback) {
            // 获取关注房源
            return util.getJSON(config.INVALID_HOUSE_LIST_URL).then(
                function(response) {
                    var data = response.data;
                    // 存储所有已关注的id，在所有列表中排除这些已经关注的
                    focusIds = data.list.map(item => item.houseId);
                    // 强制成已关注，和普通列表区分
                    data.list.forEach(item => {item.isFaved = true;})
                    renderHouseList(data);
                    hideStatus();
                }
            );
        }

        /**
         * 获取看房记录
         */
        function getSeeRecordList(houseIds) {
            var urls = houseIds.map(
                houseId => {
                    var cityName = getCityName(houseId);
                    return util.format(
                        cityName === 'sh' ? config.SEE_RECORD_URL_SH : config.SEE_RECORD_URL,
                        {houseId: houseId}
                    );
                }
            );
            util.getJSONs(urls).then(
                function (datas) {
                    var records = [];
                    datas.forEach(
                        function (item) {
                            records = records.concat(item.data.see_record_list);
                        }
                    );
                    renderSeeRecordList(records);
                }
            );
        }

        var RENDER_LIST = [
            {
                domId: '#house-list',
                filter: function (item) {return item.valid;}
            },
            {
                domId: '#latest',
                filter: function (item) {return !item.valid;}
            }
        ];

        function renderHouseList(data) {
            RENDER_LIST.forEach(
                function (renderConfig) {
                    renderList(data, renderConfig);
                }
            );
        }

        function renderList(data, renderConfig) {
            var list = data.list;
            if (renderConfig.filter) {
                list = data.list.filter(renderConfig.filter);
            }
            list.forEach(
                function (item, index) {
                    item.imgSrc = item.imgSrc || config.DEFAULT_LIST_PIC;
                }
            );
            var domId = renderConfig.domId;
            var listRenderer = etpl.getRenderer('houseList');
            var html = listRenderer({list: list});
            $(domId).html(html);

            // 事件处理
            $(renderConfig.domId).on(
                'click',
                '.item',
                function (e) {
                    var itemElem = e.currentTarget;
                    var target = e.target;
                    if (target.tagName === 'BUTTON') {
                        var id = $(itemElem).attr('id');
                        var cityName = getCityName(id);
                        var isFaved = target.innerHTML === '取消关注';
                        var favUrl = cityName === 'sh'
                            ? (isFaved ? config.UNFAV_URL_SH : config.FAV_URL_SH) : config.FAV_URL_NJ;
                        id = cityName === 'sh' ? id.slice(2) : id;
                        util.getJSON(
                            util.format(
                                favUrl,
                                {
                                    house_code: id,
                                    tag: isFaved ? '0' : '1'
                                }
                            )
                        ).then(
                            function () {
                                $(target).html(isFaved ? '关注' : '取消关注');
                            }
                        );
                        return;
                    }
                    var url = $(this).attr('href');
                    util.openTab(url);
                }
            );
        }

        /**
         * 渲染看房记录
         */
        function renderSeeRecordList(records) {
            var listRenderer = etpl.getRenderer('recordList');
            var html = listRenderer({list: records});
            $('#see-records').html(html);
        }

        /**
         * m.lianjia.com和www.lianjia.com的api接口不一样
         * 这里要适配一下
         */
        function convertData(data) {
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
            result.cityName = getCityName(data.house_code);
            result.viewUrl = util.format(config.DETAIL_URL, result);
            return result;
        }

        function getCityName(id) {
            if (/^sh/i.test(id)) {
                return 'sh';
            }
            return 'nj';
        }

        // 记录已关注房源列表
        var focusIds = [];

        $(function() {
            // 初始化tab切换
            initTab();
            showStatus('Loading...');
            Promise.all(
                [getAllHouseList(), getFocusHouseList()]
            ).then(hideStatus);
        });

        function initTab() {
            $('.tab').on(
                'click',
                'li',
                activeItem
            );
            // 默认搞第一个
            activeItem({target: $('.tab li').get(0)});
        }

        function activeItem(e) {
            var target = e.target;
            $(target).siblings().each(
                function (index, item) {
                    $(item).removeClass('active');
                    var containerId = $(item).attr('for');
                    $('#' + containerId).hide();
                }
            );
            $(target).addClass('active');
            var containerId = $(target).attr('for');
            $('#' + containerId).show();
        }

    }
);

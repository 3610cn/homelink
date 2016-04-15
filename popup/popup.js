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
        var helper = require('./helper');

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
            var city = helper.getCity();
            var communityFavUrl = helper.getCommunityFavListUrl();
            return util.getJSON(communityFavUrl).then(
                function (response) {
                    var data = response.data;
                    var urls = [];
                    if (city === 'sh') {
                        urls = data.map(item => helper.getHouseListUrl(item.propertyNo));
                    }
                    else {
                        if (Array.isArray(data.list)) {
                            urls = data.list.map(
                                function (item) {
                                    return helper.getHouseListUrl(item.resblockId);
                                }
                            );
                        }
                    }
                    return util.getJSONs(urls);
                }
            ).then(
                function (datas) {
                    if (!util.isArray(datas)) {
                        return;
                    }
                    var houses = [];
                    datas.forEach(
                        function (arg) {
                            houses = houses.concat(arg.data.list);
                        }
                    );
                    houses = houses.map(
                        item => {
                            var item = helper.convertData(item);
                            // 既然能从这个接口获取到，那肯定是未失效房源
                            item.valid = true;
                            item.isFaved = false;
                            return item;
                        }
                    );
                    return {
                        allList: houses
                    };
                }
            );
        }

        /**
         * 获取关注房源中已下架列表
         */
        function getFocusHouseList(callback) {
            // 获取关注房源
            var url = helper.getFavHouseListUrl();
            return util.getJSON(url).then(
                function(response) {
                    var data = response.data;
                    var list = util.isArray(data) ? data : data.list;
                    // list返回可能是空字符串
                    list = list || [];
                    list = list.map(
                        item => {
                            var item = helper.convertData(item);
                            // 强制成已关注，和普通列表区分
                            item.isFaved = true;
                            return item;
                        }
                    );
                    return {
                        focusList: list
                    };
                }
            );
        }

        var RENDER_LIST = [
            {
                domId: '#latest',
                // 关注且已失效
                filter: function (item) {return !item.valid && item.isFaved;}
            },
            {
                domId: '#house-list',
                // 关注且未失效
                filter: function (item) {return item.valid && item.isFaved;}
            },
            {
                domId: '#all',
                filter: function (item) {return !item.isFaved;}
            }
        ];

        function renderHouseList(data) {
            RENDER_LIST.forEach(
                function (renderConfig) {
                    var list = data.list;
                    if (renderConfig.filter) {
                        list = list.filter(renderConfig.filter);
                    }
                    var domId = renderConfig.domId;
                    $(domId).data('list', list);
                    renderList(list, domId);
                }
            );
        }

        function renderList(list, domId) {
            var listRenderer = etpl.getRenderer('houseList');
            var html = listRenderer({list: list});
            $(domId).html(html);

            // 事件处理
            $(domId).on(
                'click',
                '.item',
                function (e) {
                    var itemElem = e.currentTarget;
                    var target = e.target;
                    if (target.tagName === 'BUTTON') {
                        var id = $(itemElem).attr('id');
                        var cityName = helper.getCity();
                        var isFaved = target.innerHTML === '取消关注';
                        var favUrl = cityName === 'sh'
                            ? (isFaved ? config.DO_UNFAV_URL_SH : config.DO_FAV_URL_SH) : config.DO_FAV_URL;
                        id = id.replace(/^sh/, '');
                        $.post(
                            util.format(
                                favUrl,
                                {
                                    houseId: id,
                                    tag: isFaved ? '0' : '1'
                                }
                            ),
                            {
                                houseSellId: id
                            },
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

            $('.room-num-filter').on(
                'change',
                function (e) {
                    var value = $(this).val();
                    var $elem = $(this).parents('.list');
                    var list = $elem.data('list');
                    if (value) {
                        list = list.filter(item => parseInt(item.roomNum, 10) === parseInt(value, 10));
                    }
                    renderList(list, '#' + $elem.attr('id'));
                    $elem.find('.room-num-filter').val(value);
                }
            )
        }


        function init() {
            // 初始化tab切换
            require('./tab').init();
            // 代理所有链接
            $('body').on(
                'click',
                'a',
                function (e) {
                    var target = e.target;
                    var href = target.href;
                    if (href) {
                        util.openTab(href);
                    }
                }
            );
        }

        // 记录已关注房源列表
        $(function() {
            init();
            showStatus('Loading...');
            Promise.all(
                [
                    // 所有符合条件房源
                    getAllHouseList(),
                    // 关注房源
                    getFocusHouseList()
                ]
            ).then(
                function (lists) {
                    hideStatus();

                    var data = util.reduce(lists, (a, b) => util.extend(a, b));

                    // 存储所有已关注的id，在所有列表中排除这些已经关注的
                    var focusIds = data.focusList.map(item => item.houseId);
                    var filtedHouses = data.allList.filter(
                        item => {
                            return focusIds.indexOf(item.houseId) === -1;
                        }
                    );

                    lists = data.focusList.concat(filtedHouses);
                    renderHouseList({list: lists});

                    // 获取所有房源id，以获取看房列表
                    var houseIds = util.flatten(lists).map(item => item.houseId);
                    houseIds = util.uniq(houseIds);
                    require('./seeRecord').render(
                        {
                            domId: '#see-records',
                            ids: houseIds
                        }
                    );
                }
            ).catch(
                function (xhr) {
                    showStatus('请登陆<a href="http://www.lianjia.com/">链家</a>后使用本插件。');
                }
            );
        });

    }
);

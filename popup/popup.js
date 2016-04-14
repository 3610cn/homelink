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
        var m = require('moment');
        var echarts = require('echarts');
        var helper = require('./helper');

        // 链接接口中跟时间相关的格式
        var TIME_FORMAT = 'YYYY-MM-DD';

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
                            item.isFaved = false;
                            return item;
                        }
                    );
                    var filtedHouses = houses.filter(
                        item => {
                            return focusIds.indexOf(item.houseId) === -1
                        }
                    );
                    renderList({list: filtedHouses}, {domId: '#all'});

                    return houses;
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
                    // 存储所有已关注的id，在所有列表中排除这些已经关注的
                    focusIds = list.map(item => item.houseId);
                    renderFocusHouseList({list: list});
                    return list;
                }
            );
        }

        /**
         * 获取看房记录
         */
        function getSeeRecordList(houseIds) {
            var urls = houseIds.map(
                houseId => {
                    var cityName = helper.getCity();
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
                    renderSeeRecordList(records, houseIds.length);
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

        function renderFocusHouseList(data) {
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
        }

        /**
         * 渲染看房记录
         */
        function renderSeeRecordList(records, houseCount) {
            var merged = {};
            records.forEach(
                function (record) {
                    record = m(record.see_time || record.lookTimeString, 'YYYY-MM-DD hh:mm:ss');
                    record = record.format(TIME_FORMAT);
                    if (merged[record] > 0) {
                        merged[record]++;
                    }
                    else {
                        merged[record] = 1;
                    }
                }
            );
            var newRecords = [];
            util.each(
                merged,
                function (value, key) {
                    key = m(key, TIME_FORMAT);
                    newRecords.push(
                        {
                            time: key.format(TIME_FORMAT),
                            week: [null, '一', '二', '三', '四', '五', '六', '日'][key.isoWeekday()],
                            count: value
                        }
                    );
                }
            );
            // 根据时间字段排序
            var timeSorter = function (a, b) {
                return m(a.time, TIME_FORMAT).isBefore(
                    m(b.time, TIME_FORMAT)
                ) ? -1 : 1;
            };

            newRecords.sort(timeSorter);

            // 这一段逻辑是为没有的日期补上数据，count默认为0
            var current = newRecords[0].time;
            current = m(current, TIME_FORMAT);
            var end = newRecords[newRecords.length - 1].time;
            end = m(end, TIME_FORMAT);
            var toAdd = [];
            while (true) {
                current.add(1, 'd');
                if (current.isSameOrAfter(end)) {
                    break;
                }
                var currentTime = current.format(TIME_FORMAT);
                if (!merged[currentTime]) {
                    toAdd.push(
                        {
                            time: currentTime,
                            count: 0
                        }
                    );
                }
            }

            var chartRecords = newRecords.concat(toAdd).sort(timeSorter);
            // 过滤2016-03-01之前的数据
            chartRecords = chartRecords.filter(
                function (record) {
                    if (m(record.time, TIME_FORMAT).isBefore(m('2016-03-01', TIME_FORMAT))) {
                        return false;
                    }
                    return true;
                }
            );

            // 基于准备好的dom，初始化echarts实例
            var recordChart = echarts.init(document.getElementById('see-records'));

            // 指定图表的配置项和数据
            var option = {
                title: {
                    text: '关注房源看房记录'
                },
                tooltip: {
                    show: true
                },
                legend: {
                    data:['看房记录']
                },
                xAxis: {
                    data: util.pluck(chartRecords, 'time')
                },
                yAxis: {},
                series: [{
                    name: '看房量',
                    type: 'line',
                    data: util.pluck(chartRecords, 'count')
                }]
            };
            recordChart.showLoading({text: 'Loading'});
            // 使用刚指定的配置项和数据显示图表。
            recordChart.setOption(option);
            recordChart.hideLoading();

            var listRenderer = etpl.getRenderer('recordList');
            var html = listRenderer(
                {
                    list: newRecords.reverse(),
                    count: records.length,
                    houseCount: houseCount,
                    avg: (records.length / houseCount).toFixed(2)
                }
            );
            $('#see-records').append(html);
        }

        // 记录已关注房源列表
        var focusIds = [];

        $(function() {
            // 初始化tab切换
            require('./tab').init();
            showStatus('Loading...');
            Promise.all(
                [getAllHouseList(), getFocusHouseList()]
            ).then(
                function (lists) {
                    hideStatus();

                    // 获取所有房源id，以获取看房列表
                    var houseIds = util.flatten(lists).map(item => item.houseId);
                    houseIds = util.uniq(houseIds);
                    getSeeRecordList(houseIds);
                }
            );
        });

    }
);

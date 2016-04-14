define(
    function (require) {

        var etpl = require('etpl');
        var $ = require('zepto');
        var util = require('util');
        var config = require('config');
        var m = require('moment');
        var echarts = require('echarts');
        var helper = require('./helper');

        // 链接接口中跟时间相关的格式
        var TIME_FORMAT = 'YYYY-MM-DD';

        /**
         * 获取看房记录
         */
        function getList(houseIds) {
            var urls = houseIds.map(
                houseId => {
                    var cityName = helper.getCity();
                    return util.format(
                        cityName === 'sh' ? config.SEE_RECORD_URL_SH : config.SEE_RECORD_URL,
                        {houseId: houseId}
                    );
                }
            );
            return util.getJSONs(urls).then(
                function (datas) {
                    var records = [];
                    datas.forEach(
                        function (item) {
                            records = records.concat(item.data.see_record_list);
                        }
                    );
                    return records;
                }
            );
        }

        /**
         * 渲染看房记录
         */
        function render(options) {
            var merged = {};
            var list = options.list;
            list.forEach(
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
            var recordChart = echarts.init($(options.domId).get(0));

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
                    count: list.length,
                    houseCount: options.count,
                    avg: (list.length / options.count).toFixed(2)
                }
            );
            $(options.domId).append(html);
        }

        return {
            render: function (options) {
                getList(options.ids).then(
                    function (list) {
                        render(
                            {
                                list: list,
                                count: options.ids.length,
                                domId: options.domId
                            }
                        );
                    }
                );
            }
        }
    }
);

define(
    function (require) {

        var m = require('moment');
        var util = require('underscore');
        var config = require('./config');
        var $ = require('zepto');
        var store = require('./store');

        /**
         * 字符串格式化
         *
         * 简单的格式化使用`${name}`进行占位
         *
         * @param {string} template 原字符串
         * @param {Object} data 用于模板替换的数据
         * @param {string} [pre] 变量前缀，默认'$'
         * @return {string} 格式化后的字符串
         */
        util.format = function (template, data, pre) {
            if (!template) {
                return '';
            }

            if (data == null) {
                return template;
            }

            pre = pre || '$';

            return template.replace(
                new RegExp('\\' + pre + '\\{(.+?)\\}', 'g'),
                function (match, key) {
                    var replacer = data[key];
                    if (typeof replacer === 'function') {
                        replacer = replacer(key);
                    }

                    return replacer == null ? '' : replacer;
                }
            );
        };

        var $getJSON = $.getJSON;

        /**
         * 包装了zepto的$.getJSON,目的是增加缓存机制
         */
        $.getJSON = function (url, callback) {
            var key = url.replace(/[^\w]/g, '-');
            var cache = store.get(key);
            if (cache) {
                console.log('[CACHE]', url, '[', cache.time, ']');
                callback(cache.data);
                setTimeout(
                    function(){
                        store.remove(key);
                    },
                    config.CACHE_MAX_AGE
                );
            }
            else {
                $getJSON(
                    url,
                    function (response) {
                        store.set(
                            key,
                            {
                                time: m().format('YYYY-MM-DD hh:mm:ss'),
                                data: response
                            }
                        );
                        // 过期后删除缓存
                        setTimeout(
                            function(){
                                store.remove(key);
                            },
                            config.CACHE_MAX_AGE
                        );
                        callback(response);
                    }
                );
            }
        };


        util.getJSON = function (url) {
            return new Promise(
                function (resolve, reject) {
                    $.getJSON(
                        url,
                        function (response) {
                            resolve(response);
                        }
                    );
                }
            );
        };

        util.getJSONs = function (urlList) {
            var promises = urlList.map(
                function (url) {
                    return util.getJSON(url);
                }
            );
            return Promise.all(promises);
        };

        util.openTab = function (url) {
            chrome.extension.sendMessage(
                {
                    action: 'opentab',
                    url: url
                }
            );
        };

        return util;
    }
);

define(
    function (require) {

        var util = require('underscore');

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

        return util;
    }
);

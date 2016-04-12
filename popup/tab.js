define(
    function (require) {

        var store = require('store');

        function init() {
            $('.tab').on(
                'click',
                'li',
                activeItem
            ).each(
                function (index, elem) {
                    // 默认搞第一个
                    activeItem({target: $(elem).children()[0]});
                }
            );

            // 城市切换
            $('.city-list').on(
                'click',
                'li',
                activeItem
            ).each(
                function (index, elem) {
                    var city = store.get('city');
                    if (!city) {
                        // 默认搞第一个
                        toggleCity({target: $(elem).children()[0]});
                    }
                }
            );
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

        function toggleCity(e) {
            var target = e.target;
            var city = $(target).data('city');
            if (city) {
                store.set('city', city);
                location.reload();
            }
        }

        return {
            init: init
        }
    }
);

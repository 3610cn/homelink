define(
    function (require) {

        var store = require('store');

        function init() {
            $('.tab:not(.city-list)').on(
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
                toggleCity
            ).each(
                function (index, elem) {
                    var origin = store.get('city');
                    var target = $(elem).children()[0];
                    if (origin) {
                        target = $(elem).find('[data-city="' + origin + '"]').get(0);
                    }
                    // 默认搞第一个
                    toggleCity({target: target});
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
            activeItem.apply(this, arguments);
            var origin = store.get('city');
            var target = e.target;
            var city = $(target).data('city');
            if (city !== origin) {
                store.set('city', city);
                location.reload();
            }
        }

        return {
            init: init
        }
    }
);

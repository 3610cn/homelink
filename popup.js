/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab is found.
 */
function getCurrentTabUrl(callback) {
    // Query filter to be passed to chrome.tabs.query - see
    // https://developer.chrome.com/extensions/tabs#method-query
    var queryInfo = {
        active: true,
        currentWindow: true
    };

    chrome.tabs.query(
        queryInfo,
        function(tabs) {
            var tab = tabs[0];
            var url = tab.url;
            callback(url);
        }
    );
}

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
    return util.getJSON(COMMUNITY_FAV_LIST).then(
        function (response) {
            var data = response.data;
            if (Array.isArray(data.list)) {
                var urls = data.list.map(
                    function (item) {
                        return util.format(HOUSE_LIST_TPL, item);
                    }
                );
                return util.getJSONs(urls);
            }
            return Promise.resolved();
        }
    );
}

/**
 * 获取房源列表
 */
function getFocusHouseList(callback) {
    showStatus('Loading...');
    $.getJSON(
        INVALID_HOUSE_LIST_URL,
        function (response) {
            var data = response.data;
            callback(data);
            hideStatus();
        }
    );
}

var SUMMARY_TPL = [
    '<p class="summary">合计 - ${count}个房源</p>'
].join('');

var ITEM_TPL = [
    '<li class="item ${customClass} item-${type}" href="${viewUrl}" id="${houseId}">',
    '   <h3>${title} (${floorStat})</h3>',
    '   <div class="image-panel">',
    '      <img src="${imgSrc}">',
    '   </div>',
    '   <div class="info-panel">',
    '      <span class="community">${communityName}</span>',
    '      <span class="room">${roomNum}</span>',
    '      <span class="square">${square}m</span>',
    '      <p class="price">${price}w | ${unitPrice} yuan/m</p>',
    '      <p class="operation"><button class="followbtn">关注</button></p>',
    '   </div>',
    '</li>'
].join('');

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
        function (config) {
            renderList(data, config);
        }
    );
}

function renderList(data, config) {
    var list = data.list;
    if (config.filter) {
        list = data.list.filter(config.filter);
    }
    var domId = config.domId;
    $(domId).html(util.format(SUMMARY_TPL, {count: list.length}));
    $(domId).append(
        $.map(
            list,
            function (item, index) {
                item.imgSrc = item.imgSrc || DEFAULT_LIST_PIC;
                return util.format(ITEM_TPL, item);
            }
        ).join('')
    );
    $(config.domId).on(
        'click',
        '.item',
        function (e) {
            var itemElem = e.currentTarget;
            var target = e.target;
            if (target.tagName === 'BUTTON') {
                var id = $(itemElem).attr('id');
                var cityCode = getCityCode(id);
                var isFaved = target.innerHTML === '取消关注';
                var favUrl = cityCode === 'sh'
                    ? (isFaved ? UNFAV_URL_SH : FAV_URL_SH) : FAV_URL_NJ;
                id = cityCode === 'sh' ? id.slice(2) : id;
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
            openTab(url);
        }
    );
}


function openTab(url) {
    chrome.extension.sendMessage(
        {
            action: 'opentab',
            url: url
        }
    );
}

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
    result.cityCode = getCityCode(data.house_code);
    result.viewUrl = util.format(DETAIL_URL, result);
    return result;
}

function getCityCode(id) {
    if (/^sh/i.test(id)) {
        return 'sh';
    }
    return 'nj';
}

// 记录已关注房源列表
var focusIds = [];

document.addEventListener(
    'DOMContentLoaded',
    function() {
        init();
        getCurrentTabUrl(
            function(url) {
                getFocusHouseList(
                    function(data) {
                        focusIds = data.list.map(item => item.houseId);
                        renderHouseList(data);
                    }
                );
                var houseList = [];
                getAllHouseList().then(
                    function (datas) {
                        var houses = [];
                        datas.forEach(
                            function (arg) {
                                houses = houses.concat(arg.data.list);
                            }
                        );
                        houses = houses.filter(
                            item => {
                                return focusIds.indexOf(item.house_code) === -1
                            }
                        );
                        houses = houses.map(item => convertData(item));
                        renderList({list: houses}, {domId: '#all'});
                    }
                );
            }
        );
    }
);

function init() {
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

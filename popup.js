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
 * 获取房源列表
 */
function getHouseList(callback) {
    showStatus('Loading...');
    $.getJSON(
        'http://user.lianjia.com/site/housedata/?filter=1&perPage=10000',
        function (response) {
            var data = response.data;
            callback(data);
            hideStatus();
        }
    );
}

var ITEM_TPL = [
    '<li class="item" href="${viewUrl}">',
    '   <h3>${title} (${floorStat})</h3>',
    '   <div class="image-panel">',
    '      <img src="${imgSrc}">',
    '   </div>',
    '   <div class="info-panel">',
    '      <span class="community">${communityName}</span>',
    '      <span class="room">${roomNum}</span>',
    '      <span class="square">${square}m</span>',
    '      <p class="price">${price}w | ${unitPrice} yuan/m</p>',
    '   </div>',
    '</li>'
].join('');

function renderHouseList(data) {
    $('#house-list').html(
        $.map(
            data.list,
            function (item, index) {
                item.imgSrc = item.imgSrc || 'http://static1.ljcdn.com/h5/images/default/default_lianjia_small.png?_v=20160330192650';
                return util.format(ITEM_TPL, item);
            }
        ).join('')
    );
    $('#house-list').on(
        'click',
        '.item',
        function () {
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

document.addEventListener(
    'DOMContentLoaded',
    function() {
        getCurrentTabUrl(
            function(url) {
                getHouseList(
                    function(data) {
                        renderHouseList(data);
                    }
                )
            }
        );
    }
);

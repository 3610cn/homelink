chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action == 'opentab') {
            chrome.tabs.create(
                {
                    url: request.url
                }
            );
        }
    }
);

// 背景红色
chrome.browserAction.setBadgeBackgroundColor({color: '#ff0000'});
function showUnread(num) {
    if (num) {
        chrome.browserAction.setBadgeText(
            {text: num + ''}
        );
    }
    else {
        hideUnread();
    }
}

function hideUnread() {
    chrome.browserAction.setBadgeText(
        {text: ''}
    );
}

// 每小时轮询一下最新房源
function poll() {
    $.getJSON(
        INVALID_HOUSE_LIST_URL,
        function (response) {
            var data = response.data;
            var num = data.list && data.list.length;
            if (num) {
                data.list = data.list.filter(
                    function (item) {
                        return !item.valid;
                    }
                );
                num = data.list.length;
            }
            showUnread(num)
        }
    );
}

setInterval(poll, 60 * 60 * 1000);
poll();

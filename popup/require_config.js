require.config({
    'baseUrl': '..',
    'paths': {
        'zepto': 'bower_components/zepto/zepto.min'
    },
    'waitSeconds': 10,
    'shim': {
        'zepto': {
            exports: 'Zepto'
        }
    },
    'packages': [
        {
            'name': 'etpl',
            'location': 'bower_components/etpl/src'
        },
        {
            'name': 'underscore',
            'location': 'bower_components/underscore',
            'main': 'underscore-min'
        }
    ]
});
require(['popup/popup']);

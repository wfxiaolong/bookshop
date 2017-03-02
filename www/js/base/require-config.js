
require.config({
    baseUrl: './',
    paths: {
        'app': 'js/base/app',
        'appConfig':'js/base/app-config',
        'routes': 'js/base/routes',
        'bootstrap':'js/base/bootstrap',
        'ngCordova': 'lib/ngCordova/dist/ng-cordova',
        'ionic': 'lib/ionic/js/ionic.bundle.min',
        'asyncLoader': 'lib/async-loader/angular-async-loader',
        'zepto': 'lib/zepto/zepto.min',
        'weixinJsSDK': 'lib/weixin/jweixin-1.0.0',
        'exif': 'lib/exif/exif',
    },
    shim: {
        'app': {
          deps: ['ionic']
        },
        'routes': {
          deps: ['ionic','app']
        },
        'appConfig':{
          deps: ['app']
        },
        'ionic' : {exports : 'ionic'},
       
    },
    priority: [
      'ionic',
      'app',
      'routes',
      'appConfig'
    ],
    deps: [
      'bootstrap'
    ]
});




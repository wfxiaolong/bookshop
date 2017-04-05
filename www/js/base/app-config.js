define(['app', 'js/utils/tips', 'weixinJsSDK'], function(app, Tips, wx) {
    app
        .config(['$ionicConfigProvider', '$sceDelegateProvider', function($ionicConfigProvider, $sceDelegateProvider) {
            $ionicConfigProvider.tabs.position('bottom'); // other values: top
            $ionicConfigProvider.platform.android.views.maxCache(5); //安卓缓存5个view，ios默认10个
            $ionicConfigProvider.platform.android.views.swipeBackEnabled(false); // disable swipe to go back functionality on iOS devices
            $ionicConfigProvider.views.swipeBackEnabled(false); // 禁止iOS端侧滑返回，防止出现白屏
            var isInApp = ionic.Platform.isWebView();
            var domain = 'http://abc.zhiwangyun.com';
            window.APP = {
                domain: domain,
                baseUrl: domain + '/Shop/',
            };
        }])
        .run(['$ionicPlatform', '$ionicLoading', '$rootScope', '$ionicHistory', 'Storage', '$state', 'httpRequest', '$rootScope', '$cordovaAppVersion', '$timeout',
            function($ionicPlatform, $ionicLoading, $rootScope, $ionicHistory, Storage, $state, httpRequest, $rootScope, $cordovaAppVersion, $timeout) {
                $rootScope.goBack = function() {
                    APP.isInApp ? console.log('appBack') : console.log('webBack');
                    if(APP.isInApp){
                        if(location.href.indexOf("/fromnotification") > 0){
                            $state.go("tab.index");
                        }else{
                          $ionicHistory.goBack()
                        }
                    }else{
                        if( location.href.indexOf("/share/") > 0 || location.href.indexOf("/fromnotification") > 0){
                            $state.go("tab.index");
                        }else{
                            history.back();
                        }
                    }
                };

                function getCookie(name) {
                    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
                    if (arr = document.cookie.match(reg))
                        return unescape(arr[2]);
                    else
                        return null;
                }

                // 获取设备号
                if (window.DMPush) {
                    //获取设备号device_token（供单播使用）
                    DMPush.get_device_token('获取设备号失败', function(re) {
                        APP.device_token = re;
                    }, function(re) {
                        APP.console = 'DMPush device_token_fail:' + re;
                    });
                }

                //注册loadding
                function showLoadding(noBackdrop, content) {
                    var tpl = '<div class="spinner"><div class="spinner-container container1"><div class="circle1"></div>' +
                        '<div class="circle2"></div><div class="circle3"></div><div class="circle4"></div></div>' +
                        '<div class="spinner-container container2"><div class="circle1"></div><div class="circle2">' +
                        '</div><div class="circle3"></div><div class="circle4"></div></div><div class="spinner-container container3">' +
                        '<div class="circle1"></div><div class="circle2"></div><div class="circle3"></div><div class="circle4">' +
                        '</div></div></div>';
                    if (content) {
                        tpl += ('<div class="row">' + content + '</div>')
                    }
                    $ionicLoading.show({
                        noBackdrop: noBackdrop,
                        template: tpl
                    });
                }
                $rootScope.$on('loadding', function(child, flag, content) {
                    if (flag == 'false') {
                        $ionicLoading.hide();
                    } else if (flag == 'noBackdrop') {
                        showLoadding(true, content);
                    } else {
                        showLoadding(false, content)
                    }
                })

                var htmlEl = angular.element(document.querySelector('html'));
                htmlEl.on("click", function(e) {
                    if (e.target.nodeName === "HTML" &&
                        $rootScope.popup) {
                        $rootScope.popup.close();
                        $rootScope.popup = null;
                    }
                });

                //注册安卓返回键
                var t = 0,
                    timeout,
                    iframeBack = 0;
                window.addEventListener("message", function(e) {
                    if (e.data == "doubleExit") { //夺宝页面的双击退出
                        if (iframeBack < 1) {
                            Tips.showTips('双击退出应用', 1000);
                            iframeBack++;
                            timeout = setTimeout(function() {
                                iframeBack = 0
                            }, 300)
                        } else {
                            clearTimeout(timeout);
                            ionic.Platform.exitApp();
                        }
                    }
                }, false);
                $ionicPlatform.registerBackButtonAction(function(e) {
                    var backButtonAction = { //根据需要修改对应state
                        'tab.index': 'doubleExit',
                        'tab.discover': 'doubleExit',
                        'tab.community': 'doubleExit',
                        'tab.yiyuan': 'iframeBack',
                        'tab.user': 'doubleExit'
                    }
                    var pageState = $state.current.name;
                    if (backButtonAction[pageState] == 'doubleExit') {
                        if (t < 1) {
                            Tips.showTips('双击退出应用', 1000);
                            t++;
                            timeout = setTimeout(function() {
                                t = 0
                            }, 300)
                        } else {
                            clearTimeout(timeout);
                            ionic.Platform.exitApp();
                        }
                    } else if (backButtonAction[pageState] == 'doubleBack') {
                        $ionicHistory.goBack(-2);
                    } else if (backButtonAction[pageState] == 'threeBack') {
                        $ionicHistory.goBack(-3);
                    } else if (backButtonAction[pageState] == 'iframeBack') {
                        var win = document.querySelector('iframe').contentWindow;
                        win.postMessage('goBack', "*");
                    } else if(location.href.indexOf("/fromnotification") > 0){
                        $state.go("tab.index");
                    }else{
                        $ionicHistory.goBack();
                    }
                    e.preventDefault();
                    return false;
                }, 101);

                $ionicPlatform.ready(function() {
                    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
                    // for form inputs)
                    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                        cordova.plugins.Keyboard.disableScroll(true);

                    }
                    if (window.StatusBar) {
                        // org.apache.cordova.statusbar required
                        StatusBar.styleLightContent();
                    }
                });
            }
        ])
});

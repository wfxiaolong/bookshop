define(['app', 'js/utils/tips', 'weixinJsSDK'], function(app, Tips, wx) {
    app
        .config(['$ionicConfigProvider', '$sceDelegateProvider', function($ionicConfigProvider, $sceDelegateProvider) {
            $ionicConfigProvider.tabs.position('bottom'); // other values: top
            $ionicConfigProvider.platform.android.views.maxCache(5); //安卓缓存5个view，ios默认10个
            $ionicConfigProvider.platform.android.views.swipeBackEnabled(false); // disable swipe to go back functionality on iOS devices
            $ionicConfigProvider.views.swipeBackEnabled(false); // 禁止iOS端侧滑返回，防止出现白屏
            $sceDelegateProvider.resourceUrlWhitelist([
                // Allow same origin resource loads.
                'self',
                // Allow loading from our assets domain.  Notice the difference between * and **.
                'http://srv*.assets.example.com/**',
                'http://*.qq.com',
                'https://*.qq.com',
                'http://*.weishi.com',
                'https://*.weishi.com'
            ]);
            // var domain = 'http://c.damaiplus.com/vrsm/web';
            var isInApp = ionic.Platform.isWebView();
            var domain = 'http://weiyaxunda.com'; //上架用域名
            window.APP = {
                domain: domain,
                baseUrl: domain + '/api/',
                shareUrl: domain + '/wechat/www/', //用于分享时的链接
                duobaoUrl: domain + '/1vr/apps/webapp/www/?t=' + new Date().getTime() + '&isInApp=' + isInApp +'/', //夺宝页面的链接 还要传一个是否为app的参数
                // app_version: 'V1.0.5',
                app_key: 'WION45908BN982NG9LZ01M59RJT9UTGH4',
                platform: 2, //1:iOS 2:android 3:web
                isIOS: ionic.Platform.isIOS() || ionic.Platform.isIPad(),
                is_wechat: ionic.Platform.ua.toLowerCase().match(/MicroMessenger/i) == "micromessenger",
                isInApp: ionic.Platform.isWebView()
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

                $rootScope.goWechatLogin = function(tabUrl){
                    //传入'#/tab/yiyuan'
                    var url = tabUrl ? tabUrl:'';
                    var APPID = 'wxc2748067aeb1700c';
                    var redirectUrl = encodeURIComponent(APP.domain + '/wechat/www/'+url);
                    REDIRECT_URI = encodeURIComponent(APP.domain + '/wxAuth.php?url=' + redirectUrl);
                    requestURL = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + APPID + '&redirect_uri=' + REDIRECT_URI + '&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect'
                    location.href = requestURL;
                }

                //微信版检测登录  (不是从share进入)
                if (APP.is_wechat && !APP.isInApp && location.href.indexOf("/share/") < 0) {
                    if (!getCookie('uid')) { //未登录的情况
                        if(location.href.indexOf('tab/yiyuan')>0){
                            $rootScope.goWechatLogin('#/tab/yiyuan');
                            return;
                        }
                        $rootScope.goWechatLogin();
                    } else { //已登录则从cookie读取数据写到localStorage
                        var auth = {
                            uid: getCookie('uid'),
                            token: getCookie('token'),
                            nickname: getCookie('nickname'),
                            user_img: getCookie('user_img'),
                        };
                        Storage.set('vrsm_auth', auth);
                    }
                }


                // 微信jsdk初始化
                if (APP.is_wechat && !APP.isInApp) {
                    httpRequest.post('?method=user.weChatWebSign', { url: location.href.split('#')[0] }, function(re) {
                        if (re.data.state) {
                            var data = re.data.data;
                            wx.config({
                                debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                                appId: data.appId, // 必填，公众号的唯一标识
                                timestamp: data.timestamp, // 必填，生成签名的时间戳
                                nonceStr: data.nonceStr, // 必填，生成签名的随机串
                                signature: data.signature, // 必填，签名，见附录1
                                jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'chooseImage'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
                            });
                        }
                    }, function(re) {
                        Tips.showTips(re.msg)
                    });
                }

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

                // 安卓获取推送消息以执行后续动作
                if (window.DMPush && !APP.isIOS) {
                    DMPush.get_newest_notification("获取推送消息失败", function(re) {
                        APP.newest_notification = re;
                        if (Storage.get("newest_notification_id") == null) { Storage.set("newest_notification_id", re.msg_id); }
                        var old_notification_id = Storage.get("newest_notification_id");
                        if (old_notification_id != re.msg_id) {
                            Storage.set("newest_notification_id", re.msg_id);
                            if (re.extra.push_type == 2) { // 进入商品详情
                                $state.go("indexProDetail", { goodId: re.extra.id, fromNotification: 'fromnotification' });
                            }
                        }
                        console.log(re);
                    }, function(re) {
                        APP.get_newest_notification_console = 'DMPush get_newest_notification:' + re;
                    })
                    console.log(window.APP);
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

                //需要登录检测
                $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
                    var name = toState.name;
                    var needLogin = {
                        follow: true,
                        myCommunity: true,
                        repairApplies: true,
                        balance: true,
                        orders: true,
                        speak: true,
                        coupon: true,
                        message: true,
                        collection: true,
                        myYiyuan: true,
                    };
                    if (needLogin[name] && !APP.is_wechat) {
                        try {
                            if (!Storage.get('vrsm_auth')) {
                                event.preventDefault();
                                $state.go('login');
                                Tips.showTips('请先登录！！');
                            } else {}
                        } catch (e) {
                            console.error('登录判断跳转出错' + e.name + '：' + e.message);
                        }
                    }
                    $ionicLoading.hide();
                });

                var htmlEl = angular.element(document.querySelector('html'));
                htmlEl.on("click", function(e) {
                    if (e.target.nodeName === "HTML" &&
                        $rootScope.popup) {
                        $rootScope.popup.close();
                        $rootScope.popup = null;
                    }
                });
                //微信登录、支付配置
                // var params = {
                //     wechatKey: "wxffbb158f276a034b",
                //     wechatSecret: "819d8da9aeb82103113f1e867c736593",
                //     sinaKey: "3330737535",
                //     sinaSecret: "7484cab3d473b4eaa8e50477acc3622e",
                //     tecentKey: "1105526408",
                //     tecentSecret: "jQqcjOU7QKhomCGS"
                // };
                // 上线用参数
                var params = {
                    wechatKey: "wxc39d57e6c9a923c1",
                    wechatSecret: "a2ff4f82211f9c450c53a2659549198c",
                    sinaKey: "3330737535",
                    sinaSecret: "7484cab3d473b4eaa8e50477acc3622e",
                    tecentKey: "1105526100",
                    tecentSecret: "xD5RSDqNV6KDZXzu"
                };
                if (ionic.Platform.isWebView()) {
                    dmwechat.init(params, function(re) {}, function(re) {});
                }

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

define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('indexCtrl', ['$scope', 'httpRequest', 'Storage', '$state', '$ionicSlideBoxDelegate', '$rootScope', '$anchorScroll', '$location', '$ionicPopup', '$cordovaAppVersion', '$ionicLoading', '$cordovaFileTransfer', '$cordovaFileOpener2', '$timeout', '$cordovaInAppBrowser',
        function($scope, httpRequest, Storage, $state, $ionicSlideBoxDelegate, $rootScope, $anchorScroll, $location, $ionicPopup, $cordovaAppVersion, $ionicLoading, $cordovaFileTransfer, $cordovaFileOpener2, $timeout, $cordovaInAppBrowser) {
            var is_init = false; // 缓存页面，第一次初始化后再次进入不再默认初始化
            var is_update = false; // 首次进入app时检查是否有新版本并且提示用户是否更新
            $scope.is_show = false; // 是否显示注册弹窗
            $scope.$on("$ionicView.beforeEnter", function() {
                // 关闭显示注册弹窗
                $scope.close_modal = function() {
                    $scope.is_show = false;
                }

                $scope.slideHasChanged = function(index) {
                    if ($scope.dpSlides.length == 2) {
                        if (index == 1 || index == 0) {
                            $scope.slidePageHack = false;
                        } else {
                            $scope.slidePageHack = true;
                        }
                    }
                }

                // 点击跳转到注册界面
                $scope.goto_register = function() {
                    $scope.is_show = false;
                    $state.go("login", { fromPage: "index" });
                }

                // 设置键盘跟随....
                if (APP.isIOS && APP.isInApp && window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.disableScroll(false);
                }

                var auth = $scope.auth = Storage.get('vrsm_auth');

                if (!is_update && !is_iOS) {
                    checkUpdate_android();
                }

                if (!is_update && is_iOS) {
                    checkUpdate_iOS();
                }

                if (!is_init) {
                    init();
                }
            });
            
            $scope.user = Storage.get('vrsm_auth');

            // 点击图片跳转到注册页面
            $scope.goLogin = function() {
                $state.go("login");
            }

            //刷新
            $scope.doRefresh = function() {
                // //根据屏幕宽度初始化swiper的高度
                // initSwiperHeight(1125 / 470, function() {
                //     // 获取顶部banner
                //     httpRequest.post('?method=website.bannerList', { type: 1 }, function(re) {
                //         if (re.data.state) {
                //             $scope.indexBanner = re.data.data;
                //             $ionicSlideBoxDelegate.$getByHandle('my-handle').update();
                //             $ionicSlideBoxDelegate.$getByHandle('my-handle').loop(true);
                //         }
                //     }, function(re) {}, function(re) { checkHttpDone(); });
                //     // 最热活动图片
                //     httpRequest.post('?method=website.bannerList', { type: 2 }, function(re) {
                //         if (re.data.state) {
                //             $scope.dpSlides = re.data.data;
                //             // $ionicSlideBoxDelegate.update();
                //             // $ionicSlideBoxDelegate.loop(true);
                //             $ionicSlideBoxDelegate.$getByHandle('hot').update();
                //             $ionicSlideBoxDelegate.$getByHandle('hot').loop(true);
                //         }
                //     }, function(re) {}, function(re) { checkHttpDone(); });
                // });
                init();
            };

            //跳转该分类下的商品
            $scope.goIndexClassify = function(v) {
                var params = { classifyId: v.id || v.category_id, brands: JSON.stringify(v.child), name: v.name };
                $state.go('indexClassify', params);
            };

            //跳转我的消息
            $scope.jumpMyMessage = function() {
                if ($scope.auth) {
                    $state.go('message');
                } else {
                    Tips.showTips('您还未登录');
                }
            };
            //跳转购物车
            $scope.jumpCart = function() {
                if ($scope.auth) {
                    $state.go('cart');
                } else {
                    Tips.showTips('您还未登录');
                }
            };
            $scope.jumpOtherUrl = function(v, event) { //跳外链
                if (!APP.isIOS && APP.isInApp) { //安卓APP
                    event.preventDefault();
                    $state.go('iframePage', { url: v.url });
                } else {
                    return;
                }
            };
            $scope.jumpInfo = function(v) { //跳资讯
                switch (Number(v.url_type)) {
                    case 1:
                        $state.go('infoDetail', { infoId: v.url.id });
                        break;
                    case 2:
                        $state.go('indexProDetail', { goodId: v.url.id });
                        break;
                    case 4:
                        $state.go('tab.yiyuan');
                        break;
                    default:
                        // statements_def
                        break;
                }
            };

            $scope.jumpDetail = function(v) {
                $state.go("indexProDetail", { goodId: v.id }, { reload: true });
                $location.hash(v.id);
                $anchorScroll();
            }

            function initSwiperHeight(percent, callBackFunc) {
                var width = document.body.clientWidth;
                var height = width / percent;
                var swipers = angular.element(document.getElementsByClassName('swiper'));
                swipers.css('height', height + 'px');
                if (typeof callBackFunc == 'function') callBackFunc();
            }

            //初始化操作
            function init() {
                $scope.count = $scope.auth ? 6 : 5;
                // if ($scope.auth) {
                //     //获取新消息提醒
                //     httpRequest.postWithAuth($scope, '?method=userInfo.attention', {}, function(re) {
                //         if (re.data.state) {
                //             $rootScope.newMessage = re.data.data.message > 0 ? true : false;
                //         }
                //     }, function(re) {
                //         console.log(re.data);
                //     }, function(re) { checkHttpDone(); });
                // }
                // //获取商城显示的分类以及商品
                // httpRequest.post('?method=shop.indexGood', {}, function(re) {
                //     if (re.data.state) {
                //         $scope.shopIndexGood = re.data.data;
                //     }
                // }, function(re) {}, function(re) { checkHttpDone(); });
                // //获取资讯(按点赞数排前3条)
                // httpRequest.postWithUI($scope, '?method=cms.articleList', { type: 1, page: 1, each: 3, order_type: 3 }, function(re) {
                //     if (re.data.state) {
                //         $scope.articleList = re.data.data.list;
                //     }
                // }, function(re) {
                //     Tips.showTips(re.data);
                // }, function(re) { checkHttpDone(); });
                // //获取商城分类
                // $scope.shopCategory = [];
                // httpRequest.post('?method=shop.category', {}, function(re) {
                //     if (re.data.state) {
                //         if (re.data.data.length <= 10) {
                //             $scope.shopCategory = re.data.data;
                //             $scope.is_shopCategory_slide = false;
                //             return;
                //         }
                //         var tempArr = [];
                //         for (var i = 0, len = re.data.data.length; i < len; i++) {
                //             tempArr.push(re.data.data[i]);
                //             var k = i + 1;
                //             if (k % 10 == 0) {
                //                 $scope.shopCategory.push(tempArr);
                //                 tempArr = [];
                //             }
                //             if (k == len && tempArr.length > 0) {
                //                 $scope.shopCategory.push(tempArr);
                //                 tempArr = [];
                //             }
                //         }
                //         $scope.is_shopCategory_slide = true;
                //         $ionicSlideBoxDelegate.update();
                //     }
                // }, function(re) {}, function(re) { checkHttpDone(); console.log($scope.shopCategory);});
                is_init = true;
            }

            function checkHttpDone() {
                $scope.count--;
                if ($scope.count == 0) {
                    $scope.$broadcast('scroll.refreshComplete');
                }
            }

            function hasUpdate(serverVersion, appVersion) {
                serverVersion = serverVersion.substring(1);
                var newArr = serverVersion.split('.');
                var nowArr = appVersion.split('.');
                var length = newArr.length;
                for (var i = 0; i < length; i++) {
                    if (nowArr[i] < newArr[i]) return true;
                }
                return false;
            };
        }
    ]);

});

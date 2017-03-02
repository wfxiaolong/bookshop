define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('communityCtrl', ['$scope', 'httpRequest', 'Storage', '$state', '$ionicSlideBoxDelegate',
        function($scope, httpRequest, Storage, $state, $ionicSlideBoxDelegate) {
            var is_init = false;
            $scope.$on("$ionicView.beforeEnter", function() {
                if (!is_init) {
                    console.log(123);
                    init();
                }
            });
            // 下拉刷新
            $scope.doRefresh = function() {
                init();
            }
            // 初始化
            function init() {
                initSwiperHeight(750 / 470, function() { //根据屏幕宽度初始化swiper的高度
                    // 获取顶部banner
                    httpRequest.postWithUI($scope, '?method=website.bannerList', { type: 4 }, function(re) {
                        if (re.data.state) {
                            $scope.communityBanner = re.data.data;
                            $ionicSlideBoxDelegate.update();
                            $ionicSlideBoxDelegate.loop(true);
                        }
                    }, function(re) {
                        Tips.showTips(re.data.msg);
                    }, function() {
                        checkHttpDone();
                    });
                });
                if (Storage.get('vrsm_auth')) {
                    //获取我关注的版块
                    httpRequest.postWithAuth($scope, '?method=cms.collectList', { type: 3 }, function(re) {
                        if (re.data.state) {
                            var data = re.data.data.list;
                            $scope.myModule = data;
                        }
                    }, function(re) {
                        Tips.showTips(re.data.msg);
                    });
                }
                //获取热帖
                httpRequest.postWithUI($scope, '?method=cms.articleList', { type: 2, order_type: 3 }, function(re) {
                    if (re.data.state) {
                        var data = re.data.data.list;
                        if (data.length == 0) return true;
                        $scope.hotPost = [data[0], data[1], data[2]];
                    }
                }, function(re) {}, function() {checkHttpDone();});
                //获取版块
                $scope.categories = [];
                httpRequest.postWithUI($scope, '?method=cms.category', { type: 2 }, function(re) {
                    // if (re.data.state) {
                    //     var data = re.data.data;
                    //     $scope.categories = [data[0], data[1], data[2], data[3]];

                    // }
                    if (re.data.state) {
                        if (re.data.data.length <= 10) {
                            $scope.categories = re.data.data;
                            $scope.is_categories_slide = false;
                            return;
                        }
                        var tempArr = [];
                        for (var i = 0, len = re.data.data.length; i < len; i++) {
                            tempArr.push(re.data.data[i]);
                            var k = i + 1;
                            if (k % 10 == 0) {
                                $scope.categories.push(tempArr);
                                tempArr = [];
                            }
                            if (k == len && tempArr.length > 0) {
                                $scope.categories.push(tempArr);
                                tempArr = [];
                            }
                        }
                        $scope.is_categories_slide = true;
                        // $ionicSlideBoxDelegate.update();
                    }
                }, function(re) {
                    Tips.showTips(re.data.msg);
                }, function() {
                        console.log($scope.categories);
                        console.log($scope.is_categories_slide);
                    });
                is_init = true;
            }

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

            function initSwiperHeight(percent, callBackFunc) {
                var width = document.body.clientWidth;
                var height = width / percent;
                var swipers = angular.element(document.getElementsByClassName('swiper'));
                swipers.css('height', height + 'px');
                callBackFunc();
            }

            function checkHttpDone() {
                    $scope.$broadcast('scroll.refreshComplete');
            }
        }
    ]);

});

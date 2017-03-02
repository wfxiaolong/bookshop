define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('repairCenterCtrl', ['$scope', 'httpRequest', 'Storage', '$state', '$ionicSlideBoxDelegate', '$timeout',
        function($scope, httpRequest, Storage, $state, $ionicSlideBoxDelegate, $timeout) {
            $scope.$on("$ionicView.beforeEnter", function() {
                initSwiperHeight(750 / 470); //根据屏幕宽度初始化swiper的高度
                // 获取顶部banner
                httpRequest.postWithUI($scope, '?method=website.bannerList', { type: 3 }, function(re) {
                    if (re.data.state) {
                        $scope.repairBanner = re.data.data;
                        $ionicSlideBoxDelegate.update();
                        $ionicSlideBoxDelegate.loop(true);
                    }
                }, function(re) {
                    console.log(re.data.msg);
                });
            });
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
            $scope.goBackCustom = function() {
                $state.go("tab.index");
            };
            function initSwiperHeight(percent) {
                var width = document.body.clientWidth;
                var height = width / percent;
                var swipers = angular.element(document.getElementsByClassName('swiper'));
                swipers.css('height', height + 'px');
            }
        }
    ]);

});

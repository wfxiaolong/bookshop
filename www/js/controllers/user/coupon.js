define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('couponCtrl', ['$scope', 'Storage', 'httpRequest', '$ionicScrollDelegate',
        function($scope, Storage, httpRequest, $ionicScrollDelegate) {
            $scope.$on("$ionicView.beforeEnter", function() {
                $scope.page = 1;
                $scope.couponList = [];
                $scope.repairCouponList = [];
                getData($scope.page);
            });
            $scope.changeType = function(type) {
                if (type == $scope.type) return;
                $scope.couponList = [];
                $scope.repairCouponList = [];
                $ionicScrollDelegate.scrollTop();
                $scope.type = type;
                $scope.page = 1;
                $scope.noData = false;
                getData($scope.page);
            };
            $scope.loadMore = function() {
                if ($scope.page == 1) return;
                getData($scope.page);
            };

            function getData(page) {
                httpRequest.postWithAuth($scope, '?method=coupon.myCouponList', { page: page, type: $scope.type || 1 }, function(re) {
                    if (re.data.state) {
                        var data = re.data.data.list;
                        $scope.page++;
                        if ($scope.type == 2) { //type一开始是不赋值的所以要判断是不是等于2
                            $scope.repairCouponList = $scope.repairCouponList.concat(data);
                        } else {
                            $scope.couponList = $scope.couponList.concat(data);
                        }
                        if (data.length < 10) {
                            $scope.noData = true;
                        }
                    }
                }, function(re) {
                    Tips.showTips(re.data.msg);
                }, function(re) {
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                });
            }
        }
    ]);

});

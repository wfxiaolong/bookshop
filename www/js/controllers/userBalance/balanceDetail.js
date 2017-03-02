define(['app', 'js/utils/tips'], function(app,Tips) {
    app.controller('balanceDetailCtrl', ['$scope', 'Storage', 'httpRequest', '$state', function($scope, Storage, httpRequest, $state) {
        $scope.$on("$ionicView.beforeEnter", function() {
            var type = $state.params.type;
            $scope.page = 1;
            $scope.detailList = [];
            //type == 1时为余额明细，否则为夺宝币明细
            $scope.url = (type == 1) ? '?method=userInfo.purseMoneyDetail' : '?method=userInfo.duobaoMoneyDetail';
            $scope.title = (type == 1) ? '余额明细' : '夺宝币明细';
            getDetail($scope.page, $scope.url);
        });
        $scope.loadMore = function() {
            if ($scope.page == 1) return;
            getDetail($scope.page, $scope.url);
        };

        function getDetail(page, url) {
            httpRequest.postWithAuth($scope, url, { page: page }, function(re) {
                if (re.data.state) {
                    var data = re.data.data.list;
                    $scope.page++;
                    $scope.detailList = $scope.detailList.concat(data);
                    if (data.length < 10) {
                        $scope.noData = true;
                    }
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                }
            }, function(re) {
                Tips.showTips(re.data.msg);
            });
        }
    }]);

});

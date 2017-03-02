define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('repairAppliesCtrl', ['$scope', 'httpRequest', 'Storage', '$state', '$ionicSlideBoxDelegate',
        function($scope, httpRequest, Storage, $state, $ionicSlideBoxDelegate) {
            $scope.$on("$ionicView.beforeEnter", function() {
                $scope.jumpId = -1;
                $scope.standard = -1;
                $scope.model = -1;
                $scope.goodNum = 1;
                $scope.pid = $state.params.pid;
                $scope.trade = "haha";
                httpRequest.postWithAuth($scope, '?method=repair.repairOrderList', {  }, function(re) {
                    if (re.data.state) {
                        $scope.orderLists = re.data.data.list;
                    }
                }, function(re) {
                    Tips.showTips(re.data.msg);
                });
            });
            // 点击进入订单详情
            $scope.toOrderDetail = function(orderId) {
                $state.go("repairStatus", {orderId: orderId})
            }


        }
    ]);
});

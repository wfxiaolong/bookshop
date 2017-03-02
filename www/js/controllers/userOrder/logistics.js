define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('logisticsCtrl', ['$scope', 'Storage', 'httpRequest', '$ionicScrollDelegate', '$ionicPopup', '$state',
        function($scope, Storage, httpRequest, $ionicScrollDelegate, $ionicPopup, $state) {
            $scope.$on("$ionicView.beforeEnter", function() {
                httpRequest.postWithAuth($scope, '?method=shop.shopExpress', { order_id: $state.params.orderId }, function(re) {
                    if (re.data.state) {
                    	$scope.express = re.data.data;
                        console.log(re.data.data)
                    }
                }, function(re) {
                    Tips.showTips(re.data.msg);
                });
            });
        }
    ]);

});

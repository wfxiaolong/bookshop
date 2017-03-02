define(['app','js/utils/tips'], function(app) {
    app.controller('balanceCtrl', ['$scope', 'Storage', 'httpRequest', function($scope, Storage, httpRequest) {
        $scope.$on("$ionicView.beforeEnter", function() {
            httpRequest.postWithAuth($scope, '?method=userInfo.userMoney', {}, function(re) {
                if (re.data.state) {
                    var data = re.data.data;
                    $scope.balance = data.purse_money;
                    $scope.duobaoMoney = data.duobao_money;
                    $scope.purseStatus = data.purse_status;
                    Storage.setAttr('vrsm_auth', 'purse_status', data.purse_status);
                }
            }, function(re) {
                Tips.showTips(re.data.msg);
            });
        });
    }]);

});

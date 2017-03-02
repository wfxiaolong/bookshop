define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('messageDetailCtrl', ['$scope', 'Storage', 'httpRequest', '$state', function($scope, Storage, httpRequest, $state) {
        $scope.$on("$ionicView.beforeEnter", function() {
            var messageId = $state.params.messageId;
            httpRequest.postWithAuth($scope, '?method=userInfo.messageInfo', { id: messageId }, function(re) {
                if (re.data.state) {
                    $scope.message = re.data.data;
                }
            }, function(re) {
                Tips.showTips(re.data.msg);
            });
        });
    }]);

});

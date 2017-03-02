define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('paySuccessCtrl', ['$scope', 'Storage', 'httpRequest', '$state', '$ionicHistory', '$ionicPopup', function($scope, Storage, httpRequest, $state, $ionicHistory, $ionicPopup) {
        $scope.$on("$ionicView.beforeEnter", function() {
            $scope.orderId = $state.params.orderId;
        });
    }]);

});

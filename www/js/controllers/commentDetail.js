define(['app'], function(app) {

    app.controller('commentDetailCtrl', ['$scope', function($scope) {

        $scope.$on("$ionicView.beforeEnter", function() {})
        $scope.popShow = function(popName) {
            $scope[popName] = true;
        }
        $scope.popHide = function(popName) {
            $scope[popName] = false;
        }
    }]);
});

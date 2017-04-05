define(['app'], function(app) {
    app.controller('userCtrl', ['$scope', 'Storage', 'httpRequest', '$rootScope', function($scope, Storage, httpRequest, $rootScope) {
        $scope.$on("$ionicView.beforeEnter", function() {
            $scope.auth = Storage.get('vrsm_auth');
            if ($scope.auth) { //判断是否登录
                $scope.noLogin = false;
            } else {
                $scope.noLogin = true;
            }
        });

        function setUserInfo(data) {
            $scope.user = data;
        }
    }]);

});

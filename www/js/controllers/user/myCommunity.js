define(['app'], function(app) {
    app.controller('myCommunityCtrl', ['$scope', 'Storage','httpRequest', function($scope, Storage, httpRequest) {
        $scope.$on("$ionicView.beforeEnter", function() {
            httpRequest.postWithAuth($scope, '?method=userInfo.userDetail', {}, function(re) {
                if (re.data.state) {
                    var data = re.data.data;
                    setUserInfo(data);
                }
            }, function(re) {
                console.log(re.data.msg);
            });

            httpRequest.postWithUI($scope, '?method=userInfo.levelInfo', {}, function(re) {
                if (re.data.state) {
                    var data = re.data.data;
                    $scope.levelRules = data;
                }
            }, function(re) {
                console.log(re.data.msg);
            });
        });

        function setUserInfo(data) {
            $scope.avatar = data.user_img;
            $scope.nickname = data.nickname;
            $scope.point = data.point;
            $scope.level = data.level;
        };

    }]);

});

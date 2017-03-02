define(['app'], function(app) {
    app.controller('userCtrl', ['$scope', 'Storage', 'httpRequest', '$rootScope', function($scope, Storage, httpRequest, $rootScope) {
        $scope.$on("$ionicView.beforeEnter", function() {
            var auth = Storage.get('vrsm_auth');
            if (auth) { //判断是否登录
                if (auth.phone_status) { //判断是否拉取过个人信息
                    setUserInfo(auth);
                } else {
                    httpRequest.postWithAuthUser($scope, '?method=userInfo.userDetail', {}, function(re) {
                        if (re.data.state) {
                            var data = re.data.data;
                            auth = angular.merge(auth, data);
                            setUserInfo(auth);
                            Storage.set('vrsm_auth', auth);
                        }
                    }, function(re) {

                    });
                }
                //获取新消息提醒
                httpRequest.postWithAuthUser($scope, '?method=userInfo.attention', {}, function(re) {
                    if (re.data.state) {
                        $rootScope.newMessage = re.data.data.message > 0 ? true : false;
                    }
                }, function(re) {
                    console.log(re.data.msg);
                });
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

define(['app', 'js/utils/tips'], function(app, Tips) {

    app.controller('editNameCtrl', ['$scope', '$state', 'httpRequest', '$ionicHistory', 'Storage',
        function($scope, $state, httpRequest, $ionicHistory, Storage) {
            $scope.$on("$ionicView.beforeEnter", function() {
                $scope.user = {};
                $scope.user.name = $state.params.name;
            });
            $scope.editStart = function() {
                $scope.editFlag = true;
            };
            $scope.editEnd = function() {
                $scope.editFlag = false;
            };
            $scope.editName = function() {
                var name = $scope.user.name;
                if (name == '') {
                    Tips.showTips('请输入用户名');
                    return;
                }
                httpRequest.postWithAuth($scope, '?method=user.modifyUserInfo', { type: 'nickname', nickname: name }, function(re) {
                    if (re.data.state) {
                        Tips.showTips('修改成功');
                        Storage.setAttr('vrsm_auth', 'nickname', name);
                        $ionicHistory.goBack();
                    }
                }, function(re) {
                    Tips.showTips(re.data.msg);
                });
            }
        }
    ]);

});

define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('editPasswordCtrl', ['$scope', 'httpRequest', 'Storage', '$state',
        function($scope, httpRequest, Storage,$state) {
            $scope.$on("$ionicView.beforeEnter", function() {
                $scope.user = {};
            });
            $scope.editPassword = function() {
                var nowPassword = $scope.user.nowPassword;
                var newPassword = $scope.user.newPassword;
                var newPasswordR = $scope.user.newPasswordR;
                if (validate(nowPassword, newPassword, newPasswordR)) {
                    httpRequest.postWithAuth($scope, '?method=user.editPwd', {password:newPassword,old_password:nowPassword}, function(re) {
                        if (re.data.state) {
                            Tips.showTips("修改成功，请重新登录");
                            Storage.remove('vrsm_auth');
                            $state.go('login');
                        }
                    }, function(re) {
                        Tips.showTips(re.data.msg);
                    });
                }
            };

            function validate(nowPassword, newPassword, newPasswordR) {
                if (!nowPassword || nowPassword == '') {
                    Tips.showTips("请输入原密码");
                    return false;
                }
                if (!newPassword || newPassword == '') {
                    Tips.showTips("请输入新密码");
                    return false;
                }
                if (!newPasswordR || newPasswordR == '') {
                    Tips.showTips("请再次输入新密码");
                    return false;
                }
                if (newPassword != newPasswordR) {
                    Tips.showTips("两次输入新密码不一致");
                    return false;
                }
                if (newPassword.length < 6) {
                    Tips.showTips("密码位数大于等于6");
                    return false;
                }
                return true;
            }
        }
    ]);

});

define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('balancePasswordCtrl', ['$scope', 'Storage', 'httpRequest', '$state','$ionicHistory', function($scope, Storage, httpRequest, $state,$ionicHistory) {
        var task_id; //记录短信接口返回的任务ID
        $scope.$on("$ionicView.beforeEnter", function() {
            $scope.pay = {};
            taskId = $state.params.taskId;
        });

        $scope.confirm = function() {
            var password = $scope.pay.password;
            var passwordR = $scope.pay.passwordR;
            if (!validate(password, passwordR)) return;
            var postData = {
                password: password
            };
            if (taskId) {
                var url = '?method=user.modifyPursePwd';
                postData.task_id = taskId;
            } else {
                var url = '?method=user.firstPursePwd';
            }
            httpRequest.postWithAuth($scope, url, postData, function(re) {
                if (re.data.state) {
                    Storage.setAttr('vrsm_auth','purse_status',1);
                    Tips.showTips("设定支付密码成功");
                    $ionicHistory.goBack(-3);
                }
            }, function(re) {
                Tips.showTips(re.data.msg);
            });
        };

        function validate(password, passwordR) {
            if (!(/^\d+$/.test(Number(password)))) {
                Tips.showTips("支付密码为纯数字");
                return false;
            }
            if (!password || password.length != 6) {
                Tips.showTips("支付密码长度为6位");
                return false;
            }
            if (password != passwordR) {
                Tips.showTips("两次密码输入不一致");
                return false;
            }
            return true;
        }
    }]);

});

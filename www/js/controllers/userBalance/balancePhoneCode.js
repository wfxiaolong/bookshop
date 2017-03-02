define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('balancePhoneCodeCtrl', ['$scope', 'Storage', 'httpRequest', '$state', '$interval', '$timeout', function($scope, Storage, httpRequest, $state, $interval, $timeout) {
    	var task_id; //记录短信接口返回的任务ID
        $scope.$on("$ionicView.beforeEnter", function() {
            $scope.balance = {};
        });
        $scope.code = {
            str: "获取验证码",
            cd: 0
        }
        // 发送验证码
        $scope.sendCheckCode = function() {
            if ($scope.code.cd) {
                return false;
            }
            var phone = Storage.get('vrsm_auth').phone;
            httpRequest.postWithAuth($scope, '?method=user.sendSmsCode', { phone: phone, task: 'modify_purse_pwd' }, function(re) {
                if (re.data.state) {
                    $scope.phone = phone;
                    $scope.sendFlag = true;
                    task_id = re.data.data.task_id;
                    $scope.code.cd = 60;
                    var timer = $interval(function() {
                        if ($scope.code.cd > 0) {
                            $scope.code.cd --;
                        }
                    },1000);
                    $timeout(function() {
                        $interval.cancel(timer);
                    }, 61000);
                }
            }, function(re) {
                Tips.showTips(re.data.msg);
            });
        };
        // 确认验证码
        $scope.confirmCheckCode = function() {
        	var checkCode = $scope.balance.checkCode;
            if (!checkCode || checkCode == '') {
                Tips.showTips('请输入验证码');
                return;
            }
            httpRequest.postWithUI($scope, '?method=user.checkCode', { task_id: task_id, code: checkCode }, function(re) {
                if (re.data.state) {
                    Tips.showTips('短信验证成功');
                    $state.go('balancePassword',{taskId:task_id});
                }
            }, function(re) {
                Tips.showTips(re.data.msg);
            });
        };
    }]);

});

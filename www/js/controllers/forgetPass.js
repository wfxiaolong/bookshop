define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('forgetPassCtrl', ['$scope', 'httpRequest', '$state', 'Storage', '$interval',function($scope, httpRequest, $state, Storage, $interval) {

        $scope.$on("$ionicView.beforeEnter", function() {
            $scope.forget = {};
        });

        // 倒计时
        $scope.code = {
            str: '获取验证码',
            cd: 0
        }

        // 获取验证码
        $scope.getCheckCode = function() {
            if ($scope.code.cd) {
                return false;
            }
            var phone = $scope.forget.phone;
            if (!(/^1[3|4|5|7|8][0-9]\d{4,8}$/.test(Number(phone)))) {
                Tips.showTips("请输入正确的手机号码");
                return;
            }

            httpRequest.postWithUI($scope, '?method=user.sendSmsCode', { phone: phone, task: 'find_pwd' }, function(re) {
                if (re.data.state) {
                    console.log(re.data);
                    var data = re.data.data;
                    $scope.task_id = data.task_id;
                    $scope.code.cd = 60;
                    var timer = $interval(function() {
                        if ($scope.code.cd > 0) {
                            $scope.code.cd--;
                        } else {
                            $interval.cancel(timer);
                        }
                    }, 1000);
                }
            }, function(re) {
                Tips.showTips(re.data.msg);
            });
        };
        // 验证验证码
        $scope.checkCode = function() {
            var checkCode = $scope.forget.checkCode;
            if (!checkCode || checkCode == '') {
                Tips.showTips("请输入验证码");
                return;
            }
            httpRequest.postWithUI($scope, '?method=user.checkCode', { task_id: $scope.task_id, code: checkCode }, function(re) {
                if (re.data.state) {
                    Tips.showTips("验证成功");
                    $scope.step2 = true;
                }
            }, function(re) {
                console.log(re.data.msg);
            });
        };
        // 修改密码
        $scope.changePass = function() {
            var newPass = $scope.forget.newPass;
            var newPassR = $scope.forget.newPassR;
            if (validate(newPass, newPassR)) {
                var postData = {
                    task_id: $scope.task_id,
                    phone: $scope.forget.phone,
                    password: $scope.forget.newPass
                };
                httpRequest.postWithUI($scope, '?method=user.findPwd', postData, function(re) {
                    if (re.data.state) {
                        Tips.showTips("修改成功");
                        Storage.remove('vrsm_auth');
                        $state.go('login');
                    }
                }, function(re) {
                    console.log(re.data.msg);
                });
            }
        };
        function validate(newPass, newPassR) {
            if (!newPass || newPass == '') {
                Tips.showTips("请输入密码");
                return false;
            }
            if (newPass.length < 6) {
                Tips.showTips("密码长度不小于6个字符");
                return false;
            }
            if (newPass != newPassR) {
                Tips.showTips("两次密码不一致");
                return false;
            }
            return true;
        };
    }]);
});

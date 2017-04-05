define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('registerCtrl', ['$scope', 'httpRequest','$state', '$interval', '$timeout', function($scope, httpRequest,$state,$interval,$timeout) {

        $scope.$on("$ionicView.beforeEnter", function() {
            $scope.reg = {};
        });

        $scope.is_pwd_show = "img/mimakejian.png";
        $scope.inputType = 'password';
        $scope.check_pwd = function() {
            $scope.inputType = $scope.inputType == "password" ? "text" : "password";
            $scope.is_pwd_show = $scope.inputType == "password" ? "img/mimakejian.png" : "img/mimakejian_active.png";
        }

        $scope.is_pwd_show_1 = "img/mimakejian.png";
        $scope.inputType_1 = 'password';
        $scope.check_pwd_1 = function() {
            $scope.inputType_1 = $scope.inputType_1 == "password" ? "text" : "password";
            $scope.is_pwd_show_1 = $scope.inputType_1 == "password" ? "img/mimakejian.png" : "img/mimakejian_active.png";
        }

        // 倒计时
        $scope.code = {
            str: '获取验证码',
            cd: 0
        };
        $scope.getCheckCode = function() {
            if ($scope.code.cd) {
                return false;
            }
            var phone = $scope.reg.phone;
            if (!(/^1[3|4|5|7|8][0-9]\d{4,8}$/.test(Number(phone))) || phone.length != 11) {
                Tips.showTips("请输入正确的手机号码");
                return;
            }

            httpRequest.postWithUI($scope, '?method=user.sendSmsCode', { phone: phone, task: 'reg' }, function(re) {
                if (re.data.state) {
                    var data = re.data.data;
                    $scope.task_id = data.task_id;
                    $scope.code.cd = 60;
                    var timer = $interval(function () {
                        if ($scope.code.cd > 0) {
                            $scope.code.cd--;
                        }
                    }, 1000);
                    $timeout(function() {
                        $interval.cancel(timer);
                    }, 61000);
                }
            }, function(re) {
                Tips.showTips(re.data.msg);
            });
        };
        $scope.register = function() {
            var phone = $scope.reg.phone;
            var checkCode = $scope.reg.checkCode;
            var password = $scope.reg.password;
            var passwordR = $scope.reg.passwordR;
            if (validate(phone, checkCode, password, passwordR)) {
                var postData = {
                    identityType: 1,
                    identifier: phone,
                    credential: password
                };
                httpRequest.postWithUI($scope, '/api/services/app/platform/UserRegister', postData, function(re) {
                    if (re.data.result.isSuccess) {
                        Tips.showTips('注册成功!');
                        $state.go('login');
                    }
                });
            }
        };
        function validate(phone, checkCode, password, passwordR) {
            if (!(/^1[3|4|5|7|8][0-9]\d{4,8}$/.test(Number(phone))) || !(phone.length == 11)) {
                Tips.showTips("请输入正确的手机号码");
                return false;
            }
            // if (!checkCode || checkCode == '') {
            //     Tips.showTips("请输入验证码");
            //     return false;
            // }
            if (!password || password.length < 6) {
                Tips.showTips("密码长度不能少于6位");
                return false;
            }
            if (password != passwordR) {
                Tips.showTips("两次密码输入不一致");
                return false;
            }
            return true;
        };
    }]);
});



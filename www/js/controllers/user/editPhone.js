define(['app', 'js/utils/tips'], function(app, Tips) {

    app.controller('editPhoneCtrl', ['$scope', '$state', 'httpRequest', 'Storage', '$ionicHistory', '$interval',
        function($scope, $state, httpRequest, Storage, $ionicHistory, $interval) {
            $scope.$on("$ionicView.beforeEnter", function() {
                $scope.user = {};
                console.log($state.params.fromPage);
                if (Storage.get('vrsm_auth').phone_status == 0) {
                    $scope.phoneEmpty = true;
                } else {
                    var phone = $state.params.phone;
                    $scope.user.phone = phone;
                }
            });
            $scope.editStart = function() {
                $scope.editFlag = true;
            };
            $scope.editEnd = function() {
                $scope.editFlag = false;
            };

            // 倒计时
            $scope.code = {
                str: '获取验证码',
                cd: 0
            };


            $scope.getCheckCode = function(task) {
                if ($scope.code.cd) {
                    return false;
                }
                var newPhone = $scope.user.newPhone;
                if (!(/^1[3|4|5|7|8][0-9]\d{4,8}$/.test(Number(newPhone))) || newPhone.length != 11) {
                    Tips.showTips("请输入正确的手机号码");
                    return;
                }

                httpRequest.postWithAuth($scope, '?method=user.sendSmsCode', { task: task, phone: newPhone }, function(re) {
                    if (re.data.state) {
                        $scope.task_id = re.data.data.task_id;
                        $scope.code.cd = 60;
                        var timer = $interval(function () {
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
            $scope.bindPhone = function() {
                if (!$scope.task_id) {
                    Tips.showTips("请先获取验证码");
                    return;
                }
                var checkCode = $scope.user.checkCodeEmp;
                var newPassword = $scope.user.newPassword;
                var newPasswordR = $scope.user.newPasswordR;
                if (validate(checkCode, newPassword, newPasswordR)) {
                    httpRequest.postWithAuth($scope, '?method=user.bindPhone', { task_id: $scope.task_id, code: checkCode }, function(re) {
                        if (re.data.state) {
                            Tips.showTips("绑定成功");
                            cachePhone($scope.user.newPhoneEmp,true);
                            //当是从支付密码页面跳转过来时，绑定手机完成跳转支付密码设置
                            if ($state.params.fromPage == "balanceSetting") {
                                $state.go('balancePassword');
                                return;
                            }
                            $ionicHistory.goBack();
                        }
                    }, function(re) {
                        Tips.showTips(re.data.msg);
                    });
                }
            };
            $scope.editPhone = function() {
                var checkCode = $scope.user.checkCode;
                var passwordInput = $scope.user.pwdNow;
                var password = Storage.get('vrsm_auth').password;
                if (passwordInput != password) {
                    Tips.showTips("您输入的密码不正确");
                    return;
                }
                if (!checkCode || checkCode == "") {
                    Tips.showTips("请输入验证码");
                    return;
                }
                httpRequest.postWithAuth($scope, '?method=user.editPhone', { task_id: $scope.task_id, code: checkCode, password: password }, function(re) {
                    if (re.data.state) {
                        Tips.showTips("修改成功");
                        cachePhone($scope.user.newPhone);
                        $ionicHistory.goBack();
                    }
                }, function(re) {
                    Tips.showTips(re.data.msg);
                });
            };

            function validate(checkCode, newPassword, newPasswordR) {
                if (!checkCode || checkCode == "") {
                    Tips.showTips("请输入验证码");
                    return;
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

            function cachePhone(newPhone,bindFlag) {
                Storage.setAttr('vrsm_auth', 'phone', newPhone);
                if (bindFlag) {
                    Storage.setAttr('vrsm_auth', 'phone_status', 1);
                }
            }
        }
    ]);

});

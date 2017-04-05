define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('loginCtrl', ['$scope','$rootScope', 'httpRequest', 'Storage', '$state', '$ionicHistory', function($scope,$rootScope,httpRequest, Storage, $state, $ionicHistory) {

        $scope.$on("$ionicView.beforeEnter", function() {
            if (window.DMPush && !APP.isIOS) {
                //获取设备号（供单播使用）
                console.log("登陆页面");
                DMPush.get_device_token('获取设备号失败', function(re) { APP.device_token = re; }, function(re) {
                    APP.console = 'login DMPush device_token_fail:' + re;
                });
            }
            $scope.log = {};
            $scope.fromPage = $state.params.fromPage;
        });
        $scope.$on("$ionicView.afterEnter",function(){

        })

        // 切换按钮是否可见
        $scope.is_pwd_show = "img/mimakejian.png";
        $scope.inputType = 'password';
        $scope.check_pwd = function() {
            $scope.inputType = $scope.inputType == "password" ? "text" : "password";
            $scope.is_pwd_show = $scope.inputType == "password" ? "img/mimakejian.png" : "img/mimakejian_active.png";
        }

        $scope.login = function() {
            var postData = {
                identityType: 1,
                identifier: $scope.log.phone,
                credential: $scope.log.password
            };
            httpRequest.postWithUI($scope, '/api/services/app/platform/UserLogin', postData, function(re) {
                if (re.data.result.isSuccess) {
                    Tips.showTips('登录成功!');
                    Storage.set('vrsm_auth', re.data.result.platformMember);
                    $state.go('tab.index');
                }
            });

        };

        // 注册按钮
        $scope.register = function() {
            if ($scope.fromPage == "index") {
                $state.go("register", {fromPage: "index"})
            } else {
                $state.go("register");
            }
        }

        $scope.goBackCustom = function() {
            if ($state.params.fromPage == 'yiyuan') {
                $state.go('tab.index');
            } else {
                $ionicHistory.goBack(-1);
            }
        };

        function validate(phone, password) {
            if (!(/^1[3|4|5|7|8][0-9]\d{4,8}$/.test(Number(phone))) || !(phone.length == 11)) {
                Tips.showTips("请输入正确的手机号码");
                return false;
            }
            if (!password || password == '') {
                Tips.showTips("请输入密码");
                return false;
            }
            if (password.length < 6) {
                Tips.showTips("密码位数大于等于6");
                return false;
            }
            return true;
        };
    }]);
});

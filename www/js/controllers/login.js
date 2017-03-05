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
            detectWeChat();
        });
        $scope.$on("$ionicView.afterEnter",function(){
            if(APP.is_wechat){
                $rootScope.goWechatLogin();
            }
        })

        // 切换按钮是否可见
        $scope.is_pwd_show = "img/mimakejian.png";
        $scope.inputType = 'password';
        $scope.check_pwd = function() {
            $scope.inputType = $scope.inputType == "password" ? "text" : "password";
            $scope.is_pwd_show = $scope.inputType == "password" ? "img/mimakejian.png" : "img/mimakejian_active.png";
        }

        $scope.login = function() {
            var phone = $scope.log.phone;
            var password = $scope.log.password;
            var postData = {
                login_id: phone,
                password: password,
                device_token: APP.device_token ? APP.device_token : "",
                client: APP.isInApp ? (APP.isIOS ? 2 : 1) : 0
            }
            // if (validate(phone, password)) {
            //     httpRequest.postWithUI($scope, '?method=user.login', postData, function(re) {
            //         if (re.data.state) {
            //             if ($scope.fromPage == "index") {  // 如果是点击送优惠券的图片这个入口进来的则跳转到我的券包页面
            //                 Tips.showTips('登录成功,立即查看优惠券!');
            //                 $state.go("coupon");
            //             } else {
                            Tips.showTips('登录成功!');
                            // re.data.data.password = password;
                            Storage.set('vrsm_auth', "re.data.data");
                            // if ($state.params.fromPage == 'serviceChoose') {
                            //     $ionicHistory.goBack(-1);
                            // } else {
                                $state.go('tab.index');
                            // }
                //         }
                //     }
                // }, function(re) {
                //     Tips.showTips(re.data.msg);
                // });
            // }
        };

        // 注册按钮
        $scope.register = function() {
            if ($scope.fromPage == "index") {
                $state.go("register", {fromPage: "index"})
            } else {
                $state.go("register");
            }
        }

        $scope.thirdPartyLogin = function(type) {
            if (type == "wechat") {
                var flag = APP.isInApp ? 2 : 1;
            } else {
                var flag = 3;
            }
            dmwechat.login(type, function(re) {
                var postData = {
                    code: re.open_id + '|||' + re.access_token,
                    flag: flag,
                    device_token: APP.device_token ? APP.device_token : "",
                    client: APP.isInApp ? (APP.isIOS ? 2 : 1) : 0
                };
                httpRequest.postWithUI($scope, '?method=user.openLogin', postData, function(re) {
                    if (re.data.state) {
                        Tips.showTips('登录成功!');
                        Storage.set('vrsm_auth', re.data.data);
                        if ($state.params.fromPage == 'serviceChoose') {
                            $ionicHistory.goBack(-1);
                        } else {
                            $state.go('tab.index');
                        }
                    }
                }, function(re) {
                    Tips.showTips(re.data.msg);
                });
            }, function(err) {
                Tips.showTips("登录失败");
            })
        };
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
        //检测是否显示微信登录
        function detectWeChat() {
            if (ionic.Platform.isWebView() && (ionic.Platform.isIOS() || ionic.Platform.isIPad()) && window.DMDevice) {
                DMDevice.checkApp("weixin://", function() {
                    $scope.hasWeChat = true;
                }, function() {});

                DMDevice.checkApp("mqq://", function() {
                    $scope.hasQQ = true;
                }, function() {});
            } else {
                $scope.hasWeChat = true;
                $scope.hasQQ = true;
            }
            if(window.APP.isInApp){
                $scope.isApp = true;
            }else{
                $scope.isApp = false;
            }
        };
    }]);
});

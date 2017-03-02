define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('chargeCtrl', ['$scope', 'Storage', 'httpRequest', '$state', '$ionicHistory', '$ionicPopup', function($scope, Storage, httpRequest, $state, $ionicHistory, $ionicPopup) {
        $scope.$on("$ionicView.beforeEnter", function() {
            var params = $state.params.params;
            $scope.type = getQueryString('type',params);
            $scope.purse = getQueryString('purse',params);
            $scope.charge = { money: '' };
            $scope.pay = { password: '' };
            $scope.isWechat = APP.is_wechat;
            $scope.isInH5 = !APP.is_wechat && !APP.isInApp;
            //type == 1时为充值余额，否则为充值夺宝币
            $scope.url = ($scope.type == 1) ? '?method=order.rechargePurse' : '?method=order.duobaoRecharge';
        });

        var watch = $scope.$watch('charge.money', function(newValue, oldValue, scope) {
            if (!newValue) return;
            newValue = newValue.toString();
            var decimal = newValue.split('.')[1];
            if (decimal && decimal.length > 2) {
                var str = newValue.substring(0, newValue.length - (decimal.length - 2));
                scope.charge.money = Number(str);
            }
        });

        $scope.selectPayWay = function(payWay) {
            switch (payWay) {
                case 'purse':
                    $scope.payWay = 10;
                    break;
                case 'alipay':
                    $scope.payWay = APP.isInApp ? 3 : 4;
                    break;
                case 'wechat':
                    $scope.payWay = APP.isInApp ? 1 : 2;
                    break;
                default:
                    $scope.payWay = APP.isInApp ? 1 : 2;
                    break;
            }
        };
        $scope.hidePayPop = function() {
            $scope.payPop = false;
            $scope.pay.password = '';
        };

        function watchPayPassword(orderId) {
            var watchPay = $scope.$watch('pay.password', function(newValue, oldValue, scope) {
                if (newValue.length == 6) {
                    httpRequest.postWithAuth($scope, '?method=order.pursePay', { order_id: orderId, password: newValue }, function(re) {
                        $ionicHistory.goBack();
                        Tips.showTips("充值成功");
                        watchPay();
                    }, function(re) {
                        Tips.showTips(re.data.msg);
                        $scope.hidePayPop();
                        $ionicHistory.goBack(-1);
                        watchPay();
                    });
                }
            });
        }
        $scope.confirmPay = function() {
            var money = $scope.charge.money;
            var payWay = $scope.payWay;
            if (!validate(money, payWay)) return; //数据验证
            var postData = {
                money: money,
                pay_type: payWay,
                return_url: APP.shareUrl + '#/balance'
            };
            httpRequest.postWithAuth($scope, $scope.url, postData, function(re) {
                if (re.data.state) {
                    switch (payWay) {
                        case 10: //余额支付
                            $scope.payPop = true;
                            setTimeout(function() {
                                document.getElementById('pay_password').focus(); //密码输入框获得焦点
                            }, 100);
                            watchPayPassword(re.data.data.order_id);
                            break;
                        case 1: //app中微信支付
                            var data = re.data.data.param;
                            var params = {
                                "appId": data.appid,
                                "partnerId": data.partnerid,
                                "prepayId": data.prepayid,
                                "packageValue": data.package,
                                "nonceStr": data.noncestr,
                                "timeStamp": data.timestamp,
                                "sign": data.sign
                            };
                            dmwechat.wechatPay(params, function() {
                                Tips.showTips("支付成功");
                                $ionicHistory.goBack(-1);
                            }, function(err) {
                                Tips.showTips("用户取消支付或支付失败");
                            });
                            break;
                        case 2: //h5中微信支付
                            var data = re.data.data.param;

                            function onBridgeReady(data) {
                                WeixinJSBridge.invoke(
                                    'getBrandWCPayRequest', {
                                        "appId": data.appId, //公众号名称，由商户传入
                                        "timeStamp": data.timeStamp, //时间\戳，自1970年以来的秒数
                                        "nonceStr": data.nonceStr, //随机串
                                        "package": data.package,
                                        "signType": data.signType, //微信签名方式：
                                        "paySign": data.paySign //微信签名
                                    },
                                    function(res) {
                                        res = JSON.stringify(res);
                                        if (res.indexOf("ok") > -1) {
                                            Tips.showTips("支付成功");
                                            // $scope.payType == 1 ? $state.go("repairPaySuccess") : $state.go("paySuccess");
                                        } else {
                                            Tips.showTips("支付失败");
                                        }
                                    }
                                );
                            }
                            if (typeof WeixinJSBridge == "undefined") {
                                if (document.addEventListener) {
                                    document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
                                } else if (document.attachEvent) {
                                    document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
                                    document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
                                }
                            } else {
                                onBridgeReady(data);
                            }
                            break;
                        case 3: //app中支付宝支付
                            dmwechat.aliPay(re.data.data.param.params, function() {
                                Tips.showTips("支付成功");
                                $ionicHistory.goBack(-1);
                            }, function(err) {
                                Tips.showTips("用户取消支付或支付失败");
                            });
                            break;
                        case 4: //H5中支付宝支付
                            location.href = re.data.data.url;
                        default:
                            break;
                    }
                }
            }, function(re) {
                Tips.showTips(re.data.msg);
            });
        }

        function validate(money, payWay) {
            if (money == '') {
                Tips.showTips("请输入充值金额");
                return false;
            }
            if (Number(money) == 0) {
                Tips.showTips("充值金额最少为0.01元");
                return false;
            }
            if (!payWay) {
                Tips.showTips("请选择支付方式");
                return false;
            }
            if (payWay == 10) { //余额支付时若未设置支付密码则返回上一页面
                if (Storage.get('vrsm_auth').purse_status == 0) {
                    // Tips.showTips("尚未设置支付密码");

                    // $ionicHistory.goBack(-1);
                    $ionicPopup.confirm({
                        title: '尚未设置支付密码', // String. 弹窗的标题。
                        template: '是否立即设置支付密码？',
                        cancelText: '否',
                        okText: '是'
                    }).then(function(res) {
                        if (res) {
                            $state.go('balanceSetting');
                        }
                    })
                    return false;
                }
            }
            return true;
        }

        function getQueryString(token, str) {
            var reg = new RegExp('(^|&)' + token + '=([^&]*)(&|$)', 'i');
            // var r = window.location.href.split('?')[1].match(reg);
            var r = str.match(reg);
            if (r != null) {
                return decodeURIComponent(r[2]);
            }
            return null;
        }
    }]);

});

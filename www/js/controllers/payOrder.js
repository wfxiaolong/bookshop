define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('payOrderCtrl', ['$scope', 'Storage', 'httpRequest', '$state', '$ionicHistory', '$ionicPopup','$ionicPlatform',
        function($scope, Storage, httpRequest, $state, $ionicHistory, $ionicPopup,$ionicPlatform) {
            $scope.$on("$ionicView.beforeEnter", function() {
                var params = $state.params.params;
                $scope.orderId = getQueryString('orderId', params);
                $scope.payType = getQueryString('payType', params);
                $scope.purse = $state.params.purse;
                $scope.pay = { password: '' };
                $scope.isWechat = window.APP.is_wechat;
                $scope.isInH5 = !APP.is_wechat && !APP.isInApp;
                // 查询余额
                httpRequest.postWithAuth($scope, '?method=userInfo.userMoney', {}, function(re) {
                    if (re.data.state) {
                        $scope.puesrMoney = re.data.data.purse_money;
                    }
                }, function(re) {
                    Tips.showTips(re.data.msg);
                });
            });

            $scope.goBackCustom = function() {
                $ionicPopup.confirm({
                    title: '确认放弃支付？',
                    cancelText: '取消',
                    okText: '确定'
                }).then(function(res) {
                    if (!res) return;
                    $scope.payType == 1 ? $state.go("repairCenter") : $state.go('orderDetail',{orderId:$scope.orderId,fromPage:'payOrder'});
                });
            };
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

            $scope.confirmPay = function() {
                if (!validate($scope.payWay)) return; //数据验证
                // $scope.payWay = 3;
                var postData = {
                    pay_type: $scope.payWay,
                    order_id: $scope.orderId
                }
                switch ($scope.payWay) {
                    case 10: //余额支付
                        $scope.payPop = true;
                        setTimeout(function() {
                            document.getElementById('pay_password').focus(); //密码输入框获得焦点
                        }, 100);
                        watchPayPassword($scope.orderId);
                        break;
                    case 1: //app中微信支付
                        getThirdPayParams(postData, function(re) {
                            var data = re.data.data;
                            var params = {
                                "appId": data.appid,
                                // "pay_type": 1,
                                "partnerId": data.partnerid,
                                "prepayId": data.prepayid,
                                "packageValue": data.package,
                                "nonceStr": data.noncestr,
                                "timeStamp": data.timestamp,
                                "sign": data.sign
                            };
                            dmwechat.wechatPay(params, function() {
                                paySuccess();
                            }, function(err) {
                                Tips.showTips("用户取消支付或支付失败");
                            });
                        });
                        break;
                    case 2: //h5中微信支付
                        getThirdPayParams(postData, function(re) {
                            var data = re.data.data;

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
                                            paySuccess();
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
                        });
                        break;
                    case 3: //app中支付宝支付
                        getThirdPayParams(postData, function(re) {
                            dmwechat.aliPay(re.data.data.params, function() {
                                paySuccess();
                            }, function(err) {
                                Tips.showTips("用户取消支付或支付失败");
                            });
                        });
                        break;
                    case 4: //H5中支付宝支付
                        postData.return_url = APP.shareUrl + ($scope.payType == 1 ? "#/repairPaySuccess" : "#/paySuccess");
                        getThirdPayParams(postData, function(re) {
                            location.href = re.data.data.url;
                        });
                        break;
                    default:
                        break;
                }
            }

            function getThirdPayParams(postData, callback) {
                httpRequest.postWithAuth($scope, "?method=order.pay", postData, function(re) {
                    if (re.data.state) {
                        if (typeof callback == 'function') callback(re);
                    }
                }, function(re) {
                    Tips.showTips(re.data.msg);
                });
            }

            function watchPayPassword(orderId) {
                var watchPay = $scope.$watch('pay.password', function(newValue, oldValue, scope) {
                    if (newValue.length == 6) {
                        httpRequest.postWithAuth($scope, '?method=order.pursePay', { order_id: orderId, password: newValue }, function(re) {
                            if (re.data.state) {
                                paySuccess();
                                watchPay();
                            }
                        }, function(re) {
                            Tips.showTips(re.data.msg);
                            $scope.hidePayPop();
                            watchPay();
                        });
                    }
                });
            }

            function validate(payWay) {
                if (!payWay) {
                    Tips.showTips("请选择支付方式");
                    return false;
                }
                // if (payWay == 10) { //余额支付时若未设置支付密码则返回上一页面
                //     if (Storage.get('vrsm_auth').purse_status == 0 || Storage.get('vrsm_auth').purse_status == undefined) {
                //         $ionicPopup.confirm({
                //             title: '尚未设置支付密码', // String. 弹窗的标题。
                //             template: '是否立即设置支付密码？',
                //             cancelText: '否',
                //             okText: '是'
                //         }).then(function(res) {
                //             if (res) {
                //                 $state.go('balanceSetting');
                //             }
                //         })
                //         return false;
                //     }
                // }
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

            function paySuccess() {
                Tips.showTips("支付成功");
                $scope.payType == 1 ? $state.go("repairPaySuccess") : $state.go("paySuccess", {orderId: $scope.orderId});
            }
        }
    ]);

});

define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('rewardCtrl', ['$scope', '$state', 'httpRequest', 'Storage', function($scope, $state, httpRequest, Storage) {
        var watch;
        $scope.$on("$ionicView.beforeEnter", function() {
            var params = $state.params.params;
            $scope.articleId = getQueryString('articleId', params);
            $scope.fromPage = getQueryString('fromPage', params);
            $scope.reward = { money: '' };
            $scope.rewardList = [];
            $scope.page = 1;
            $scope.isWechat = APP.is_wechat;
            $scope.isInH5 = !APP.is_wechat && !APP.isInApp;
            getRewardList($scope.page);
        });
        $scope.popShow = function(popName) {
            $scope[popName] = true;
            watch = $scope.$watch('reward.money', function(newValue, oldValue, scope) {
                newValue = newValue.toString();
                var decimal = newValue.split('.')[1];
                if (decimal && decimal.length > 2) {
                    var str = newValue.substring(0, newValue.length - (decimal.length - 2));
                    scope.reward.money = Number(str);
                }
            });
        };
        $scope.popHide = function(popName) {
            $scope[popName] = false;
            $scope.reward.money = '';
            watch();
        };
        $scope.loadMore = function() {
            if ($scope.page == 1) return;
            getRewardList($scope.page);
        };
        $scope.selectPayWay = function(payWay) {
            switch (payWay) {
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
        $scope.confirmPay = function() {
            var money = $scope.reward.money;
            var payWay = $scope.payWay;
            if (!validate(money, payWay)) return; //数据验证
            var postData = {
                money: money,
                pay_type: payWay,
                article_id: $scope.articleId,
                return_url: APP.shareUrl + '#/tab/index'
            };
            console.log(postData)
            httpRequest.postWithAuth($scope, '?method=order.cmsReward', postData, function(re) {
                if (re.data.state) {
                    switch (payWay) {
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
                                $scope.$apply(function() {
                                    $scope.popHide('payPop');
                                    rewardResult($scope.rewardList, postData.money);
                                });
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
                                $scope.$apply(function() {
                                    $scope.popHide('payPop');
                                    rewardResult($scope.rewardList, postData.money);
                                });
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
                Tips.showTips("请输入打赏金额");
                return false;
            }
            if (Number(money) == 0) {
                Tips.showTips("打赏金额最少为0.01元");
                return false;
            }
            if (!payWay) {
                Tips.showTips("请选择支付方式");
                return false;
            }
            return true;
        }

        function rewardResult(rewardList, money) {
            var auth = Storage.get('vrsm_auth');
            rewardList.splice(0, 0, { money: money, nickname: auth.nickname, user_img: auth.user_img, level: auth.level });
        }

        function getRewardList(page) {
            httpRequest.postWithUI($scope, '?method=order.rewardList', { page: page, article_id: $scope.articleId }, function(re) {
                if (re.data.state) {
                    var data = re.data.data.list;
                    $scope.page++;
                    $scope.rewardList = $scope.rewardList.concat(data);
                    if (data.length < 10) {
                        $scope.noData = true;
                    }
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                }
            }, function(re) {
                Tips.showTips(re.data.msg);
            });
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

define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('orderDetailCtrl', ['$scope', 'Storage', 'httpRequest', '$ionicScrollDelegate', '$ionicPopup', '$state', '$ionicHistory','$ionicPlatform',
        function($scope, Storage, httpRequest, $ionicScrollDelegate, $ionicPopup, $state, $ionicHistory,$ionicPlatform) {
            $scope.$on("$ionicView.beforeEnter", function() {
                $scope.orderId = $state.params.orderId;
                httpRequest.postWithAuth($scope, '?method=shop.shopOrderInfo', { order_id: $scope.orderId }, function(re) {
                    if (re.data.state) {
                        $scope.order = re.data.data;
                        $scope.order.totalPrice = getGoodsTotalPrice($scope.order.goods);
                    }
                }, function(re) {
                    Tips.showTips(re.data.msg);
                });
                if($state.params.fromPage == 'payOrder'){
                    $scope.goBack = function(){
                        $state.go('orders');
                    }
                }
            });
            //取消订单
            $scope.cancelOrder = function(orderId, index) {
                $ionicPopup.confirm({
                    title: '确认取消订单？',
                    cancelText: '取消',
                    okText: '确定'
                }).then(function(res) {
                    if (!res) return;
                    httpRequest.postWithAuth($scope, '?method=shop.cancelShopOrder', { order_id: orderId }, function(re) {
                        if (re.data.state) {
                            Tips.showTips("取消成功");
                            $ionicHistory.goBack(-1);
                        }
                    }, function(re) {
                        Tips.showTips(re.data.msg);
                    });
                });
            };
            //立即支付
            $scope.payNow = function(orderId) {
                $state.go('payOrder', { params: 'orderId=' + orderId + '&payType=2' });
            };
            //催单
            $scope.remindOrder = function(orderId) {
                httpRequest.postWithAuth($scope, '?method=shop.remindShopOrder', { order_id: orderId }, function(re) {
                    if (re.data.state) {
                        Tips.showTips("催单成功");
                    }
                }, function(re) {
                    Tips.showTips(re.data.msg);
                });
            };
            //确认收货
            $scope.confirmReceipt = function(orderId, index) {
                $ionicPopup.confirm({
                    title: '请确认你已经收到货物！否则可能钱货两空',
                    cancelText: '取消',
                    okText: '确定'
                }).then(function(res) {
                    if (!res) return;
                    httpRequest.postWithAuth($scope, '?method=shop.receiptShopOrder', { order_id: orderId }, function(re) {
                        if (re.data.state) {
                            Tips.showTips("操作成功");
                            $ionicHistory.goBack(-1);
                        }
                    }, function(re) {
                        Tips.showTips(re.data.msg);
                    });
                });
            };
            //评价商品
            $scope.commentOrder = function(orderId, goodId, isComment) {
                console.log(orderId)
                console.log(goodId)
                console.log(isComment)
                if (isComment == 1) return;
                $state.go('orderComment', { orderId: orderId, goodId: goodId });
            };
            //申请退款退货
            $scope.jumpReturn = function(v) {
                $state.go('applyReturn', { orderId: v.order_id, totalPrice: v.money });
            };
            //退款详情
            $scope.jumpReturnDetail = function(v) {
                $state.go('goodReturning', { orderId: v.order_id });
            };
            //获取商品总价（没有折扣没有运费的总价）
            function getGoodsTotalPrice(goods) {
                var sum = 0;
                for (var i = 0; i < goods.length; i++) {
                    sum += Number(goods[i].total_price);
                }
                return returnFloatTwo(sum);
            }
            //返回精确到两位的浮点数，不够补0
            function returnFloatTwo(value) {
                var value = Math.round(parseFloat(value) * 100) / 100;
                var arr = value.toString().split(".");
                if (arr.length == 1) {
                    return value.toString() + ".00";
                }
                if (arr.length > 1) {
                    return arr[1].length < 2 ? value.toString() + "0" : value;
                }
            }
        }
    ]);

});

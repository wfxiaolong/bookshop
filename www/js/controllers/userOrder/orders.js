define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('ordersCtrl', ['$scope', 'Storage', 'httpRequest', '$ionicScrollDelegate', '$ionicPopup', '$state',
        function($scope, Storage, httpRequest, $ionicScrollDelegate, $ionicPopup, $state) {
            $scope.$on("$ionicView.beforeEnter", function() {
                $scope.page = 1;
                $scope.orderList = [];
                getOrderList(1);
            });
            $scope.changeType = function(index) {
                $scope.type = index;
                $scope.orderList = [];
                $scope.page = 1;
                $scope.noData = false;
                $ionicScrollDelegate.scrollTop();
                getOrderList($scope.page);
            };
            $scope.loadMore = function() {
                if ($scope.page == 1) return;
                getOrderList($scope.page);
            };
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
                            $scope.orderList.splice(index, 1);
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
            //跳转订单详情
            $scope.jumpDetail = function(orderId) {
                $state.go('orderDetail', { orderId: orderId })
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
                    title: '是否确认收货',
                    cancelText: '取消',
                    okText: '确定'
                }).then(function(res) {
                    if (!res) return;
                    httpRequest.postWithAuth($scope, '?method=shop.receiptShopOrder', { order_id: orderId }, function(re) {
                        if (re.data.state) {
                            Tips.showTips("操作成功");
                            $scope.orderList.splice(index, 1);
                            $scope.changeType(4);
                        }
                    }, function(re) {
                        Tips.showTips(re.data.msg);
                    });
                });
            };
            //申请退款退货
            $scope.jumpReturn = function(v) {
                $state.go('applyReturn', { orderId: v.order_id, totalPrice: v.money });
            };
            //评价商品
            $scope.commentOrder = function(orderId, goodId, isComment, event) {
                event.stopPropagation();
                if (isComment == 1) return;
                $state.go('orderComment', { orderId: orderId, goodId: goodId });
            };
            //退款详情
            $scope.jumpReturnDetail = function(v) {
                $state.go('goodReturning', { orderId: v.order_id });
            };

            function getOrderList(page) {
                var postData = {
                    page: page,
                    trade_state: $scope.type || 1
                }
                httpRequest.postWithAuth($scope, '?method=shop.shopOrderList', postData, function(re) {
                    if (re.data.state) {
                        var data = re.data.data.list;
                        $scope.orderList = $scope.orderList.concat(data);
                        $scope.page++;
                        if (data.length < 10) {
                            $scope.noData = true;
                        }
                    }
                }, function(re) {
                    Tips.showTips(re.data.msg);
                }, function(re) {
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                });
            }

        }
    ]);

});

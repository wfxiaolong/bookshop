define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('goodReturningCtrl', ['$scope', 'Storage', 'httpRequest', '$ionicPopup', '$state', '$ionicActionSheet', '$ionicHistory',
        function($scope, Storage, httpRequest, $ionicPopup, $state, $ionicActionSheet, $ionicHistory) {
            $scope.$on("$ionicView.beforeEnter", function() {
                $scope.orderId = $state.params.orderId;
                $scope.express = { name: '', id: '' };
                httpRequest.postWithAuth($scope, '?method=shop.orderRefundState', { order_id: $scope.orderId }, function(re) {
                    if (re.data.state) {
                        var data = re.data.data;
                        $scope.refund = data.buyer_refund;
                        $scope.state = data.refund_state;
                        $scope.shopRefund = data.shop_refund;
                        if (data.refund_address) $scope.refundAddress = data.refund_address;
                        if (data.express) $scope.express = data.express;
                        console.log(re.data.data)
                    }
                }, function(re) {
                    Tips.showTips(re.data.msg);
                });
            });
            //提交快递申请
            $scope.submitExpressInfo = function() {
                var postData = {
                    order_id: $scope.orderId,
                    express_code: $scope.express.id,
                    express_company: $scope.express.name
                };
                if (postData.express_company == '') {
                    Tips.showTips('快递公司名不能为空');
                    return;
                }
                if (postData.express_code == '') {
                    Tips.showTips('快递单号不能为空');
                    return;
                }
                httpRequest.postWithAuth($scope, '?method=shop.refundOrderExpressCode', postData, function(re) {
                    if (re.data.state) {
                        Tips.showTips("提交成功");
                        $ionicHistory.goBack(-1);
                    }
                }, function(re) {
                    Tips.showTips(re.data.msg);
                });
                console.log(postData);
            };
            // 放大图片设置
            $scope.imgSrc = "";
            $scope.getImg = function(src) {
                $scope.imgSrc = src;
            };
            $scope.clearImg = function() {
                $scope.imgSrc = "";
            };
            $scope.cancelApply = function() {
                $ionicPopup.confirm({
                    title: '确认取消退货申请？',
                    cancelText: '取消',
                    okText: '确定'
                }).then(function(res) {
                    if (!res) return;
                    httpRequest.postWithAuth($scope, '?method=shop.cancelRefund', { order_id: $scope.orderId }, function(re) {
                        if (re.data.state) {
                            Tips.showTips("操作成功");
                            $ionicHistory.goBack(-1);
                        }
                    }, function(re) {
                        Tips.showTips(re.data.msg);
                    });
                });
            };
        }
    ]);

});

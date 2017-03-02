define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('confirmOrderCtrl', ['$scope', 'httpRequest', 'Storage', '$state', '$ionicModal',
        function($scope, httpRequest, Storage, $state, $ionicModal) {
            $scope.$on("$ionicView.beforeEnter", function() {
                if (!$scope.input) {
                    $scope.input = { invoice: '', message: '', invoiceCheckBox: false };
                }
                var cartIds = $scope.cardIds = $state.params.cartIds;
                //获取订单信息
                httpRequest.postWithAuth($scope, '?method=shop.settlement', { cart_id: cartIds }, function(re) {
                    if (re.data.state) {
                        var data = re.data.data;
                        //从选择地址页面选择了地址回来时显示相应的地址
                        var tempAddress = Storage.get('vrsm_address_choose_temp');
                        if (tempAddress) {
                            $scope.address = tempAddress;
                            Storage.remove('vrsm_address_choose_temp');
                        } else {
                            $scope.address = data.default_address;
                        }
                        $scope.cartList = data.shop_cart;
                        $scope.order = data.order;
                        $scope.hasCoupon = data.coupon.length != 0 || data.coupon[0].state == 0;
                        $scope.shopCoupon = data.coupon;
                        console.log(data);
                    }
                }, function(re) {
                    Tips.showTips(re.data.msg);
                });
            });
            $ionicModal.fromTemplateUrl('my-modal.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $scope.modal = modal;
            });
            $scope.showModal = function() {
                $scope.modal.show()
            };
            $scope.closeModal = function() {
                $scope.modal.hide();
            };

            //选择优惠券
            $scope.chooseCoupon = function(v) {
                $scope.coupon = v;
                $scope.modal.hide();
            };
            $scope.submitOrder = function() {
                if (!$scope.address) {
                    Tips.showTips('地址为空，请添加收货地址');
                    return;
                }
                var postData = {
                    cart_id: $scope.cardIds,
                    address_id: $scope.address.id,
                    buyer_remark: $scope.input.message || ''
                }
                if ($scope.input.invoiceCheckBox) {
                    if ($scope.input.invoice == '') {
                        Tips.showTips('发票抬头不能为空');
                        return;
                    }
                    postData.invoice_need = 1;
                    postData.invoice_title = $scope.input.invoice;
                }
                if ($scope.coupon) {
                    postData.coupon_id = $scope.coupon.id;
                }
                httpRequest.postWithAuth($scope, '?method=shop.shopOrder', postData, function(re) {
                    if (re.data.state) {
                        $state.go('payOrder', { params: 'orderId=' + re.data.data.order_id + '&payType=2' });
                    }
                }, function(re) {
                    Tips.showTips(re.data.msg);
                });
            };
        }
    ]);
});

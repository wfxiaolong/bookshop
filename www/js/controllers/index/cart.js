define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('cartCtrl', ['$scope', 'httpRequest', 'Storage', '$state', '$ionicPopup',
        function($scope, httpRequest, Storage, $state, $ionicPopup) {
            $scope.$on("$ionicView.beforeEnter", function() {
                $scope.input = { checkAll: false };
                $scope.count = 0;
                httpRequest.postWithAuth($scope, '?method=shop.shopCartList', {}, function(re) {
                    if (re.data.state) {
                        var data = re.data.data;
                        $scope.cartList = data;
                    }
                }, function(re) {
                    Tips.showTips(re.data.msg);
                });
            });
            //改变子商品选中状态的同时改变全选按钮的选中状态
            $scope.checkGood = function(v) {
                var count = 0;
                for (var i = 0; i < $scope.cartList.length; i++) {
                    if ($scope.cartList[i].checked) {
                        count++;
                    }
                }
                $scope.count = count;
                $scope.input.checkAll = ($scope.cartList.length == count) ? true : false;
            };
            //全选按钮
            $scope.checkAllGoods = function() {
                var length = $scope.cartList.length;
                for (var i = 0; i < length; i++) {
                    $scope.cartList[i].checked = $scope.input.checkAll;
                }
                $scope.count = $scope.input.checkAll ? length : 0;
            };
            $scope.deleteGood = function(v, index) {
                $ionicPopup.confirm({
                    title: '确认删除此商品？',
                    cancelText: '取消',
                    okText: '确定'
                }).then(function(res) {
                    if (res) {
                        httpRequest.postWithAuth($scope, '?method=shop.delShopCart', { cart_id: v.cart_id }, function(re) {
                            if (re.data.state) {
                                Tips.showTips('删除成功');
                                $scope.cartList.splice(index, 1);
                            }
                        }, function(re) {
                            Tips.showTips(re.data.msg);
                        });
                    }
                });
            };
            //减少商品数量
            $scope.reduceNum = function(v) {
                if (v.quantity == 1) {
                    Tips.showTips('最少购买数量为1');
                    return;
                }
                modifyCartNum(v, 'reduce', function() {
                    v.quantity--;
                });
            };
            //增加商品数量
            $scope.addNum = function(v) {
                if (v.quantity == v.stock) {
                    Tips.showTips('已没有更多的库存');
                    return;
                }
                modifyCartNum(v, 'add', function() {
                    v.quantity++;
                });
            };
            $scope.generateOrder = function() {
                if (!$scope.count || $scope.count == 0) {
                    Tips.showTips('请选择需要结算的商品');
                    return;
                }
                var temp = [];
                var length = $scope.cartList.length;
                for (var i = 0; i < length; i++) {
                    if ($scope.cartList[i].checked) {
                        temp.push($scope.cartList[i].cart_id);
                    }
                }
                $state.go('confirmOrder', { cartIds: temp.join('|||') });
            };

            function modifyCartNum(v, action, callback) {
                var postData = {
                    cart_id: v.cart_id,
                    quantity: (action == 'reduce') ? Number(v.quantity) - 1 : Number(v.quantity) + 1
                };
                httpRequest.postWithAuthUser($scope, '?method=shop.modifyShopCart', postData, function(re) {
                    if (re.data.state) {
                        console.log('success');
                        if (typeof callback == 'function') callback();
                    }
                }, function(re) {
                    Tips.showTips(re.data.msg);
                });
            }
        }
    ]);

});

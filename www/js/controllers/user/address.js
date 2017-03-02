define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('addressCtrl', ['$scope', 'httpRequest', 'Storage', '$state', '$ionicPopup', '$ionicHistory',
        function($scope, httpRequest, Storage, $state, $ionicPopup, $ionicHistory) {
            $scope.$on("$ionicView.beforeEnter", function() {
                httpRequest.postWithAuth($scope, '?method=userInfo.addressList', {}, function(re) {
                    if (re.data.state) {
                        var data = re.data.data;
                        if (data.length == 0) {
                            Tips.showTips("暂无地址，请手动添加");
                        } else {
                            $scope.addressList = data;
                        }
                    }
                }, function(re) {
                    Tips.showTips(re.data.msg);
                });
                $scope.chooseAddressFlag = $state.params.fromPage == 'confirmOrder';
            });
            //从确认订单过来选择地址
            $scope.chooseAddress = function(v) {
                if (!$scope.chooseAddressFlag) return;
                Storage.set('vrsm_address_choose_temp', v);
                $ionicHistory.goBack(-1);
            };
            // 设置默认地址
            $scope.setDefault = function(address, event) {
                event.stopPropagation();
                if (address.is_default == 1) {
                    Tips.showTips("已经是默认地址");
                    return;
                }
                httpRequest.postWithAuth($scope, '?method=userInfo.setAddressDefault', { id: address.id }, function(re) {
                    if (re.data.state) {
                        var length = $scope.addressList.length;
                        for (var i = 0; i < length; i++) {
                            $scope.addressList[i].is_default = 0;
                        }
                        address.is_default = 1;
                        Storage.setAttr('vrsm_auth', 'address', address.province + address.city + address.area + address.detail);
                        Tips.showTips("修改成功");
                    }
                }, function(re) {
                    Tips.showTips(re.data.msg);
                });
            };
            //删除地址
            $scope.deleteAddr = function(address, index, event) {
                event.stopPropagation();
                $ionicPopup.confirm({
                    title: '确定删除该地址？',
                    cancelText: '取消',
                    okText: '确定'
                }).then(function(res) {
                    if (res) {
                        httpRequest.postWithAuth($scope, '?method=userInfo.delAddress', { id: address.id }, function(re) {
                            if (re.data.state) {
                                var length = $scope.addressList.length;
                                $scope.addressList.splice(index, 1);
                                if ($scope.addressList.length == 1) { //删除剩最后一个时设为默认地址
                                    $scope.addressList[0].is_default = 1;
                                }
                                if ($scope.addressList.length == 0) {
                                    Storage.setAttr('vrsm_auth', 'address', ' ');
                                }
                                Tips.showTips("删除成功");
                            }
                        }, function(re) {
                            Tips.showTips(re.data.msg);
                        });
                    }
                });
            };
            //跳转编辑地址页面
            $scope.editAddr = function(address, event) {
                event.stopPropagation();
                address.district = [address.province, address.city, address.area].join(',');
                Storage.set('vrsm_address_temp', address);
                $state.go('addressEdit');
            }
        }
    ]);

});

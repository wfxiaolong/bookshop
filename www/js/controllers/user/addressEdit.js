define(['app', 'js/utils/tips', 'js/utils/citySelect'], function(app, Tips, CitySelect) {
    app.controller('addressEditCtrl', ['$scope', 'httpRequest', 'Storage', '$state', '$ionicHistory',
        function($scope, httpRequest, Storage, $state, $ionicHistory) {
            $scope.$on("$ionicView.beforeEnter", function() {
                $scope.address = {};
                $scope.citySelect = true;
                var addressEdit = Storage.get('vrsm_address_temp');
                $scope.address = addressEdit;
                Storage.remove('vrsm_address_temp');
                CitySelect.init({
                    element: ".js-citySelestNode",
                    value: ["广东省", "广州市", "天河区"],
                    callback: function(data) {
                        $scope.$apply(function() {
                            $scope.address.district = data.join(',')
                        })
                    },
                    initComplete: function(data) {
                        if ($scope.address.district && $scope.address.district != '') {
                            var data = $scope.address.district.split(',');
                            CitySelect.set(data)
                        } else {
                            $scope.$apply(function() {
                                $scope.address.district = data.join(',')
                            })
                        }
                    },
                    url: 'data/city.json'
                });
            });
            $scope.showCitySelect = function() {
                $scope.citySelect = true;
            };
            $scope.hideCitySelect = function() {
                $scope.citySelect = false;
            };
            $scope.editAddress = function() {
                var consignee = $scope.address.name;
                var phone = $scope.address.mobile;
                var district = ($scope.address.district).split(',');
                var address = $scope.address.detail;
                if (validate(consignee, phone, address)) {
                    var postData = {
                        name: consignee,
                        mobile: phone,
                        province: district[0],
                        city: district[1] || '',
                        area: district[2] || '',
                        detail: address,
                        id: $scope.address.id
                    }
                    httpRequest.postWithAuth($scope, '?method=userInfo.saveAddress', postData, function(re) {
                        if (re.data.state) {
                            Tips.showTips("修改成功");
                            $ionicHistory.goBack();
                        }
                    }, function(re) {
                        Tips.showTips(re.data.msg);
                    });
                }
            }

            function validate(consignee, phone, address) {
                if (!consignee || consignee == '') {
                    Tips.showTips("请输入收货人姓名");
                    return false;
                }
                if (!(/^1[3|4|5|7|8][0-9]\d{4,8}$/.test(Number(phone))) || !(phone.length == 11)) {
                    Tips.showTips("请输入正确的手机号码");
                    return false;
                }
                if (!address || address == '') {
                    Tips.showTips("请输入详细地址");
                    return false;
                }
                return true;
            }
        }
    ]);

});

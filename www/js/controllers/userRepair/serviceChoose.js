define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('serviceChooseCtrl', ['$scope', 'httpRequest', 'Storage', '$state', '$ionicSlideBoxDelegate', '$ionicPopup', '$ionicModal','$sce',
        function($scope, httpRequest, Storage, $state, $ionicSlideBoxDelegate, $ionicPopup,$ionicModal,$sce) {
            $scope.$on("$ionicView.beforeEnter", function() {
                var auth = $scope.auth = Storage.get('vrsm_auth');
                $scope.standard = $scope.standard || 0;
                $scope.model = -1;
                $scope.repair = -1;
                $scope.goodNum = 1;
                $scope.price = $scope.price || 0; // 显示价格
                $scope.phonePartsId = $state.params.phonePartsId;
                if ($scope.phoneParts && $scope.phoneFault) return;


                httpRequest.postWithUI($scope, '?method=repair.categoryChild', { pid: $scope.phonePartsId }, function(re) {
                    if (re.data.state) {
                        $scope.phoneParts = re.data.data;
                        $scope.nowStandard = $scope.phoneParts[0];
                        var nowId = $scope.phoneParts[0].id;
                        httpRequest.postWithUI($scope, '?method=repair.categoryChild', { pid: nowId }, function(re) {
                            if (re.data.state) {
                                $scope.phoneFault = re.data.data;
                            }
                        }, function(re) {
                            Tips.showTps(re.data.msg);
                        });
                    }
                }, function(re) {
                    Tips.showTips(re.data.msg);
                });

                httpRequest.postWithUI($scope, '?method=website.feeExplain', { pid: $scope.phonePartsId }, function(re) {
                    if (re.data.state) {
                        $scope.feeExplain = $sce.trustAsHtml(re.data.data.content);
                    }
                }, function(re) {
                    Tips.showTips(re.data.msg);
                });
            });

            // 获取五级菜单
            $scope.getLevel5 = function(phoneModelId, v, index) {
                if ($scope.nowStandard == v) {
                    return;
                }
                if (v.subList) {
                    $scope.phoneFault = v.subList;
                    $scope.standard = index;
                    $scope.nowStandard = v;
                    return;
                }

                httpRequest.postWithUI($scope, '?method=repair.categoryChild', { pid: phoneModelId }, function(re) {
                    if (re.data.state) {
                        $scope.phoneFault = re.data.data;

                        for (var i = 0; i < $scope.phoneFault.length; i++) {
                            $scope.phoneFault[i].isSelected = false;
                        }
                        console.log($scope.phoneFault);
                        // 点击高亮
                        $scope.goodNum = 1;
                        if ($scope.standard == index) {
                            return;
                            $scope.standard = -1;
                            $scope.nowStandard = undefined;
                        }
                        $scope.standard = index;
                        $scope.nowStandard = v;
                    }
                }, function(re) {
                    Tips.showTips(re.data.msg);
                });
            }

            // 获取五级菜单id
            $scope.getLevel5Id = function(index) {
                if ($scope.phoneFault[index].isSelected) {
                    $scope.phoneFault[index].isSelected = false;
                    $scope.price = getFloatTwo($scope.price - Number($scope.phoneFault[index].price));
                    return;
                }
                $scope.price = getFloatTwo($scope.price + Number($scope.phoneFault[index].price));
                $scope.phoneFault[index].isSelected = true;
                //如果选择了相应的子项则将列表存在左侧栏的相应对象中
                $scope.phoneParts[$scope.standard].subList = $scope.phoneFault;
            }

            // 提交订单
            $scope.submitOrder = function() {
                var jumpId = [];
                //对每个左侧栏的对象判断是否存在子列表，存在则循环找出ID
                for (var i = 0; i < $scope.phoneParts.length; i++) {
                    if ($scope.phoneParts[i].subList) {
                        var subList = $scope.phoneParts[i].subList;
                        for (var j = 0; j < subList.length; j++) {
                            if (subList[j].isSelected) {
                                jumpId.push((subList[j].id));
                            }
                        }
                    }
                }

                if (jumpId.length == 0) {
                    Tips.showTips("请选择维修项目！");
                    return false;
                }
                if (!$scope.auth) {
                    Tips.showTips('请先登录');
                    $state.go('login', { fromPage: 'serviceChoose' });
                    return;
                }
                jumpId = jumpId.join("|||");

                $state.go("repairOrder", { lastId: jumpId });
            }

            function countTotalPrice(list) {
                var sum = 0;
                if (!list) return;
                for (var i = 0; i < list.length; i++) {
                    if (list[i].isSelected == true) {
                        sum += (Number(list[i].price) * 100);
                    }
                }
                var value = sum / 100;
                var arr = value.toString().split(".");
                if (arr.length == 1) {
                    return value.toString() + ".00";
                }
                if (arr.length > 1) {
                    return arr[1].length < 2 ? value.toString() + "0" : value;
                }
            }

            //费用说明
            $ionicModal.fromTemplateUrl('my-modal.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $scope.modal = modal;
            });
            $scope.openModal = function() {
                $scope.modal.show();
            };
            $scope.closeModal = function() {
                $scope.modal.hide();
            };
            $scope.$on('$destroy', function() {
                $scope.modal.remove();
            });
            $scope.$on('modal.hide', function() {
                // 执行动作
            });
            $scope.$on('modal.removed', function() {
                // 执行动作
            });

            // $scope.costDetails = function() {

            // }



            // $scope.costDetails = function() {
            //     event.stopPropagation();
            //     $ionicPopup.alert({
            //         title: $scope.feeExplain,
            //         okText: '确定'
            //     }).then(function(res) {
            //         if (res) {
            //             console.log(1);
            //         }
            //     });
            // };
            //返回小数点2位数
            function getFloatTwo(float) {
                return Math.round(float * 100) / 100;
            }
        }
    ]);
});

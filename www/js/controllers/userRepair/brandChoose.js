define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('brandChooseCtrl', ['$scope', 'httpRequest', 'Storage', '$state', '$ionicSlideBoxDelegate',
        function($scope, httpRequest, Storage, $state, $ionicSlideBoxDelegate) {
            $scope.$on("$ionicView.beforeEnter", function() {
                if ($scope.phoneBrand) return;
                $scope.jumpId = -1;
                $scope.standard = 0;
                $scope.model = -1;
                $scope.goodNum = 1;
                $scope.pid = $state.params.pid;
                httpRequest.postWithUI($scope, '?method=repair.categoryChild', { pid: $scope.pid }, function(re) {
                    if (re.data.state) {
                        $scope.phoneBrand = re.data.data;
                        $scope.nowStandard = $scope.phoneBrand[0];
                        var nowId =  $scope.phoneBrand[0].id;
                        httpRequest.postWithUI($scope, '?method=repair.categoryChild', { pid: nowId }, function(re) {
                            if (re.data.state) {
                                $scope.phoneModel = re.data.data;
                            }
                        }, function(re) {
                            Tips.showTps(re.data.msg);
                        });

                    }
                }, function(re) {
                    Tips.showTps(re.data.msg);
                });
            });

            // 获取三级菜单
            $scope.getLevel2 = function(phoneModelId, v, index) {
                if ($scope.nowStandard == v) {
                    return;
                }
                httpRequest.postWithUI($scope, '?method=repair.categoryChild', { pid: phoneModelId }, function(re) {
                    if (re.data.state) {
                        $scope.phoneModel = re.data.data;

                        // 点击高亮
                        $scope.goodNum = 1;
                        if ($scope.standard == index) {
                            return;
                        }
                        $scope.standard = index;
                        $scope.nowStandard = v;
                    }
                }, function(re) {
                    console.log(re.data.msg);
                });
            }

            // 获取四级菜单
            $scope.Level3 = function(phoneModelId,v,index) {

                 $scope.jumpId = phoneModelId;
                 console.log($scope.jumpId);
                // 点击高亮
                $scope.goodNum = 1;
                if ($scope.model == index) {
                    $scope.model = -1;
                    $scope.nowmodel = undefined;
                    return;
                }
                $scope.model = index;
                $scope.nowStandard = v;

            }

            // 到第四五级菜单页面
            $scope.toDeeperMenu = function() {
                if ($scope.jumpId == -1) {
                    Tips.showTips("请选择品牌型号！");
                    return false;
                }
                $state.go("serviceChoose", {phonePartsId: $scope.jumpId});
            }


        }
    ]);
});

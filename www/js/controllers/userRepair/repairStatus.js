define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('repairStatusCtrl', ['$scope', 'Storage', 'httpRequest', '$state', '$ionicHistory', '$ionicPopup', '$interval', '$state', '$ionicModal', function($scope, Storage, httpRequest, $state, $ionicHistory, $ionicPopup, $interval, $state, $ionicModal) {
        $scope.$on("$ionicView.beforeEnter", function() {
            $scope.orderId = $state.params.orderId;
            $scope.hasExpressCode = null;
            httpRequest.postWithAuth($scope, '?method=repair.repairInfo', { order_id: $scope.orderId }, function(re) {
                if (re.data.state) {
                    $scope.isTimeout = true; // 判断维修是否超时
                    // 快递信息
                    $scope.express = {
                        company: re.data.data.send_express.company, // 快递公司
                        code: re.data.data.send_express.code, // 快递单号
                        com: re.data.data.send_express.com,
                        detail: re.data.data.send_express.data // 物流详情
                    }
                    $scope.hasExpressCode = !$scope.express.code ? true : false;

                    // 订单信息
                    $scope.order = {
                        remainTime: re.data.data.order.repair_end_time * 1000 - new Date().getTime(),  // 维修剩余时间
                        // remainTime: re.data.data.order.repair_end_time,  // 维修剩余时间
                        buyerPics: re.data.data.order.buyer_pics,  // 维修相关图片
                        tradeId: re.data.data.order.trade_state,   // 维修状态码
                        remark: re.data.data.order.buyer_remark,  // 客户留言
                        Ordercontent: re.data.data.order.service  // 维修内容
                    }

                    // 回寄快递信息
                    if (re.data.data.back_express) {
                        $scope.back_express = {
                            company: re.data.data.back_express.company, // 快递公司
                            code: re.data.data.back_express.code, // 快递单号
                            com: re.data.data.back_express.com,
                            detail: re.data.data.back_express.data // 物流详情
                        }
                    }

                    if ($scope.order.remainTime >= 0) {
                        $scope.isTimeout = false;
                    } else {
                        $scope.isTimeout = true;
                        }
                    for (var i = 0; i < re.data.data.order.service.length; i++) {
                        if (i > 0) {
                            $scope.order.Ordercontent[i].name = $scope.Ordercontent[i].name[$scope.Ordercontent[i].name.length-1];
                        } else {
                            $scope.order.Ordercontent[i].name = re.data.data.order.service[i].name.join("、");
                        }
                    }
                } else {
                    Tips.showTips(re.data.msg);
                }
            }, function(re) {
                Tips.showTips(re.data.msg);
            });
        });




        // 添加快递单号
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


        $scope.repairExpress = {
            code: "",
            com: ""
        }
        $scope.addCode = function() {
            httpRequest.postWithAuth($scope, '?method=repair.repairExpress', { express_code: $scope.repairExpress.code, express_company: $scope.repairExpress.com, order_id: $scope.orderId }, function(re) {
                if (re.data.state) {
                    Tips.showTips("添加成功！");
                    $scope.modal.hide();
                    $state.reload();

                } else {
                    Tips.showTips(re.data.msg);
                }
            }, function(re) {
                Tips.showTips(re.data.msg);
            });
        }

        // 确认收货
        $scope.repairConfirm = function() {
            $ionicPopup.confirm({
                title: "确认收货?",
                okText: "确定",
                cancelText: "取消"
            }).then(function(res){
                if (res) {
                    httpRequest.postWithAuth($scope, '?method=repair.repairConfirm', { order_id: $scope.orderId }, function(re) {
                        if (re.data.state) {
                            Tips.showTips("订单完成！");
                            $state.go("repairApplies");

                        } else {
                            Tips.showTips(re.data.msg);
                        }
                    }, function(re) {
                        Tips.showTips(re.data.msg);
                    });
                }
            });


        }




    }]);

});

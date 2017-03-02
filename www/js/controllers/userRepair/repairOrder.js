define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('repairOrderCtrl', ['$scope', 'httpRequest', 'Storage', '$state', '$ionicSlideBoxDelegate', '$http', '$cordovaCamera', '$cordovaImagePicker', '$cordovaFileTransfer', '$ionicLoading', '$ionicHistory', '$ionicPopup', '$ionicActionSheet', '$ionicModal',
        function($scope, httpRequest, Storage, $state, $ionicSlideBoxDelegate, $http, $cordovaCamera, $cordovaImagePicker, $cordovaFileTransfer, $ionicLoading, $ionicHistory, $ionicPopup, $ionicActionSheet, $ionicModal) {
            $scope.$on("$ionicView.beforeEnter", function() {
                // if ($scope.repairMoney) return;
                $scope.post = { content: '' };
                $scope.moduleId = $state.params.moduleId;
                $scope.thumbnail = [];
                $scope.pics = [];
                $scope.params = $scope.params || {
                    express_code: "",
                    express_company: "",
                    repair_id: null,
                    buyer_remark: "",
                    address_id: null
                }
                $scope.params.repair_id = $state.params.lastId;
                httpRequest.postWithAuth($scope, '?method=repair.settlement', { repair_id: $scope.params.repair_id }, function(re) {
                    if (re.data.state) {
                        var data = re.data.data;
                        $scope.repairMoney = re.data.data.order.money;
                        $scope.defaultAddress = data.repair_address;
                        $scope.hasCoupon = data.coupon.length != 0;
                        $scope.repairCoupon = data.coupon;

                        //从选择地址页面选择了地址回来时显示相应的地址
                        var tempAddress = Storage.get('vrsm_address_choose_temp');
                        if (tempAddress) {
                            $scope.address = tempAddress;
                            Storage.remove('vrsm_address_choose_temp');
                        } else {
                            $scope.address = data.default_address;
                            $scope.params.address_id = data.default_address !== null ? data.default_address.id : null;
                        }
                        $scope.orderList = re.data.data.repair_list;
                        for (var i = 0; i < $scope.orderList.length; i++) {
                            $scope.orderList[i].name = $scope.orderList[i].name.join("、");
                        }
                    }
                }, function(re) {
                    Tips.showTips(re.data.msg);
                });
            });
            //打开拍照的选项表
            $scope.showPicAction = function() {
                $ionicActionSheet.show({
                    buttons: [
                        { text: '拍照' },
                        { text: '从相册选择' }
                    ],
                    cancelText: '取消',
                    buttonClicked: function(index) {
                        if (index == 0) {
                            takePic();

                        } else if (index == 1) {
                            imgPicker();
                        }
                        // return true;
                    }
                });
            };

            function takePic() {
                var options = {
                    quality: 80,
                    destinationType: Camera.DestinationType.DATA_URL,
                    sourceType: Camera.PictureSourceType.CAMERA,
                    allowEdit: true,
                    encodingType: Camera.EncodingType.JPEG,
                    // targetWidth: 120,
                    // targetHeight: 120,
                    popoverOptions: CameraPopoverOptions,
                    saveToPhotoAlbum: false,
                    correctOrientation: true
                };

                $cordovaCamera.getPicture(options).then(function(imageData) {
                    $scope.thumbnail.push("data:image/jpeg;base64," + imageData);
                }, function(err) {
                    // Tips.showTips(err);
                    console.log(err);
                    console.log("错误");
                });
            };

            function imgPicker() {
                var options = {
                    maximumImagesCount: 10 - $scope.thumbnail.length,
                    width: 800,
                    height: 0,
                    quality: 80
                };

                $cordovaImagePicker.getPictures(options).then(function(results) {
                    $scope.thumbnail = $scope.thumbnail.concat(results);
                }, function(error) {
                    console.log(error);
                });
            };

            //发送最后的post请求
            function sendPost(postData) {
                httpRequest.postWithAuth($scope, '?method=repair.repairOrder', postData, function(re) {
                    if (re.data.state) {
                        // Tips.showTips('申请成功');
                        $state.go('payOrder', { params: 'orderId=' + re.data.data.order_id + '&payType=1' });
                    }
                }, function(re) {
                    Tips.showTips(re.data.msg);
                }, function(re) {
                    $ionicLoading.hide();
                });
            }

            //删除相片
            $scope.deleteImg = function(index) {
                $scope.thumbnail.splice(index, 1);
            };

            function uploadImage(src, callBackFunc) {
                var filename = src.split("/").pop();
                var postData = httpRequest.getPostParam({});

                var options = {
                    fileKey: "pic",
                    fileName: filename,
                    chunkedMode: false,
                    mimeType: "image/jpg",
                    params: postData
                };
                // $scope.$emit('loadding', 'noBackdrop', 'uploading...');

                $cordovaFileTransfer.upload(httpRequest.getBaseUrl() + '?method=cms.uploadPic', src, options).then(function(re) {
                    // $scope.$emit('loadding', 'false');
                    var data = JSON.parse(re.response);
                    if (data.code == 200) {
                        $scope.pics.push(data.data.url);
                        if ($scope.pics.length == $scope.thumbnail.length) { //全部图片上传成功的话就执行回调函数，把整个帖子上传
                            callBackFunc();
                        }
                    } else {
                        Tips.showTips(data.msg);
                    }
                }, function(err) {
                    // $scope.$emit('loadding', 'false');
                    Tips.showTips(JSON.stringify(err));
                }, function(progress) {
                    // PROGRESS HANDLING GOES HERE
                });
            }

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
                httpRequest
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

            // 提交订单
            $scope.confirmOrder = function() {
                // if (!$scope.params.express_code) {
                //     Tips.showTips("请输入快递单号！");
                //     return false;
                // }
                if (!$scope.params.address_id) {
                    Tips.showTips("请输入地址！");
                    return false;
                }
                if ($scope.coupon) {
                    $scope.params.coupon_id = $scope.coupon.id;
                    if ($scope.repairMoney == $scope.coupon.discount) {
                        $state.go("repairPaySuccess");
                        return;
                    }
                }
                var thumbnails = $scope.thumbnail;
                if (thumbnails.length != 0) {
                    for (var i = 0; i < thumbnails.length; i++) {
                        //一张张上传图片，上传完成后再发布整个帖子
                        uploadImage(thumbnails[i], function() {
                            $scope.params.buyer_pics = $scope.pics.join('|||');
                            sendPost($scope.params);
                        });
                    }
                } else {
                    sendPost($scope.params);
                }
            }
        }
    ]);
});

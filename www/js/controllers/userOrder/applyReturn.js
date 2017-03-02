define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('applyReturnCtrl', ['$scope', 'Storage', 'httpRequest', '$ionicPopup', '$state', '$ionicActionSheet', '$ionicHistory', '$cordovaCamera', '$cordovaImagePicker', '$cordovaFileTransfer', '$ionicLoading',
        function($scope, Storage, httpRequest, $ionicPopup, $state, $ionicActionSheet, $ionicHistory, $cordovaCamera, $cordovaImagePicker, $cordovaFileTransfer, $ionicLoading) {
            var watch;
            $scope.$on("$ionicView.beforeEnter", function() {
                $scope.thumbnail = []; //上传图片的缩略图
                $scope.pics = []; //上传成功的图片push进这个数组，最后拼接起来
                $scope.maxMoney = $state.params.totalPrice;
                $scope.input = { money: Number($state.params.totalPrice) };
                watch = $scope.$watch('input.money', function(newValue, oldValue, scope) {
                    if (newValue >= Number($scope.maxMoney)) {
                        $scope.input.money = Number($scope.maxMoney);
                        return;
                    }
                    newValue = newValue.toString();
                    var decimal = newValue.split('.')[1];
                    if (decimal && decimal.length > 2) {
                        var str = newValue.substring(0, newValue.length - (decimal.length - 2));
                        scope.input.money = Number(str);
                    }
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
                            $scope.takePic();
                        } else {
                            $scope.imgPicker();
                        }
                        return true;
                    }
                });
            };
            //拍照
            $scope.takePic = function() {
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
                });
            };
            //打开相册
            $scope.imgPicker = function() {
                var options = {
                    maximumImagesCount: 10 - $scope.thumbnail.length,
                    width: 800,
                    height: 0,
                    quality: 80
                };

                $cordovaImagePicker.getPictures(options).then(function(results) {
                    $scope.thumbnail = $scope.thumbnail.concat(results);
                }, function(error) {
                    // Tips.showTips(error);
                    console.log(error);
                });
            };
            //删除相片
            $scope.deleteImg = function(index) {
                $scope.thumbnail.splice(index, 1);
            };
            //显示原因选择操作表
            $scope.showReason = function() {
                $ionicActionSheet.show({
                    buttons: [
                        { text: '我不想要了' },
                        { text: '产品质量问题' },
                    ],
                    cancelText: '取消',
                    buttonClicked: function(index) {
                        switch (index) {
                            case 0:
                                $scope.returnReason = '我不想要了'
                                break;
                            case 1:
                                $scope.returnReason = '产品质量问题'
                                break;
                            case 2:
                                $scope.returnReason = '其他'
                                break;
                            default:
                                $scope.returnReason = undefined;
                                break;
                        }
                        return true;
                    }
                });
            };
            //选择是否收到货
            $scope.changeReceivedState = function(state) {
                $scope.receivedState = state;
            };
            //选择退款的方式
            $scope.changeReturnWay = function(state) {
                $scope.returnWay = state;
            };
            $scope.submitReturnApply = function() {
                var postData = {
                    order_id: $state.params.orderId,
                    reason: $scope.returnReason,
                    money: $scope.input.money,
                    is_receipt: $scope.receivedState,
                    type: $scope.returnWay,
                    content: $scope.input.returnContent,
                    person: $scope.input.contact,
                    phone: $scope.input.phone
                };
                if (validate(postData)) {
                    var thumbnails = $scope.thumbnail;
                    $ionicLoading.show({ template: '提交中...' });
                    if (thumbnails.length != 0) {
                        for (var i = 0; i < thumbnails.length; i++) {
                            //一张张上传图片，上传完成后再发布整个帖子
                            uploadImage(thumbnails[i], function() {
                                postData.pics = $scope.pics.join('|||');
                                sendPost(postData);
                            });
                        }
                    } else {
                        sendPost(postData);
                    }
                }
            };
            //发送最后的post请求
            function sendPost(postData) {
                httpRequest.postWithAuth($scope, '?method=shop.refundOrder', postData, function(re) {
                    if (re.data.state) {
                        Tips.showTips('申请成功');
                        $ionicHistory.goBack(-1);
                    }
                }, function(re) {
                    Tips.showTips(re.data.msg);
                }, function(re) {
                    $ionicLoading.hide();
                });
            }

            function validate(postData) {
                if (!postData.reason) {
                    Tips.showTips('请选择退货退款原因');
                    return false;
                }
                if (postData.is_receipt == undefined) {
                    Tips.showTips('请选择是否收到货');
                    return false;
                }
                if (postData.type == undefined) {
                    Tips.showTips('请选择退款的方式');
                    return false;
                }
                if (!postData.content || postData.content == '') {
                    Tips.showTips('请填写退款说明');
                    return false;
                }
                if (!postData.person || postData.person == '') {
                    Tips.showTips('请填写联系人');
                    return false;
                }
                if (!postData.phone || !(/^1[3|4|5|7|8][0-9]\d{4,8}$/.test(Number(postData.phone))) || postData.phone.length != 11) {
                    Tips.showTips('请填写正确的联系方式');
                    return false;
                }
                return true;
            }

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
        }
    ]);

});

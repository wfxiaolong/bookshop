define([
    'app',
    'js/utils/tips',
    'js/utils/exif',
    'js/utils/PhotoUtils'
    ], function(app, Tips) {
        app.controller('userInfoCtrl', ['$scope', 'Storage', 'httpRequest', '$ionicActionSheet', '$cordovaCamera', '$cordovaImagePicker', '$cordovaFileTransfer', 'Storage',
        function($scope, Storage, httpRequest, $ionicActionSheet, $cordovaCamera, $cordovaImagePicker, $cordovaFileTransfer, Storage) {
            $scope.$on("$ionicView.beforeEnter", function() {
                var auth = Storage.get('vrsm_auth');
                console.log(auth)
                setUserInfo(auth);
            });

            function setUserInfo(data) {
                $scope.avatar = data.user_img;
                $scope.nickname = data.nickname;
                $scope.address = data.address.trim() == '' ? '未设置' : data.address;
                $scope.phone = data.phone.trim() == '' ? '未绑定' : data.phone;
            }
            // 更换头像
            $scope.changeAvatar = function() {
                console.log(PhotoUtils)
                    // PhotoUtils.takePictureByHtml5(function (data) {
                    //     console.log(data)
                    // });
                if(navigator.camera){
                    $ionicActionSheet.show({
                        buttons: [
                            { text: '拍照上传' },
                            { text: '手机相册上传' },
                        ],
                        cancelText: '取消',
                        buttonClicked: function(index) {
                            if (index == 0) { //拍照上传
                                var options = {
                                    quality: 80,
                                    destinationType: Camera.DestinationType.DATA_URL,
                                    sourceType: Camera.PictureSourceType.CAMERA,
                                    allowEdit: true,
                                    encodingType: Camera.EncodingType.JPEG,
                                    targetWidth: 120,
                                    targetHeight: 120,
                                    popoverOptions: CameraPopoverOptions,
                                    saveToPhotoAlbum: false,
                                    correctOrientation: true
                                };

                                $cordovaCamera.getPicture(options).then(function(imageData) {
                                    if (imageData) {
                                        uploadImage("data:image/jpeg;base64," + imageData);
                                    }
                                }, function(err) {
                                    // Tips.showTips("出错了");
                                });
                                return true;
                            }
                            if (index == 1) { //从相册拉取图片
                                var options = {
                                    maximumImagesCount: 1,
                                    width: 120,
                                    height: 120,
                                    quality: 80
                                };

                                $cordovaImagePicker.getPictures(options).then(function(results) {
                                    if (results[0]) {
                                        uploadImage(results[0]);
                                    }
                                }, function(error) {
                                    // Tips.showTips("出错了");
                                });
                                return true;
                            }
                        }
                    });
                }else{   //浏览器
                    PhotoUtils.takePictureByHtml5(function(imageData){
                        uploadInH5(imageData);
                    },function(errMsg){
                      //获取图片失败
                      $scope.$emit('loadding', 'noBackdrop', '上传中...');
                    });
                }

            };
            //传入base64
            function uploadImage(src) {
                var filename = src.split("/").pop();
                if (filename.indexOf(".jpg") == -1) filename += ".jpg";
                var vrsm_auth = Storage.get('vrsm_auth');
                var postData = httpRequest.getPostParam({ token: vrsm_auth.token, uid: vrsm_auth.uid, type: 'user_img' });

                var options = {
                    fileKey: "user_img",
                    fileName: filename,
                    chunkedMode: false,
                    mimeType: "image/jpg",
                    params: postData
                };
                $scope.$emit('loadding', 'noBackdrop', '上传中...');

                $cordovaFileTransfer.upload(httpRequest.getBaseUrl() + '?method=user.modifyUserInfo', src, options).then(function(re) {
                    $scope.$emit('loadding', 'false');
                    var data = JSON.parse(re.response);
                    if (data.code == 200) {
                        Tips.showTips('上传成功');
                        $scope.avatar = data.data.url;
                        Storage.setAttr('vrsm_auth', 'user_img', data.data.url);
                    } else {
                        Tips.showTips(data.msg);
                    }
                }, function(err) {
                    $scope.$emit('loadding', 'false');
                    Tips.showTips(JSON.stringify(err));
                }, function(progress) {
                    // PROGRESS HANDLING GOES HERE
                });

            }

            //传入base64
            function uploadInH5(imgData){
                var auth = Storage.get('vrsm_auth');
                var headers = {'Content-Type':undefined};
                var formData = new FormData();
                var params = httpRequest.getPostParam({ token: auth.token, uid: auth.uid, type: 'user_img' });

                for (var key in params) {
                    formData.append(key, params[key]);
                };
                img = PhotoUtils.convertBase64UrlToBlob(imgData);
                formData.append('user_img', img, new Date + '.jpg');
            //完成foromdata包装
                httpRequest.post(httpRequest.getBaseUrl() +'?method=user.modifyUserInfo',formData,function(re){
                    $scope.$emit('loadding', 'false');
                    var data = re.data;
                    if (data.code == 200) {
                        Tips.showTips('上传成功');
                        $scope.avatar = data.data.url;
                        Storage.setAttr('vrsm_auth', 'user_img', data.data.url);
                    } else {
                        Tips.showTips(data.msg);
                    }
                }, function() {

                }, function() {

                }, headers);
            }

        }
    ]);

});

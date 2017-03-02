define(['app', 'js/utils/tips','js/utils/exif','js/utils/PhotoUtils'], function(app, Tips) {
    app.controller('writePostCtrl', ['$scope', 'httpRequest', 'Storage', '$state', '$ionicSlideBoxDelegate', '$ionicHistory', '$cordovaCamera', '$cordovaImagePicker', '$cordovaFileTransfer', '$ionicLoading', '$ionicPopup','$timeout',
        function($scope, httpRequest, Storage, $state, $ionicSlideBoxDelegate, $ionicHistory, $cordovaCamera, $cordovaImagePicker, $cordovaFileTransfer, $ionicLoading, $ionicPopup,$timeout) {
            $scope.$on("$ionicView.beforeEnter", function() {
                $scope.post = { content: '' };
                $scope.moduleId = $state.params.moduleId;
                $scope.thumbnail = [];
                $scope.pics = [];
            });
            $scope.notApp = !APP.isInApp;
            $scope.popShow = function(popName) {
                $scope[popName] = true;
                $ionicSlideBoxDelegate.update();
            };
            $scope.popHide = function(popName) {
                $scope[popName] = false;
            };
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
            $scope.imgPicker = function() {
                if(APP.isInApp){
                    var options = {
                        maximumImagesCount: 10,
                        width: 800,
                        height: 0,
                        quality: 80
                    };
                    $cordovaImagePicker.getPictures(options).then(function(results) {
                        console.log(results);
                        $scope.thumbnail = $scope.thumbnail.concat(results);
                    }, function(error) {
                        // Tips.showTips(error);
                        console.log(error);
                    });
                }else{
                    //如果是H5，用takephotoByHtml5

                    PhotoUtils.takePictureByHtml5(function(imageData){
                        $scope.thumbnail = $scope.thumbnail.concat(imageData);
                        $scope.$apply();//需要手动刷新
                        $scope.$emit('loadding', 'false');
                    },function(){
                        $scope.$emit('loadding', 'noBackdrop', '加载中...');
                    });
                }

            };
            $scope.deleteImg = function(index) {
                $scope.thumbnail.splice(index, 1);
            };
            $scope.submitPost = function() {
                $ionicPopup.confirm({
                    title: '确定发布帖子？',
                    cancelText: '取消',
                    okText: '发布'
                }).then(function(res) {
                    if (res) {
                        var title = $scope.post.title;
                        var content = $scope.post.content;
                        if (!validate(title, content)) return;
                        var thumbnails = $scope.thumbnail;
                        $ionicLoading.show({ template: '发布中...' });
                        if (thumbnails.length == 0) {
                            postPost($scope.moduleId, title, content);
                        } else {
                            for (var i = 0; i < thumbnails.length; i++) {
                                //一张张上传图片，上传完成后再发布整个帖子
                                if(APP.isInApp){
                                    uploadImage(thumbnails[i], function() {
                                        postPost($scope.moduleId, title, content, $scope.pics);
                                    });
                                }else{//如果是H5则用uploadH5方法
                                    uploadInH5(thumbnails[i],function() {
                                        postPost($scope.moduleId, title, content, $scope.pics);
                                    });
                                }
                            }
                        }
                    }
                });
            };

            // 将内容的空格转换成字符实体
            function turnSpace(str) {
                return str.split(" ").join("&nbsp;");
            }


            function postPost(categoryId, title, content, pics) {
                var postData = {
                    category: categoryId,
                    title: turnSpace(title),
                    content:  turnSpace(content)
                };
                console.log(postData.content);
                if (pics) {
                    postData.pics = pics.join("|||");
                }
                httpRequest.postWithAuth($scope, '?method=cms.saveArticle', postData, function(re) {
                    if (re.data.state) {
                        Tips.showTips('发布成功');
                        $scope.goBack();
                    }
                }, function(re) {
                    Tips.showTips(re.data.msg);
                }, function(re) {
                    $ionicLoading.hide();
                });
            }

            function validate(title, content) {
                if (!title || title == '') {
                    Tips.showTips("标题不能为空");
                    return false;
                }
                if (!content || content == '') {
                    Tips.showTips("内容不能为空");
                    return false;
                }
                return true;
            }

            function uploadImage(src, callBackFunc) {
                var filename = src.split("/").pop();
                if (filename.indexOf(".jpg") == -1) filename += ".jpg";
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


            function uploadInH5(imgData,callBackFunc){
                var headers = {'Content-Type':undefined};
                var formData = new FormData();
                var params = httpRequest.getPostParam({});

                for (var key in params) {
                    formData.append(key, params[key]);
                };
                img = PhotoUtils.convertBase64UrlToBlob(imgData);
                formData.append('pic', img, new Date + '.jpg');
            //完成foromdata包装
                httpRequest.post(httpRequest.getBaseUrl() +'?method=cms.uploadPic',formData,function(re){
                    var data = re.data;
                    if (data.code == 200) {
                        $scope.pics.push(data.data.url);
                        if ($scope.pics.length == $scope.thumbnail.length) { //全部图片上传成功的话就执行回调函数，把整个帖子上传
                            callBackFunc();
                        }
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

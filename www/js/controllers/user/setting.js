define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('settingCtrl', ['$scope', 'Storage', 'httpRequest', '$ionicPopup', '$state', '$cordovaAppVersion', '$ionicLoading', '$cordovaFileTransfer', '$cordovaFileOpener2', '$timeout',
        function($scope, Storage, httpRequest, $ionicPopup, $state, $cordovaAppVersion, $ionicLoading, $cordovaFileTransfer, $cordovaFileOpener2, $timeout) {
            $scope.$on("$ionicView.beforeEnter", function() {
                $scope.isIOS = APP.isIOS;
                $scope.isLogin = Storage.get('vrsm_auth') ? true : false;
                $scope.notWeixin = !APP.is_wechat;
            });
            $scope.logout = function() {
                $ionicPopup.confirm({
                    title: '确认退出登录？',
                    cancelText: "取消",
                    okText: "确定"
                }).then(function(res) {
                    if (res) {
                        Storage.remove('vrsm_auth');
                        // Storage.clear(); //正式上线换成clear()，先避免影响其他项目的本地存储
                        $state.go('login');
                    }
                });
            };
            $scope.checkUpdate = function() {
                // 获取服务器端版本号
                httpRequest.postWithUI($scope, '?method=website.download', {}, function(re) {
                    if (re.data.state) {
                        console.log(re.data.data);
                        var serverVersion = re.data.data.android_version;
                        var androidUrl = re.data.data.android_url;
                        $cordovaAppVersion.getVersionNumber().then(function(version) {
                            if (hasUpdate(serverVersion,version)) {
                                $ionicPopup.confirm({
                                    title: '检查到新版本，是否进行更新?',
                                    cancelText: '取消',
                                    okText: "确定"
                                }).then(function(res) {
                                    if (res) {
                                        $ionicLoading.show({
                                            template: "已经下载：0%"
                                        });
                                        var url = androidUrl; //可以从服务端获取更新APP的路径
                                        var trustHosts = true;
                                        //APP下载存放的路径，可以使用cordova file插件进行相关配置
                                        var targetPath = "file:///storage/sdcard0/Download/vrsm(" + serverVersion + ").apk";
                                        var options = {};
                                        $cordovaFileTransfer.download(url, targetPath, options, trustHosts).then(function(result) {
                                            // 打开下载下来的APP
                                            $cordovaFileOpener2.open(targetPath, 'application/vnd.android.package-archive').then(function() {
                                                // 成功
                                            }, function(err) {
                                                // 错误
                                            });
                                            $ionicLoading.hide();
                                        }, function(err) {
                                            Tips.showTips('下载失败');
                                            $ionicLoading.hide();
                                        }, function(progress) {
                                            //进度，这里使用文字显示下载百分比
                                            $timeout(function() {
                                                var downloadProgress = (progress.loaded / progress.total) * 100;
                                                $ionicLoading.show({
                                                    template: "已经下载：" + Math.floor(downloadProgress) + "%"
                                                });
                                                if (downloadProgress > 99) {
                                                    $ionicLoading.hide();
                                                }
                                            })
                                        });
                                    }
                                });
                            } else {
                                Tips.showTips("已经是最新版本啦！");
                            }
                        });
                    }
                }, function(re) {
                    Tips.showTips(re.data.msg);
                });
            };

            function hasUpdate(serverVersion, appVersion) {
                serverVersion = serverVersion.substring(1);
                var newArr = serverVersion.split('.');
                var nowArr = appVersion.split('.');
                var length = newArr.length;
                for (var i = 0; i < length; i++) {
                    if (nowArr[i] < newArr[i]) return true;
                }
                return false;
            };
        }
    ]);

});

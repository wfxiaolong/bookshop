define(['app', 'js/utils/tips','weixinJsSDK'], function(app, Tips,wx) {
    app.controller('yiyuanCtrl', ['$scope', 'Storage', '$state', '$sce', '$ionicPlatform', '$ionicHistory', 'httpRequest', '$rootScope',
        function($scope, Storage, $state, $sce, $ionicPlatform, $ionicHistory, httpRequest, $rootScope) {
            $scope.$on("$ionicView.beforeEnter", function() {
                //刷新夺宝
                var win = document.querySelector('iframe').contentWindow;
                win.postMessage('refresh', "*");
                $scope.isIOSApp = APP.isInApp && APP.isIOS;
                var auth = Storage.get('vrsm_auth');
                if (!auth) {
                    if(APP.is_wechat){
                        // $rootScope.goWechatLogin('#/tab/yiyuan');
                        return;
                    }
                    Tips.showTips('请先登录');
                    $state.go('login', { fromPage: 'yiyuan' });
                } else {
                    //获取新消息提醒
                    httpRequest.postWithAuth($scope, '?method=userInfo.attention', {}, function(re) {
                        if (re.data.state) {
                            $rootScope.newMessage = re.data.data.message > 0 ? true : false;
                        }
                    }, function(re) {
                        console.log(re.data.msg);
                    });
                    $scope.myURL = $sce.trustAsResourceUrl(APP.duobaoUrl + "#/boostrap/" + auth.uid + "|" + auth.token);
                    console.log(APP.duobaoUrl + "#/boostrap/" + auth.uid + "|" + auth.token);
                    //断网时加载不入iframe，ion-content加载不出，然后网络重连后单纯数据载入$scope.myURL无法自动刷新iframe，在这里判断若没有找到ion-content元素则手动刷新
                    var iframeDoc = iframe.document || iframe.contentWindow.document;
                    if (iframeDoc) {
                        if (iframeDoc.querySelector('body').getElementsByTagName('ion-content').length == 0) {
                            if (APP.isIOS) {
                                iframeDoc.location.href = APP.duobaoUrl + "#/boostrap/" + auth.uid + "|" + auth.token;
                            } else {
                                iframeDoc.location.reload();
                            }
                        }
                    }
                    console.log(APP.duobaoUrl + "#/boostrap/" + auth.uid + "|" + auth.token);
                }
                if($state.params.isShare == 'share'){

                }

            });
            window.addEventListener("message", function(e) {
                var data = JSON.parse(e.data);
                if (data.toPage && data.toPage == "address") {
                    $state.go('address');
                }
                if (data.shareWay) {
                    if (window.dmwechat && data.shareWay != 'wechatfirstInit') { // APP中调用分享插件
                        dmwechat.share(data.shareWay, data.params, function(re) {
                            Tips.showTips('分享成功');
                            if (data.isDetail) return; //若是单纯的商品详情分享则不跳转地址
                            var win = document.querySelector('iframe').contentWindow;
                            win.postMessage('shareSuccessTabmain', "*");
                        }, function(re) {
                            Tips.showTips('分享失败');
                        });
                    }else{  //微信初始化
                        if(data.shareWay == 'wechatfirstInit'){
                            console.log(data.params)
                            wechatShareInit(data.params);
                        }else{
                            Tips.showTips('请点击右上角分享');
                        }
                    }
                }
            }, false);

            function wechatShareInit(data) {
                if (APP.is_wechat && !APP.isInApp) {
                    wx.onMenuShareTimeline({
                        title: data.title, // 分享标题
                        link: data.targetUrl, // 分享链接
                        imgUrl: data.imgUrl, // 分享图标
                        success: function() {
                            // 用户确认分享后执行的回调函数
                        },
                        cancel: function() {
                            // 用户取消分享后执行的回调函数
                        }
                    });
                    wx.onMenuShareAppMessage({
                        title: data.title, // 分享标题
                        desc: data.content, // 分享描述
                        link: data.targetUrl, // 分享链接
                        imgUrl: data.targetUrl, // 分享图标
                        // type: '', // 分享类型,music、video或link，不填默认为link
                        // dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
                        success: function() {
                            // 用户确认分享后执行的回调函数
                        },
                        cancel: function() {
                            // 用户取消分享后执行的回调函数
                        }
                    });
                    wx.onMenuShareQZone({
                        title: data.title, // 分享标题
                        desc: data.content, // 分享描述
                        link: data.targetUrl, // 分享链接
                        imgUrl: data.targetUrl, // 分享图标
                        // type: '', // 分享类型,music、video或link，不填默认为link
                        // dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
                        success: function() {
                            // 用户确认分享后执行的回调函数
                        },
                        cancel: function() {
                            // 用户取消分享后执行的回调函数
                        }
                    });
                    wx.onMenuShareQQ({
                        title: data.title, // 分享标题
                        desc: data.content, // 分享描述
                        link: data.targetUrl, // 分享链接
                        imgUrl: data.targetUrl, // 分享图标
                        // type: '', // 分享类型,music、video或link，不填默认为link
                        // dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
                        success: function() {
                            // 用户确认分享后执行的回调函数
                        },
                        cancel: function() {
                            // 用户取消分享后执行的回调函数
                        }
                    });
                }
            }
        }
    ]);
});

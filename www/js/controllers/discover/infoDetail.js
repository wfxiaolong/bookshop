define(['app', 'js/utils/tips', 'weixinJsSDK'], function(app, Tips, wx) {
    app.controller('infoDetailCtrl', ['$scope', 'httpRequest', 'Storage', '$state', '$ionicSlideBoxDelegate', '$sce', '$location', '$timeout', '$ionicHistory',
        function($scope, httpRequest, Storage, $state, $ionicSlideBoxDelegate, $sce, $location, $timeout, $ionicHistory) {
            $scope.$on("$ionicView.beforeEnter", function() {
                $scope.is_hide = false;
                $scope.isSharePage = $state.params.isShare == 'share' ? true : false;
                $scope.article = {};
                $scope.comment = { commentInput: '' };
                $scope.commentList = [];
                $scope.page = 1;
                $scope.commentId = -1; //具体评论哪条评论时用到，记录当前选择的评论
                $scope.articleId = $state.params.infoId;
                $scope.vrsm_auth = Storage.get("vrsm_auth");
                $scope.isCollect = false;
                $scope.isLike = false;
                $scope.isApp = APP.isInApp;

                $timeout(function() {
                    httpRequest.postWithUI($scope, '?method=cms.articleInfo', { id: $scope.articleId }, function(re) {
                        if (re.data.state) {
                            var data = re.data.data;
                            $scope.article = data;
                            wechatShareInit();
                            videoNormal();
                        }
                    }, function(re) {
                        Tips.showTips(re.data.msg);
                        $ionicHistory.goBack();
                    });
                    if ($scope.vrsm_auth) {
                        // 收藏和点赞
                        httpRequest.postWithUI($scope, '?method=cms.checkArticleLikeCollect', { aid: $scope.articleId, uid: $scope.vrsm_auth.uid, token: $scope.vrsm_auth.token }, function(re) {
                            if (re.data.data.is_collect) {
                                $scope.isCollect = true;
                            }
                            if (re.data.data.is_like) {
                                $scope.isLike = true;
                            }
                        }, function(re) {
                            Tips.showTips(re.data.msg);
                        })
                    }
                    getCommentList($scope.page);
                }, 300);
            });

            $scope.$on("$ionicView.afterEnter", function() {
                videoNormal();
                $scope.$apply();
            });

            // 隐藏遮罩层
            $scope.hide =function() {
                $scope.is_hide = true;
            }

            // 控制视频宽高正常
            function videoNormal() {
                var videos = angular.element(document.getElementsByTagName('video'));
                for (var i = 0; i < videos.length; i++) {
                    videos[i].preload = 'auto';
                    console.log(videos[i].preload);
                }
            }
            $scope.$on("$ionicView.beforeLeave", function() {
                window.stop();
                stopVideo();
            });
            // 如果是安卓APP的话就用iframe打开外链
            if (APP.isInApp && !APP.isIOS) {
                angular.element(document.querySelector('#info_detail')).on('click', function(event) {
                    var target = event.target;
                    if (target.tagName === 'A') {
                        event.preventDefault();
                        $state.go('iframePage', { url: target.href });
                    }
                });
            }
            $scope.sendComment = function() {
                var content = $scope.comment.commentInput;
                var isSubComment = ($scope.commentId != -1);
                var postData = {
                    content: content,
                    article_id: $scope.articleId
                };
                if (isSubComment) {
                    postData.comment_id = $scope.commentId;
                }
                httpRequest.postWithAuth($scope, '?method=cms.saveComment', postData, function(re) {
                    if (re.data.state) {
                        Tips.showTips("评论成功");
                        var returnComment = re.data.data;
                        if (isSubComment) {
                            var commentList = $scope.commentList;
                            var length = $scope.commentList.length;
                            for (var i = 0; i < length; i++) {
                                if (returnComment.id == commentList[i].id) {
                                    commentList[i] = returnComment;
                                    break;
                                }
                            }
                        } else {
                            $scope.commentList.push(returnComment);
                        }
                        $scope.popHide('commentPop');
                    }
                }, function(re) {
                    Tips.showTips(re.data.msg);
                });
            };
            $scope.subComment = function(comment, isSharePage) {
                // if (isSharePage) return;
                $scope.commentId = comment.id;
                $scope.popShow('commentPop');
            };
            $scope.like = function() {
                httpRequest.postWithUI($scope, '?method=cms.articleLike', { id: $scope.articleId }, function(re) {
                    if (re.data.state) {
                        Tips.showTips("点赞成功");
                        $scope.article.likes = Number($scope.article.likes) + 1;
                        $scope.isLike = true;
                    }
                }, function(re) {
                    Tips.showTips(re.data.msg);
                });
            };
            $scope.collect = function() {
                if (!checkLogin()) {
                    if(!APP.isInApp){
                        $state.go('login');
                        return
                    }
                    Tips.showTips("您还未登录");
                    return;
                }
                httpRequest.postWithAuth($scope, '?method=cms.saveCollect', { collect_id: $scope.articleId, type: 1 }, function(re) {
                    if (re.data.state) {
                        Tips.showTips("收藏成功");
                        $scope.isCollect = true;
                    }
                }, function(re) {
                    Tips.showTips(re.data.msg);
                });
            };
            $scope.jumpReward = function(articleId) {
                if (!checkLogin()) {
                    if(!APP.isInApp){
                        $state.go('login');
                        return
                    }
                    Tips.showTips("您还未登录");
                    return;
                }
                $state.go('reward', { params: 'articleId=' + articleId + '&fromPage=infoDetail' });
            };
            // 调出表情
            $scope.showExpressionPanel = function() {
                $scope.expressionShow = true;
                if (APP.isInApp) {
                    cordova.plugins.Keyboard.close();
                }
                $ionicSlideBoxDelegate.update();
            };
            // 隐藏表情
            $scope.hideExpressPanel = function() {
                $scope.expressionShow = false;
            };
            //分享到其他平台
            $scope.shareWechat = function(type) {
                var data = {
                    "title": $scope.article.title,
                    "content": htmlFilter($scope.article.content).substring(0, 20) + '...',
                    "imgUrl": APP.shareUrl + 'img/icon.png',
                    "targetUrl": APP.shareUrl + '#/infoDetail/' + $scope.articleId + '/share/'
                }
                dmwechat.share(type, data, function(re) {
                    Tips.showTips('分享成功');
                }, function(re) {
                    Tips.showTips('分享失败');
                });
                $scope.sharePop = false;
            };

            function htmlFilter(description) {
                description = description.replace(/(\n)/g, "");
                description = description.replace(/(\t)/g, "");
                description = description.replace(/(\r)/g, "");
                description = description.replace(/<\/?[^>]*>/g, "");
                description = description.replace(/\s*/g, "");
                description = description.replace(/&nbsp;/ig, '');
                return description;
            }

            $scope.sharePopShow = function() {
                if(!APP.is_wechat && !APP.isInApp){
                    Tips.showTips('请点击浏览器的分享按钮');
                    return;
                }
                var pop = (APP.is_wechat && !APP.isInApp) ? 'webSharePop' : 'sharePop';
                $scope.popShow(pop);
            };
            $scope.popShow = function(popName) {
                if (popName == "commentPop") {
                    if (!checkLogin()) {
                         if(!APP.isInApp){
                            $state.go('login');
                            return
                        }
                        Tips.showTips("请先登录");
                        return;
                    }
                }
                $scope[popName] = true;
            };
            $scope.popHide = function(popName) {
                $scope[popName] = false;
                $scope.expressionShow = false;
                $scope.commentId = -1;
                $scope.comment.commentInput = '';
            };
            $scope.loadMore = function() {
                if ($scope.page == 1) return;
                getCommentList($scope.page);
            };

            function getCommentList(page) {
                httpRequest.postWithUI($scope, '?method=cms.commentList', { article_id: $scope.articleId, page: page, order_type: 1 }, function(re) {
                    if (re.data.state) {
                        var data = re.data.data.list;
                        $scope.page++;
                        $scope.commentList = $scope.commentList.concat(data);
                        if (data.length < 10) {
                            $scope.noData = true;
                        }
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    }
                }, function(re) {
                    Tips.showTips(re.data.msg);
                });
            };

            function checkLogin() {
                return (Storage.get('vrsm_auth') == undefined) ? false : true;
            }

            // 阻止视频播放
            function stopVideo() {
                var videos = document.getElementsByTagName('video');
                for (var i = 0; i < videos.length; i++) {
                    videos[i].pause();
                }
                console.log(videos);
            }

            // 控制视频宽高正常
            function videoNormal() {
                var videos = document.getElementsByTagName('video');
                for (var i = 0; i < videos.length; i++) {
                    videos[i].preload = 'auto';
                }
            }

            function wechatShareInit() {
                if (APP.is_wechat && !APP.isInApp) {
                    wx.onMenuShareTimeline({
                        title: $scope.article.title, // 分享标题
                        link: APP.shareUrl + '#/infoDetail/' + $scope.articleId + '/share/', // 分享链接
                        imgUrl: $scope.article.cover, // 分享图标
                        success: function() {
                            // 用户确认分享后执行的回调函数
                        },
                        cancel: function() {
                            // 用户取消分享后执行的回调函数
                        }
                    });
                    wx.onMenuShareAppMessage({
                        title: $scope.article.title, // 分享标题
                        desc: htmlFilter($scope.article.content).substring(0, 20) + '...', // 分享描述
                        link: APP.shareUrl + '#/infoDetail/' + $scope.articleId + '/share/', // 分享链接
                        imgUrl: $scope.article.cover, // 分享图标
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
                        title: $scope.article.title, // 分享标题
                        desc: htmlFilter($scope.article.content).substring(0, 20) + '...', // 分享描述
                        link: APP.shareUrl + '#/infoDetail/' + $scope.articleId + '/share/', // 分享链接
                        imgUrl: $scope.article.cover, // 分享图标
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
                        title: $scope.article.title, // 分享标题
                        desc: htmlFilter($scope.article.content).substring(0, 20) + '...', // 分享描述
                        link: APP.shareUrl + '#/infoDetail/' + $scope.articleId + '/share/', // 分享链接
                        imgUrl: $scope.article.cover, // 分享图标
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

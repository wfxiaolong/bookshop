define(['app', 'js/utils/tips', 'weixinJsSDK'], function(app, Tips, wx) {
    app.controller('postDetailCtrl', ['$scope', 'httpRequest', 'Storage', '$state', '$ionicSlideBoxDelegate', '$timeout', '$ionicPopup', '$ionicHistory', '$timeout','$sce',
        function($scope, httpRequest, Storage, $state, $ionicSlideBoxDelegate, $timeout, $ionicPopup, $ionicHistory, $timeout,$sce) {
            var auth = Storage.get("vrsm_auth");
            $scope.$on("$ionicView.beforeEnter", function() {

                $scope.isSharePage = $state.params.isShare == 'share' ? true : false;
                $scope.postId = $state.params.postId;
                $scope.comment = { commentInput: '' };
                $scope.commentList = [];
                $scope.page = 1;
                $scope.commentId = -1; //具体评论哪条评论时用到，记录当前选择的评论
                $scope.isCollect = false;
                $scope.isLike = false;
                //获取帖子详细信息
                httpRequest.postWithUI($scope, '?method=cms.articleInfo', { id: $scope.postId }, function(re) {
                    if (re.data.state) {
                        var data = re.data.data;
                        $scope.post = data;
                        $scope.post.title = $sce.trustAsHtml(replaceSpace($scope.post.title));
                        $scope.post.content = $sce.trustAsHtml(replaceSpace($scope.post.content));
                        wechatShareInit();
                    }
                }, function(re) {
                    Tips.showTips(re.data.msg);
                    // $timeout(function() {
                    //     $ionicHistory.goBack();
                    // }, 800)
                    $ionicHistory.goBack();
                });
                getCommentList($scope.page);

                // 点赞和收藏详情
                if (auth) {
                    httpRequest.postWithAuth($scope, '?method=cms.checkArticleLikeCollect', { aid: $scope.postId }, function(re) {
                        if (re.data.data.is_collect) {
                            $scope.isCollect = true;
                        }
                        if (re.data.data.is_like) {
                            $scope.isLike = true;
                        }
                    }, function(re) {
                        Tips.showTips(re.data.msg);
                        console.log(re);
                    })
                }
            });
            function replaceSpace(str){
                return str.split('&amp;nbsp;').join('&nbsp;');
            }
            $scope.like = function() {
                if (!Storage.get('vrsm_auth')) {
                    if(!APP.isInApp){
                        $state.go('login');
                        return
                    }
                    Tips.showTips('请先登录');
                    return;
                }
                httpRequest.postWithAuth($scope, '?method=cms.articleLike', { id: $scope.postId}, function(re) {
                    if (re.data.state) {
                        Tips.showTips("点赞成功");
                        Storage.setAttr("vrsm_auth", "collected", "1");
                        $scope.post.likes = Number($scope.post.likes) + 1;
                        $scope.isLike = true;
                    }
                }, function(re) {
                    Tips.showTips(re.data.msg);
                });
            };
            $scope.collect = function() {
                if (!Storage.get('vrsm_auth')) {
                    if(!APP.isInApp){
                        $state.go('login');
                        return
                    }
                    Tips.showTips('请先登录');
                    return;
                }
                httpRequest.postWithAuth($scope, '?method=cms.saveCollect', { collect_id: $scope.postId, type: 1 }, function(re) {
                    if (re.data.state) {
                        Tips.showTips("收藏成功");
                        Storage.setAttr("vrsm_auth", "collected", "1");
                        $scope.isCollect = true;
                    }
                }, function(re) {
                    Tips.showTips(re.data.msg);
                });
            };
            $scope.jumpReward = function(postId) {
                if (!Storage.get('vrsm_auth')) {
                    if(!APP.isInApp){
                        $state.go('login');
                        return
                    }
                    Tips.showTips('请先登录');
                    return;
                }
                $state.go('reward', { params: 'articleId=' + postId + '&fromPage=postDetail' });
            };
            $scope.report = function() {
                $ionicPopup.confirm({
                    title: '确认举报该帖子？',
                    cancelText: '取消',
                    okText: '确定'
                }).then(function(res) {
                    if (res) {
                        Tips.showTips('举报成功，我们将在24小时内进行处理。');
                    }
                });
            };
            $scope.sendComment = function() {
                var content = $scope.comment.commentInput;
                var isSubComment = ($scope.commentId != -1);
                var postData = {
                    content: content,
                    article_id: $scope.postId
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
                            $scope.countComment = Number($scope.countComment) + 1;
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


            // 调出表情---------------------------------------------------------
            $scope.showExpressionPanel = function() {
                $scope.expressionShow = true;
                $ionicSlideBoxDelegate.update();
                if (APP.isInApp) {
                    cordova.plugins.Keyboard.close();
                }
            };

            // 隐藏表情---------------------------------------------------------
            $scope.hideExpressionPanel = function() {
                $scope.expressionShow = false;
            };

            //分享到其他平台
            $scope.shareWechat = function(type) {
                var data = {
                    "title": $scope.post.title,
                    "content": $scope.post.content.substring(0, 20) + '...',
                    "imgUrl": APP.shareUrl + 'img/icon.png',
                    "targetUrl": APP.shareUrl + '#/postDetail/' + $scope.postId + '/share/'
                }
                dmwechat.share(type, data, function(re) {
                    Tips.showTips('分享成功');
                    $scope.sharePop = false;
                }, function(re) {
                    Tips.showTips('分享失败');
                });
                $scope.sharePop = false;
            };

            //跳转去作者的个人页
            $scope.jumpUser = function(uid) {
                if ($scope.isSharePage) {
                    return;
                }
                $state.go('followDetail', { uid: uid });
            };
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
                    if (!Storage.get('vrsm_auth')) {
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
                httpRequest.postWithUI($scope, '?method=cms.commentList', { article_id: $scope.postId, page: page, order_type: 1 }, function(re) {
                    if (re.data.state) {
                        var data = re.data.data.list;
                        $scope.page++;
                        $scope.commentList = $scope.commentList.concat(data);
                        $scope.countComment = re.data.data.total;
                        if (data.length < 10) {
                            $scope.noData = true;
                        }
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    }
                }, function(re) {
                    Tips.showTips(re.data.msg);
                });
            };

            function wechatShareInit() {
                if (APP.is_wechat && !APP.isInApp) {
                    wx.onMenuShareTimeline({
                        title: $scope.post.title, // 分享标题
                        link: APP.shareUrl + '#/postDetail/' + $scope.postId + '/share/', // 分享链接
                        imgUrl: $scope.post.cover, // 分享图标
                        success: function() {
                            // 用户确认分享后执行的回调函数
                        },
                        cancel: function() {
                            // 用户取消分享后执行的回调函数
                        }
                    });
                    wx.onMenuShareAppMessage({
                        title: $scope.post.title, // 分享标题
                        desc: $scope.post.content.substring(0, 20) + '...', // 分享描述
                        link: APP.shareUrl + '#/postDetail/' + $scope.postId + '/share/', // 分享链接
                        imgUrl: $scope.post.cover, // 分享图标
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
                        title: $scope.post.title, // 分享标题
                        desc: $scope.post.content.substring(0, 20) + '...', // 分享描述
                        link: APP.shareUrl + '#/postDetail/' + $scope.postId + '/share/', // 分享链接
                        imgUrl: $scope.post.cover, // 分享图标
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
                        title: $scope.post.title, // 分享标题
                        desc: $scope.post.content.substring(0, 20) + '...', // 分享描述
                        link: APP.shareUrl + '#/postDetail/' + $scope.postId + '/share/', // 分享链接
                        imgUrl: $scope.post.cover, // 分享图标
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

define(['app', 'js/utils/tips','weixinJsSDK'], function(app, Tips,wx) {
    app.controller('indexProDetailCtrl', ['$scope', 'httpRequest', 'Storage', '$state', '$ionicSlideBoxDelegate', '$window', '$ionicHistory',
        function($scope, httpRequest, Storage, $state, $ionicSlideBoxDelegate, $window, $ionicHistory) {
            $scope.$on("$ionicView.beforeEnter", function() {
                $scope.isIOSApp = APP.isInApp && APP.isIOS;
                var auth = $scope.auth = Storage.get('vrsm_auth');
                $scope.goodId = $state.params.goodId;
                $scope.fromNotification = $state.params.fromNotification;
                $scope.isShare = $state.params.isShare == 'share';
                //如果要隐藏 nghide= isShare
                $scope.standard = -1;
                $scope.input = { goodNum: 1 };
                //根据屏幕宽度初始化swiper的高度
                initSwiperHeight(750 / 750, function() {
                    // 获取商品详情
                    httpRequest.post('?method=shop.goodInfo', { id: $scope.goodId }, function(re) {
                        if (re.data.state) {
                            $scope.good = re.data.data;
                            $ionicSlideBoxDelegate.update();
                            wechatShareInit();
                        }
                    }, function(re) {
                        Tips.showTips(re.data.msg);
                    });
                });

                //获取评论列表(前2项)
                httpRequest.post('?method=shop.shopCommentList', { page: 1, each: 2, good_id: $scope.goodId }, function(re) {
                    if (re.data.state) {
                        var data = re.data.data;
                        $scope.averageStar = data.average_star;
                        $scope.commentList = data.list;
                    }
                }, function(re) {});
                if (auth) {
                    //检查收藏状态
                    httpRequest.postWithAuth($scope, '?method=cms.checkCollect', { type: 2, collect_id: $scope.goodId }, function(re) {
                        if (re.data.state) {
                            $scope.isCollect = re.data.data.is_collect;
                        }
                    }, function(re) {});
                }
            });
            //选择型号
            $scope.chooseStandard = function(v, index) {
                $scope.input.goodNum = 1;
                if ($scope.standard == index) {
                    $scope.standard = -1;
                    $scope.nowStandard = undefined;
                    return;
                }
                $scope.standard = index;
                $scope.nowStandard = v;
            };
            //跳转购物车
            $scope.jumpCart = function() {
                if (!$scope.auth) {
                    if(!APP.isInApp){
                        $state.go('login');
                        return
                    }
                    Tips.showTips('请先登录');
                    return;
                }
                $state.go('cart');
            };
            //收藏商品
            $scope.collect = function() {
                if (!$scope.auth) {
                    if(!APP.isInApp){
                        $state.go('login');
                        return
                    }
                    Tips.showTips('请先登录');
                    return;
                }
                httpRequest.postWithAuth($scope, '?method=cms.saveCollect', { type: 2, collect_id: $scope.goodId }, function(re) {
                    if (re.data.state) {
                        Tips.showTips("收藏成功");
                        $scope.isCollect = 1;
                    }
                }, function(re) {
                    Tips.showTips(re.data.msg);
                });
            };
            //分享到其他平台
            $scope.shareWechat = function(type) {
                var data = {
                    "title": $scope.good.name,
                    "content": $scope.good.abstract,
                    "imgUrl": $scope.good.cover,
                    "targetUrl": APP.shareUrl + '#/indexProDetail/' + $scope.good.id + '/share/'
                }
                dmwechat.share(type, data, function(re) {
                    Tips.showTips('分享成功');
                }, function(re) {
                    Tips.showTips('分享失败');
                });
                $scope.sharePop = false;
            };
            //修改商品数量
            $scope.validate = function(action) {
                if (!$scope.nowStandard) {
                    Tips.showTips('请先选择型号');
                    return;
                }
                if ($scope.nowStandard.stock == 0) {
                    Tips.showTips('该型号已没有库存');
                    return;
                }
                if (action == 'add') {
                    $scope.addNum();
                } else {
                    $scope.reduceNum();
                }
            };
            $scope.numCtrl = function() {
                if ($scope.input.goodNum < 1) {
                    $scope.input.goodNum = '';
                }
                if (Number($scope.input.goodNum) >= $scope.nowStandard.stock) {
                    $scope.input.goodNum = Number($scope.nowStandard.stock);
                }
            };
            $scope.reduceNum = function() {
                if ($scope.input.goodNum == 1) {
                    Tips.showTips('最少购买数量为1');
                    return;
                }
                $scope.input.goodNum--;
            };
            $scope.addNum = function() {
                if ($scope.input.goodNum >= $scope.nowStandard.stock) {
                    Tips.showTips('已没有更多的库存');
                    return;
                }
                $scope.input.goodNum++;
            };
            //加入购物车
            $scope.addCart = function() {
                var postData = validateAndGenerate();
                if (postData) {
                    httpRequest.postWithAuth($scope, '?method=shop.addShopCart', postData, function(re) {
                        if (re.data.state) {
                            Tips.showTips("添加购物车成功");
                            $scope.popHide("standardPop");
                        }
                    }, function(re) {
                        Tips.showTips(re.data.msg);
                    });
                }
            };
            //立即购买
            $scope.buyNow = function() {
                var postData = validateAndGenerate();
                if (postData) {
                    httpRequest.postWithAuthUser($scope, '?method=shop.addShopCart', postData, function(re) {
                        if (re.data.state) {
                            $state.go('confirmOrder', { cartIds: re.data.data.cart_id });
                        }
                    }, function(re) {
                        Tips.showTips(re.data.msg);
                    });
                }
            };
            //确认型号选择
            $scope.confirmStandard = function() {
                if (!$scope.nowStandard || $scope.nowStandard.stock == 0) {
                    Tips.showTips('该型号已没有库存');
                    return;
                }
                $scope.popHide('standardPop');
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
                $scope[popName] = true;
                $scope.chooseStandard($scope.good.stock[0], 0);
            };
            $scope.popHide = function(popName) {
                $scope[popName] = false;
                $scope.standard = -1;
                $scope.nowStandard = undefined;
            };

            function initSwiperHeight(percent, callBackFunc) {
                var width = document.body.clientWidth;
                var height = width / percent;
                var swipers = angular.element(document.getElementsByClassName('swiper'));
                swipers.css('height', height + 'px');
                if (typeof callBackFunc == 'function') callBackFunc();
            }

            function validateAndGenerate() {
                if (!$scope.auth) {
                    if(!APP.isInApp){
                        $state.go('login');
                        return
                    }
                    Tips.showTips('请先登录');
                    return undefined;
                }
                if (!$scope.nowStandard) {
                    if ($scope.standardPop) {
                        Tips.showTips('请选择型号');
                    } else {
                        $scope.popShow('standardPop');
                    }
                    return undefined;
                }
                var postData = {
                    good_id: $scope.goodId,
                    stock_id: $scope.nowStandard.id,
                    quantity: $scope.input.goodNum
                }
                return postData;
            }
            function htmlFilter(description) {
                description = description.replace(/(\n)/g, "");
                description = description.replace(/(\t)/g, "");
                description = description.replace(/(\r)/g, "");
                description = description.replace(/<\/?[^>]*>/g, "");
                description = description.replace(/\s*/g, "");
                description = description.replace(/&nbsp;/ig, '');
                return description;
            }
            function wechatShareInit() {
                if (APP.is_wechat && !APP.isInApp) {
                    wx.onMenuShareTimeline({
                        title: $scope.good.name, // 分享标题
                        link: APP.shareUrl + '#/indexProDetail/' + $scope.good.id + '/share/', // 分享链接
                        imgUrl: $scope.good.cover, // 分享图标
                        success: function() {
                            // 用户确认分享后执行的回调函数
                        },
                        cancel: function() {
                            // 用户取消分享后执行的回调函数
                        }
                    });
                    wx.onMenuShareAppMessage({
                        title: $scope.good.name, // 分享标题
                        desc: htmlFilter($scope.good.content).substring(0, 20) + '...', // 分享描述
                        link: APP.shareUrl + '#/indexProDetail/' + $scope.good.id + '/share/', // 分享链接
                        imgUrl: $scope.good.cover, // 分享图标
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
                        title: $scope.good.name, // 分享标题
                        desc: htmlFilter($scope.good.content).substring(0, 20) + '...', // 分享描述
                        link: APP.shareUrl + '#/indexProDetail/' + $scope.good.id + '/share/', // 分享链接
                        imgUrl: $scope.good.cover, // 分享图标
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
                        title: $scope.good.name, // 分享标题
                        desc: htmlFilter($scope.good.content).substring(0, 20) + '...', // 分享描述
                        link: APP.shareUrl + '#/indexProDetail/' + $scope.good.id + '/share/', // 分享链接
                        imgUrl: $scope.good.cover, // 分享图标
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

define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('orderCommentCtrl', ['$scope', 'Storage', 'httpRequest', '$ionicScrollDelegate', '$ionicPopup', '$state', '$ionicHistory',
        function($scope, Storage, httpRequest, $ionicScrollDelegate, $ionicPopup, $state, $ionicHistory) {
            $scope.$on("$ionicView.beforeEnter", function() {
                $scope.input = { comment: '' };
                console.log($state.params.goodId)
                console.log($state.params.orderId)
            });
            $scope.changeStar = function(star) {
                $scope.stars = star;
            };
            $scope.commitComment = function() {
                var postData = {
                    order_id: $state.params.orderId,
                    good_id: $state.params.goodId,
                    content: $scope.input.comment,
                    star: $scope.stars
                }
                if (validate(postData)) {
                    httpRequest.postWithAuth($scope, '?method=shop.shopComment', postData, function(re) {
                        if (re.data.state) {
                            Tips.showTips("评论成功");
                            $ionicHistory.goBack(-1);
                        }
                    }, function(re) {
                        Tips.showTips(re.data.msg);
                    });
                }
            };

            function validate(postData) {
                if (!postData.star) {
                    Tips.showTips('请选择星级');
                    return false;
                }
                if (postData.content == '') {
                    Tips.showTips('请输入评论内容');
                    return false;
                }
                return true;
            }
        }
    ]);

});

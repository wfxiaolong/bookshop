define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('settinShareCtrl', ['$scope', 'Storage', 'httpRequest', '$state', function($scope, Storage, httpRequest, $state) {
        $scope.$on("$ionicView.beforeEnter", function() {
            //分享到其他平台
            $scope.shareWechat = function(type) {
                var data = {
                    "title": 'VR数码前线',
                    "content": "省钱，省心，省时，省事",
                    "imgUrl": APP.shareUrl + 'img/icon.png',
                    "targetUrl": APP.domain + '?ct=index&ac=share'
                }
                dmwechat.share(type, data, function(re) {
                    Tips.showTips('分享成功');
                }, function(re) {
                    Tips.showTips('分享失败');
                });
            }
        });
    }]);

});

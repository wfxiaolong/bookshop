define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('richTextCtrl', ['$scope', 'httpRequest', '$state', function($scope, httpRequest, $state) {
        $scope.$on("$ionicView.beforeEnter", function() {
            var page = $state.params.page;
            $scope.title = page;
            //URL传字符串'用户协议'或者'隐私政策'请求不同接口
            var url = (page == '用户协议') ? '?method=website.userAgreement' : '?method=website.privatePolicy';
            httpRequest.postWithUI($scope, url, {}, function(re) {
                if (re.data.state) {
                    $scope.content = re.data.data.content;
                }
            }, function(re) {
                Tips.showTips(re.data.msg);
            });
        });
    }]);

});

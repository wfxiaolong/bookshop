define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('myYiyuanPrizeCtrl', ['$scope', 'Storage', '$state', '$sce',
        function($scope, Storage, $state, $sce) {
            $scope.$on("$ionicView.beforeEnter", function() {
                var auth = Storage.get('vrsm_auth');
                if (!auth) {
                    Tips.showTips('请先登录');
                    $state.go('login');
                } else {
                    $scope.myURL = $sce.trustAsResourceUrl(APP.duobaoUrl + "#/boostrap/" + auth.uid + "|" + auth.token + "|winningRecord");
                    console.log(APP.duobaoUrl + "#/boostrap/" + auth.uid + "|" + auth.token + "|winningRecord");
                }
            });

            window.addEventListener("message", function(e) {
                var data = JSON.parse(e.data);
                if (data.toPage && data.toPage == "address") {
                    $state.go('address');
                }
                if (data.shareWay && window.dmwechat) {
                    dmwechat.share(data.shareWay, data.params, function(re) {
                        Tips.showTips('分享成功');
                        if (data.isDetail) return; //若是单纯的商品详情分享则不跳转地址
                        var win = document.querySelector('iframe').contentWindow;
                        win.postMessage('shareSuccess', "*");
                    }, function(re) {
                        Tips.showTips('分享失败');
                    });
                }
            }, false);
        }
    ]);

});

define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('concatServiceCtrl', ['$scope', 'httpRequest', 'Storage', '$state', '$ionicSlideBoxDelegate', '$ionicPopup',
        function($scope, httpRequest, Storage, $state, $ionicSlideBoxDelegate, $ionicPopup) {
            $scope.$on("$ionicView.beforeEnter", function() {
                httpRequest.post(httpRequest.getBaseUrl()+"?method=website.consult", {}, function(re) {
                    if (re.data.state) {
                        $scope.qrCode = re.data.data.qcode;
                        $scope.hotline = re.data.data.hotline;
                    } else {
                        Tips.showTips(re.data.msg);
                    }
                })
            });
        }
    ]);
});
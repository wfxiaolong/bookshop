define(['app', 'js/utils/tips'], function(app, Tips) {
    app.controller('settingFeedbackCtrl', ['$scope', 'httpRequest', 'Storage', '$state','$ionicHistory',
        function($scope, httpRequest, Storage,$state,$ionicHistory) {
            $scope.$on("$ionicView.beforeEnter", function() {
                $scope.feedback = {};
                if (!Storage.get('vrsm_auth')) {
                    $scope.noLogin = true;
                }
            });

            $scope.submitFeedback = function () {
                var content = $scope.feedback.content;
                if (!content || content.length < 10) {
                    Tips.showTips("反馈内容长度太短!");
                    return;
                }
                var postData = {
                    content: content
                };
                var auth = Storage.get('vrsm_auth');
                if (auth) {
                    postData.uid = auth.uid;
                    postData.token = auth.token;
                } else {
                    postData.phone = $scope.feedback.phone || '';
                }
                httpRequest.postWithUI($scope, '?method=userInfo.saveFeedback', postData, function(re) {
                    if (re.data.state) {
                        Tips.showTips("提交成功，谢谢您的反馈");
                        $ionicHistory.goBack();
                    }
                }, function(re) {
                    Tips.showTips(re.data.msg);
                });
            };
        }
    ]);

});

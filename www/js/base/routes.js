/*
                       _ooOoo_
                      o8888888o
                      88" . "88
                      (| -_- |)
                      O\  =  /O
                   ____/`---'\____
                 .'  \\|     |//  `.
                /  \\|||  :  |||//  \
               /  _||||| -:- |||||-  \
               |   | \\\  -  /// |   |
               | \_|  ''\---/''  |   |
               \  .-\__  `-`  ___/-. /
             ___`. .'  /--.--\  `. . __
          ."" '<  `.___\_<|>_/___.'  >'"".
         | | :  `- \`.;`\ _ /`;.`/ - ` : | |
         \  \ `-.   \_ __\ /__ _/   .-` /  /
    ======`-.____`-.___\_____/___.-`____.-'======
                       `=---='
    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
             佛祖保佑       永无BUG
*/
define([
    'app'
], function(app) {
    app
        .config(function($stateProvider, $urlRouterProvider) {
            $stateProvider
                .state('tab', {
                    url: '/tab',
                    abstract: true,
                    templateUrl: 'templates/tabs.html',
                    // controller: "tabCtrl",
                    // controllerUrl: 'js/controllers/tab.js'
                })
                .state('tab.index', { //首页
                    url: '/index',
                    views: {
                        'tab-index': {
                            templateUrl: function() {
                                return "templates/index/tab-index.html";
                            },
                            controller: "indexCtrl",
                            controllerUrl: 'js/controllers/index.js'
                        }
                    }
                })
                .state('tab.cart', { //购物车
                    url: '/cart',
                    views: {
                        'tab-cart': {
                            templateUrl: "templates/cart/tab-cart.html",
                            controller: "cartCtrl",
                            controllerUrl: 'js/controllers/cart/cart.js'
                        }
                    }
                })
                .state('tab.fee', { //缴费
                    url: '/fee',
                    views: {
                        'tab-fee': {
                            templateUrl: "templates/fee/tab-fee.html",
                            controller: "feeCtrl",
                            controllerUrl: 'js/controllers/fee/fee.js'
                        }
                    }
                })
                .state('feeDetail', { //缴费详情
                    url: '/feeDetail',
                    templateUrl: "templates/fee/feeDetail.html",
                    controller: "feeDetailCtrl",
                    controllerUrl: 'js/controllers/fee/feeDetail.js'
                })
                .state('position', { //定位信息
                    url: '/position',
                    templateUrl: "templates/position.html",
                    controller: "positionCtrl",
                    controllerUrl: 'js/controllers/position.js'
                })
                .state('children', { //孩子列表信息
                    url: '/children',
                    templateUrl: "templates/user/children.html",
                    controller: "childrenCtrl",
                    controllerUrl: 'js/controllers/user/children.js'
                })
                .state('addChild', { //添加小孩
                    url: '/addChild',
                    templateUrl: "templates/user/addChild.html",
                    controller: "addChildCtrl",
                    controllerUrl: 'js/controllers/user/addChild.js'
                })
                .state('studentList', { //学生列表
                    url: '/studentList',
                    templateUrl: "templates/fee/studentList.html",
                    controller: "studentListCtrl",
                    controllerUrl: 'js/controllers/fee/studentList.js'
                })
                .state('studentDetail', { //学生详情
                    url: '/studentDetail',
                    templateUrl: "templates/fee/studentDetail.html",
                    controller: "studentDetailCtrl",
                    controllerUrl: 'js/controllers/fee/studentDetail.js'
                })
                .state('tab.activity', { //活动
                    url: '/activity',
                    views: {
                        'tab-activity': {
                            templateUrl: "templates/activity/tab-activity.html",
                            controller: "activityCtrl",
                            controllerUrl: 'js/controllers/activity/activity.js'
                        }
                    }
                })
                .state('tab.user', { // 我的
                    url: '/user',
                    views: {
                        'tab-user': {
                            templateUrl: function() {
                                return "templates/user/tab-user.html";
                            },
                            controller: "userCtrl",
                            controllerUrl: 'js/controllers/user/user.js'
                        }
                    }
                })
                .state('indexClassify', { //首页分类
                    url: '/indexClassify/:classifyId',
                    templateUrl: function() {
                        return "templates/index/indexClassify.html";
                    },
                    controller: "indexClassifyCtrl",
                    controllerUrl: 'js/controllers/index/indexClassify.js'
                })
                .state('search', { //首页搜索
                    url: '/search',
                    templateUrl: function() {
                        return "templates/index/search.html";
                    },
                    controller: "searchCtrl",
                    controllerUrl: 'js/controllers/index/search.js'
                })
                .state('newPro', { //上新
                    url: '/newPro',
                    templateUrl: function() {
                        return "templates/index/newPro.html";
                    },
                    cache: false,
                    controller: "newProCtrl",
                    controllerUrl: 'js/controllers/index/newPro.js'
                })
                .state('indexProDetail', { //商品详情(首页)
                    url: '/indexProDetail/:goodId',
                    templateUrl: "templates/index/indexProDetail.html",
                    cache:'false',
                    controller: "indexProDetailCtrl",
                    controllerUrl: 'js/controllers/index/indexProDetail.js'
                })
                .state('userComments', { //用户评论
                    url: '/userComments/:goodId',
                    templateUrl: function() {
                        return "templates/index/userComments.html";
                    },
                    controller: "userCommentsCtrl",
                    controllerUrl: 'js/controllers/index/userComments.js'
                })
                .state('confirmOrder', { //确认订单
                    url: '/confirmOrder/:cartIds',
                    templateUrl: function() {
                        return "templates/userOrder/confirmOrder.html";
                    },
                    controller: "confirmOrderCtrl",
                    controllerUrl: 'js/controllers/index/confirmOrder.js'
                })
                .state('infoDetail', { //资讯详情 (nomain:为了统一分享链接为/share/)
                    url: '/infoDetail/:infoId/:isShare/:nomean',
                    templateUrl: function() {
                        return "templates/discover/infoDetail.html";
                    },
                    controllerUrl: 'js/controllers/discover/infoDetail.js',
                    controller: "infoDetailCtrl"
                })
                .state('reward', { //打赏
                    url: '/reward/:params',
                    templateUrl: function() {
                        return "templates/reward.html";
                    },
                    controllerUrl: 'js/controllers/reward.js',
                    controller: "rewardCtrl"
                })
                .state('goodsDetailShare',{
                    url:'/goodsDetailShare/:activity_id/:isShare/:params',
                    templateUrl:function(){
                        return "templates/yiyuan/goodsDetailShare.html";
                    },
                    controllerUrl: 'js/controllers/yiyuan/goodsDetailShare.js',
                    controller:"goodsDetailShareCtrl"
                })
                //个人中心
                .state('userInfo', { //个人信息
                    url: '/userInfo',
                    templateUrl: function() {
                        return "templates/user/userInfo.html";
                    },
                    controllerUrl: 'js/controllers/user/userInfo.js',
                    controller: "userInfoCtrl"
                })
                .state('setting', { //设置
                    url: '/setting',
                    templateUrl: function() {
                        return "templates/user/setting.html";
                    },
                    controllerUrl: 'js/controllers/user/setting.js',
                    controller: "settingCtrl"
                })
                .state('settingAbout', { //关于我们
                    url: '/settingAbout',
                    templateUrl: function() {
                        return "templates/user/settingAbout.html";
                    },
                    controllerUrl: 'js/controllers/user/settingAbout.js',
                    controller: "settingAboutCtrl"
                })
                .state('settingFeedback', { //用户反馈
                    url: '/settingFeedback',
                    templateUrl: function() {
                        return "templates/user/settingFeedback.html";
                    },
                    controllerUrl: 'js/controllers/user/settingFeedback.js',
                    controller: "settingFeedbackCtrl"
                })
                .state('settingHelp', { //使用帮助
                    url: '/settingHelp',
                    templateUrl: function() {
                        return "templates/user/settingHelp.html";
                    },
                    controllerUrl: 'js/controllers/user/settingHelp.js',
                    controller: "settingHelpCtrl"
                })
                .state('shareApp', { //分享应用给好友
                    url: '/shareApp',
                    templateUrl: function() {
                        return "templates/user/settinShare.html";
                    },
                    controllerUrl: 'js/controllers/user/settinShare.js',
                    controller: "settinShareCtrl"
                })
                .state('editName', { //编辑用户名
                    url: '/editName/:name',
                    templateUrl: function() {
                        return "templates/user/editName.html";
                    },
                    controllerUrl: 'js/controllers/user/editName.js',
                    controller: "editNameCtrl"
                })
                .state('editPhone', { //绑定手机
                    url: '/editPhone/:phone/:fromPage',
                    templateUrl: function() {
                        return "templates/user/editPhone.html";
                    },
                    controllerUrl: 'js/controllers/user/editPhone.js',
                    controller: "editPhoneCtrl"
                })
                .state('editPassword', { //修改密码
                    url: '/editPassword',
                    templateUrl: function() {
                        return "templates/user/editPassword.html";
                    },
                    controllerUrl: 'js/controllers/user/editPassword.js',
                    controller: "editPasswordCtrl"
                })
                .state('address', { //我的地址
                    url: '/address/:fromPage',
                    templateUrl: function() {
                        return "templates/user/address.html";
                    },
                    controllerUrl: 'js/controllers/user/address.js',
                    controller: "addressCtrl"
                })
                .state('addressNew', { //新增地址
                    url: '/addressNew',
                    templateUrl: function() {
                        return "templates/user/addressNew.html";
                    },
                    controllerUrl: 'js/controllers/user/addressNew.js',
                    controller: "addressNewCtrl"
                })
                .state('addressEdit', { //编辑地址
                    url: '/addressEdit',
                    templateUrl: function() {
                        return "templates/user/addressEdit.html";
                    },
                    controllerUrl: 'js/controllers/user/addressEdit.js',
                    controller: "addressEditCtrl"
                })
                .state('follow', { //我的关注
                    url: '/follow',
                    templateUrl: function() {
                        return "templates/user/follow.html";
                    },
                    controllerUrl: 'js/controllers/user/follow.js',
                    controller: "followCtrl"
                })
                .state('followDetail', { //查看用户
                    url: '/followDetail/:uid',
                    templateUrl: function() {
                        return "templates/user/followDetail.html";
                    },
                    controllerUrl: 'js/controllers/user/followDetail.js',
                    controller: "followDetailCtrl"
                })
                .state('orders', { //我的订单
                    url: '/orders',
                    templateUrl: "templates/userOrder/orders.html",
                    cache: false,
                    controllerUrl: 'js/controllers/userOrder/orders.js',
                    controller: "ordersCtrl"
                })
                .state('logistics', { //查看物流
                    url: '/logistics/:orderId',
                    templateUrl: function() {
                        return "templates/userOrder/logistics.html";
                    },
                    controllerUrl: 'js/controllers/userOrder/logistics.js',
                    controller: "logisticsCtrl"
                })
                .state('orderDetail', { //订单详情
                    url: '/orderDetail/:orderId',
                    templateUrl: function() {
                        return "templates/userOrder/orderDetail.html";
                    },
                    controllerUrl: 'js/controllers/userOrder/orderDetail.js',
                    controller: "orderDetailCtrl"
                })
                .state('orderComment', { //评价订单
                    url: '/orderComment/:orderId/:goodId',
                    templateUrl: function() {
                        return "templates/userOrder/orderComment.html";
                    },
                    controllerUrl: 'js/controllers/userOrder/orderComment.js',
                    controller: "orderCommentCtrl"
                })
                .state('moneyGo', { //钱款去向
                    url: '/moneyGo',
                    templateUrl: function() {
                        return "templates/userOrder/moneyGo.html";
                    }
                })
                .state('cusService', { //联系客服
                    url: '/cusService',
                    templateUrl: function() {
                        return "templates/userOrder/cusService.html";
                    }
                })
                .state('applyReturn', { //申请退货退款
                    url: '/applyReturn/:orderId/:totalPrice',
                    templateUrl: function() {
                        return "templates/userOrder/applyReturn.html";
                    },
                    controllerUrl: 'js/controllers/userOrder/applyReturn.js',
                    controller: "applyReturnCtrl"
                })
                .state('goodReturning', { //退货中
                    url: '/goodReturning/:orderId',
                    templateUrl: function() {
                        return "templates/userOrder/goodReturning.html";
                    },
                    controllerUrl: 'js/controllers/userOrder/goodReturning.js',
                    controller: "goodReturningCtrl"
                })
                .state('balance', { //余额
                    url: '/balance',
                    templateUrl: function() {
                        return "templates/userBalance/balance.html";
                    },
                    controllerUrl: 'js/controllers/userBalance/balance.js',
                    controller: "balanceCtrl"
                })
                .state('balanceCharge', { //余额充值
                    url: '/balanceCharge/:params',
                    templateUrl: function() {
                        return "templates/userBalance/charge.html";
                    },
                    controllerUrl: 'js/controllers/userBalance/charge.js',
                    controller: "chargeCtrl"
                })
                .state('balanceDetail', { //收支明细
                    url: '/balanceDetail/:type',
                    templateUrl: function() {
                        return "templates/userBalance/balanceDetail.html";
                    },
                    controllerUrl: 'js/controllers/userBalance/balanceDetail.js',
                    controller: "balanceDetailCtrl"
                })
                .state('balanceSetting', { //支付设置
                    url: '/balanceSetting/:purseStatus',
                    templateUrl: function() {
                        return "templates/userBalance/balanceSetting.html";
                    },
                    controllerUrl: 'js/controllers/userBalance/balanceSetting.js',
                    controller: "balanceSettingCtrl"
                })
                .state('balancePhoneCode', { //支付设置(发送手机验证码)
                    url: '/balancePhoneCode',
                    templateUrl: function() {
                        return "templates/userBalance/balancePhoneCode.html";
                    },
                    controllerUrl: 'js/controllers/userBalance/balancePhoneCode.js',
                    controller: "balancePhoneCodeCtrl"
                })
                .state('balancePassword', { //支付设置(修改支付密码)
                    url: '/balancePassword/:taskId',
                    templateUrl: function() {
                        return "templates/userBalance/balancePassword.html";
                    },
                    controllerUrl: 'js/controllers/userBalance/balancePassword.js',
                    controller: "balancePasswordCtrl"
                })
                .state('speak', { //我的发言
                    url: '/speak',
                    templateUrl: function() {
                        return "templates/user/speak.html";
                    },
                    controllerUrl: 'js/controllers/user/speak.js',
                    controller: "speakCtrl"
                })
                .state('coupon', { //我的券包
                    url: '/coupon',
                    templateUrl: function() {
                        return "templates/user/coupon.html";
                    },
                    controllerUrl: 'js/controllers/user/coupon.js',
                    controller: "couponCtrl"
                })
                .state('message', { //我的消息
                    url: '/message',
                    templateUrl: function() {
                        return "templates/user/message.html";
                    },
                    cache: false,
                    controllerUrl: 'js/controllers/user/message.js',
                    controller: "messageCtrl"
                })
                .state('messageDetail', { //消息详情
                    url: '/messageDetail/:messageId',
                    templateUrl: function() {
                        return "templates/user/messageDetail.html";
                    },
                    controllerUrl: 'js/controllers/user/messageDetail.js',
                    controller: "messageDetailCtrl"
                })
                .state('collection', { //我的收藏
                    url: '/collection',
                    templateUrl: function() {
                        return "templates/user/collection.html";
                    },
                    controllerUrl: 'js/controllers/user/collection.js',
                    controller: "collectionCtrl"
                })
                .state('repairCenter', { //维修中心
                    url: '/repairCenter',
                    templateUrl: function() {
                        return "templates/userRepair/repairCenter.html";
                    },
                    controllerUrl: 'js/controllers/userRepair/repairCenter.js',
                    controller: "repairCenterCtrl"
                })
                .state('repairClassify', { //维修分类列表
                    url: '/repairClassify',
                    templateUrl: function() {
                        return "templates/userRepair/repairClassify.html";
                    },
                    controllerUrl: "js/controllers/userRepair/repairClassify.js",
                    controller: "repairClassifyCtrl"
                })
                .state('brandChoose', { //品牌型号选择
                    url: '/brandChoose/:pid',
                    templateUrl: function() {
                        return "templates/userRepair/brandChoose.html";
                    },
                    controllerUrl: "js/controllers/userRepair/brandChoose.js",
                    controller: "brandChooseCtrl"
                })
                .state('serviceChoose', { //维修服务选择
                    url: '/serviceChoose/:phonePartsId',
                    templateUrl: function() {
                        return "templates/userRepair/serviceChoose.html";
                    },
                    controllerUrl: "js/controllers/userRepair/serviceChoose.js",
                    controller: "serviceChooseCtrl"
                })
                .state('repairOrder', { //维修订单信息
                    url: '/repairOrder/:lastId',
                    templateUrl: function() {
                        return "templates/userRepair/repairOrder.html";
                    },
                    controllerUrl: "js/controllers/userRepair/repairOrder.js",
                    controller: "repairOrderCtrl"
                })
            .state('repairApplies', { //我的维修申请
                    url: '/repairApplies',
                    templateUrl: function() {
                        return "templates/userRepair/repairApplies.html";
                    },
                    controllerUrl: "js/controllers/userRepair/repairApplies.js",
                    controller: "repairAppliesCtrl"
                })
                .state('repairStatus', { //维修状态
                    url: '/repairStatus/:orderId',
                    templateUrl: function() {
                        return "templates/userRepair/repairStatus.html";
                    },
                    controllerUrl: "js/controllers/userRepair/repairStatus.js",
                    controller: "repairStatusCtrl"
                })
                .state('repairPaySuccess', { //支付成功
                    url: '/repairPaySuccess',
                    templateUrl: function() {
                        return "templates/userRepair/repairPaySuccess.html";
                    }
                })
                .state('concatService', { //联系客服
                    url: '/concatService',
                    templateUrl: function() {
                        return "templates/userRepair/concatService.html";
                    },
                    controllerUrl: "js/controllers/userRepair/concatService.js",
                    controller: "concatServiceCtrl"
                })
                .state('payOrder', { //支付订单
                    url: '/payOrder/:params',
                    templateUrl: function() {
                        return "templates/payOrder.html";
                    },
                    controllerUrl: 'js/controllers/payOrder.js',
                    controller: "payOrderCtrl"
                })
                .state('paySuccess', { //支付成功
                    url: '/paySuccess/:orderId',
                    templateUrl: function() {
                        return "templates/paySuccess.html";
                    },
                    controllerUrl: "js/controllers/paySuccess.js",
                    controller: "paySuccessCtrl"
                })
                .state('myYiyuan', { //我的夺宝
                    url: '/myYiyuan',
                    templateUrl: function() {
                        return "templates/user/myYiyuan.html";
                    },
                })
                .state('myYiyuanRecord', { //夺宝记录
                    url: '/myYiyuanRecord',
                    templateUrl: function() {
                        return "templates/user/myYiyuanRecord.html";
                    },
                    controllerUrl: 'js/controllers/user/myYiyuanRecord.js',
                    controller: "myYiyuanRecordCtrl"
                })
                .state('myYiyuanPrize', { //中奖记录
                    url: '/myYiyuanPrize',
                    templateUrl: function() {
                        return "templates/user/myYiyuanPrize.html";
                    },
                    controllerUrl: 'js/controllers/user/myYiyuanPrize.js',
                    controller: "myYiyuanPrizeCtrl"
                })
                .state('myYiyuanMyShare', { //我的晒单
                    url: '/myYiyuanMyShare',
                    templateUrl: function() {
                        return "templates/user/myYiyuanMyShare.html";
                    },
                    controllerUrl: 'js/controllers/user/myYiyuanMyShare.js',
                    controller: "myYiyuanMyShareCtrl"
                })
                .state('myYiyuanShare', { //晒单分享
                    url: '/myYiyuanShare',
                    templateUrl: function() {
                        return "templates/user/myYiyuanShare.html";
                    },
                })


            .state('commentDetail', { //评论详情
                    url: '/commentDetail',
                    templateUrl: function() {
                        return "templates/commentDetail.html";
                    },
                    controllerUrl: 'js/controllers/commentDetail.js',
                    controller: "commentDetailCtrl"
                })
                .state('login', { //登录
                    url: '/login/:fromPage',
                    templateUrl: function() {
                        return "templates/login.html";
                    },
                    controllerUrl: 'js/controllers/login.js',
                    controller: "loginCtrl"
                })
                .state('register', { //注册
                    url: '/register/:fromPage',
                    templateUrl: function() {
                        return "templates/register.html";
                    },
                    controllerUrl: 'js/controllers/register.js',
                    controller: "registerCtrl"
                })
                .state('richText', { //用户协议&隐私政策
                    url: '/richText/:page',
                    templateUrl: function() {
                        return "templates/richText.html";
                    },
                    controllerUrl: 'js/controllers/richText.js',
                    controller: "richTextCtrl"
                })
                .state('forgetPass', { //忘记密码
                    url: '/forgetPass',
                    templateUrl: function() {
                        return "templates/forgetPass.html";
                    },
                    controllerUrl: 'js/controllers/forgetPass.js',
                    controller: "forgetPassCtrl"
                })
                .state('iframePage', { //显示外链专用页面
                    url: '/iframePage/:url',
                    templateUrl: function() {
                        return "templates/iframePage.html";
                    },
                    controllerUrl: 'js/controllers/iframePage.js',
                    controller: "iframePageCtrl"
                });

            $urlRouterProvider.otherwise("tab/index");

        });
    // 返迴路由參數，p父文件夾，s文件名，e路由擴展設置（json格式）可以覆蓋默認設置
    function stateJson(p, s, e) {
        var params = angular.extend({
            url: '/' + s,
            templateUrl: function() {
                return "templates/" + p + (p == '' ? '' : "/") + s + ".html";
            },
            controllerUrl: "js/controllers/" + p + (p == '' ? '' : "/") + s + ".js",
            controller: s + "Ctrl",
            cache: false
        }, e);
        console.log(params)
        return [s, params];
    }
})

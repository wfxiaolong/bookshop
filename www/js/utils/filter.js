// 过滤器，在bootstrap中一开始加载

define(['app'], function(app) {
    app
        .filter('getMedal', function() {
            //将等级转换成相应奖牌
            return function(level) {
                switch (Number(level)) {
                    case 1:
                        return 'copper';
                    case 2:
                        return 'silver';
                    case 3:
                        return 'gold';
                    default:
                        return 'copper';
                }
            }
        })
        .filter('orderState', function() {
            //订单状态转化
            return function(state) {
                switch (Number(state)) {
                    case 1:
                        return '待付款';
                    case 2:
                        return '待发货';
                    case 3:
                        return '待收货';
                    case 4:
                        return '待评价';
                    case 5:
                        return '已取消';
                    case 7:
                        return '交易成功';
                    case 8:
                        return '已关闭';
                    default:
                        return '';
                }
            }
        })
        .filter('dmDateFormat', function() {
            //将时间转换成多少分钟前，多少小时前的形式
            return function(date) {
                var dateNow = new Date();
                var fromNow = dateNow - date;
                var days = Math.floor(fromNow / (24 * 3600 * 1000));
                if (days >= 1) {
                    var dateTemp = new Date(date);
                    return [dateTemp.getFullYear(), dateTemp.getMonth() + 1, dateTemp.getDate()].join('-');
                }
                var hours = Math.floor(fromNow / (3600 * 1000));
                if (hours >= 1) {
                    return hours + '小时前';
                }
                var minutes = Math.floor(fromNow / (60 * 1000));
                if (minutes >= 1) {
                    return minutes + '分钟前';
                }
                return '刚刚';
            }
        })
        .filter('hidePhone', function() {
            //将电话中间4位隐藏
            return function(phone) {
                if (!phone || phone == '') return;
                return phone.replace(phone.substring(3, 7), '****');
            }
        })
        .filter('trustHtml', ['$sce', function($sce) {
            return function(html) {
                return $sce.trustAsHtml(html);
            };
        }])
        .filter('maxLike', function() {
            //点赞数大于10000时显示9999+
            return function(likes) {
                return Number(likes) >= 10000 ? '9999+' : likes;
            }
        })
        .filter('htmlFilter', function() {
            //过滤富文本中的标签空格等
            return function(html) {
                if (!html) {return};
                html = html.replace(/(\n)/g, "");
                html = html.replace(/(\t)/g, "");
                html = html.replace(/(\r)/g, "");
                html = html.replace(/<\/?[^>]*>/g, "");
                html = html.replace(/\s*/g, "");
                html = html.replace(/&nbsp;/ig, '');
                return html;
            }
        })
        .filter('totalPrice', function() {
            //根据商品数量以及单价得出总价格
            return function(info) {
                return Math.round(Number(info.price) * Number(info.num) * 100) / 100;
            }
        })
        .filter('getFloatTwo', function() {
            return function(float) {
                return Math.round(float * 100) / 100;
            }
        })
        .filter('totalPriceAll', function() {
            //根据购物车全部商品数量以及单价得出总价格
            return function(list) {
                var sum = 0;
                if (!list) return;
                for (var i = 0; i < list.length; i++) {
                    if (list[i].checked == true) {
                        sum += ((Number(list[i].price) * 100) * Number(list[i].quantity));
                    }
                }
                var value = sum / 100;
                var arr = value.toString().split(".");
                if (arr.length == 1) {
                    return value.toString() + ".00";
                }
                if (arr.length > 1) {
                    return arr[1].length < 2 ? value.toString() + "0" : value;
                }
            }
        });
});

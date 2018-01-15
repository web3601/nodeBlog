/**
 * Created by FO on 2018/1/13 013.
 */
var mongoose = require('mongoose');

//内容的表结构
module.exports = new mongoose.Schema({
    //关联字段
    category: {
        //类型
        type: mongoose.Schema.Types.ObjectId,
        //引用
        ref: 'Content'
    },
    //内容名称
    name: String,

    //简介
    description: {
        type: String,
        default: ""
    },

    //内容
    content: {
        type: String,
        default: ""
    }
});



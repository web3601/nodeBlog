/**
 * Created by FO on 2017/12/31 031.
 */
var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Category = require('../models/Category');
var Content = require('../models/Content');

router.use(function (req, res, next) {
    if (!req.userInfo.isAdmin) {
        res.send('对不起,只有管理员才可以进入该页面');
        return;
    }
    next()
});
//首页
router.get('/', function (req, res, next) {
    //res.send('后台用户中心')
    res.render('admin/index', {
        userInfo: req.userInfo
    })
});
//用户管理
router.get('/user', function (req, res) {

    var page = Number(req.query.page || 1);
    //var limit = Number(req.query.limit || 5);
    var limit = 5;
    var pages = 0;

    User.count().then(function (count) {
        pages = Math.ceil(count / limit);
        page = Math.min(page, pages);
        page = Math.max(page, 1);
        var skip = (page - 1) * limit;
        User.find().limit(limit).skip(skip).then(function (users) {
            res.render('admin/user_index', {
                userInfo: req.userInfo,
                users: users,
                limit: limit,
                pages: pages,
                count: count,
                page: page
            })
        })
    });

});

//分类首页
router.get('/category', function (req, res) {
    var page = Number(req.query.page || 1);
    //var limit = Number(req.query.limit || 5);
    var limit = 5;
    var pages = 0;

    Category.count().then(function (count) {
        pages = Math.ceil(count / limit);
        page = Math.min(page, pages);
        page = Math.max(page, 1);
        var skip = (page - 1) * limit;
        Category.find().sort({_id: -1}).limit(limit).skip(skip).then(function (categories) {
            res.render('admin/category', {
                userInfo: req.userInfo,
                categories: categories,
                limit: limit,
                pages: pages,
                count: count,
                page: page
            })
        })
    });
})
//分类的添加
router.get('/category/add', function (req, res) {
    res.render('admin/category_add', {
        userInfo: req.userInfo
    })
})
//分类的保存
router.post('/category/add', function (req, res) {
    var name = req.body.name || '';
    if (name == '') {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '名称不能为空'
        });
        return;
    }

    Category.findOne({
        name: name
    }).then(function (rs) {
        if (rs) {
            //如果数据库中已经存在该分类
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '分类已经存在了'
            })
            return Promise.reject();
        } else {
            return new Category({
                name: name
            }).save();
        }
    }).then(function (newCategory) {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '分类保存成功',
            url: '/admin/category'
        })
    })

})

/*
 * 分类的修改
 * */
router.get('/category/edit', function (req, res) {
    var id = req.query.id || '';
    Category.findOne({
        _id: id
    }).then(function (category) {
            if (!category) {
                res.render('admin/error', {
                    userInfo: req.userInfo,
                    message: "分类信息不存在"
                });
                return Promise.reject();
            } else {
                res.render("admin/category_edit", {
                    userInfo: req.userInfo,
                    category: category
                })
            }
        }
    )
})
/*
 * 分类的修改保存
 * */

router.post("/category/edit", function (req, res) {
    var id = req.query.id || '';
    var name = req.body.name || '';
    Category.findOne({
        _id: id
    }).then(function (category) {
            if (!category) {
                res.render('admin/error', {
                    userInfo: req.userInfo,
                    message: "分类信息不存在"
                });
                return Promise.reject();
            } else {
                if (name == category.name) {
                    res.render('admin/success', {
                        userInfo: req.userInfo,
                        message: "分类信息修改成功",
                        url: "/admin/category"
                    });
                    return Promise.reject();
                } else {
                    return Category.findOne({
                        _id: {$ne: id},
                        name: name
                    })
                }
            }
        }
    ).then(function (sameCategory) {
            if (sameCategory) {
                res.render('admin/error', {
                    userInfo: req.userInfo,
                    message: "数据库中已经存在同名分类",
                    url: "/admin/category"
                });
                return Promise.reject();
            } else {
                return Category.update({
                    _id: id
                }, {
                    name: name
                })
            }
        }).then(function () {
            res.render('admin/success', {
                userInfo: req.userInfo,
                message: "修改成功",
                url: "/admin/category"
            });
        })

})

/*
 * 分类的删除
 * */
router.get("/category/delete", function (req, res) {
    var id = req.query.id || '';
    Category.remove({
        _id: id
    }).then(function () {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: "删除成功",
            url: "/admin/category"
        });
    })
})

/*
 * 内容首页
 * */
router.get('/content', function (req, res) {
    var page = Number(req.query.page || 1);
    var limit = 5;
    var pages = 0;

    Content.count().then(function (count) {
        pages = Math.ceil(count / limit);
        page = Math.min(page, pages);
        page = Math.max(page, 1);
        var skip = (page - 1) * limit;
        Content.find().sort({_id: -1}).limit(limit).skip(skip).populate(['category','user']).sort({addTime:-1}).then(function (contents) {
            //console.log(contents)

            res.render('admin/content', {
                userInfo: req.userInfo,
                contents: contents,
                limit: limit,
                pages: pages,
                count: count,
                page: page
            })
        })
    });
})
/*
 * 内容添加页面
 * */
router.get('/content/add', function (req, res) {
    Category.find().sort({_id: -1}).then(function (categories) {
        res.render('admin/content_add', {
            userInfo: req.userInfo,
            categories: categories
        })
    })

})
/*
 * 内容保存页面
 * */
router.post('/content/add', function (req, res) {
    //console.log(req.body)
    if (req.body.category == '') {
        res.render("admin/error", {
            userInfo: req.userInfo,
            message: '分类内容不能为空'
        })
        return;
    }
    if (req.body.title == '') {
        res.render("admin/error", {
            userInfo: req.userInfo,
            message: '分类标题不能为空'
        })
        return;
    }

    //保存数据到数据库
    new Content({
        category: req.body.category,
        title: req.body.title,
        user: req.userInfo._id.toString(),
        description: req.body.description,
        content: req.body.content
    }).save().then(function (rs) {
            res.render("admin/success", {
                userInfo: req.userInfo,
                message: '内容保存成功',
                url: '/admin/content'
            })
        })

})

/*
 * 内容修改
 * */
router.get('/content_edit', function (req, res) {

    var id = req.query.id || '';
    var categories = [];
    Category.find().sort({_id: -1}).then(function (rs) {
        categories = rs;
        return Content.findOne({
            _id: id
        }).populate('category')
    }).then(function (content) {
        if (!content) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '内容不存在'
            })
            return Promise.reject();
        } else {
            res.render('admin/content_edit', {
                userInfo: req.userInfo,
                content: content,
                categories: categories
            })
        }
    })
})

/*
 * 内容保存
 * */
router.post('/content_edit',function(req,res){
    var id = req.query.id || '';
    if (req.body.category == '') {
        res.render("admin/error", {
            userInfo: req.userInfo,
            message: '内容分类不能为空'
        })
        return;
    }
    if (req.body.title == '') {
        res.render("admin/error", {
            userInfo: req.userInfo,
            message: '内容标题不能为空'
        })
        return;
    }

    Content.update({
        _id: id
    },{
        category: req.body.category,
        title: req.body.title,
        description: req.body.description,
        content: req.body.content
    }).then(function(){
        res.render('admin/success',{
            userInfo: req.userInfo,
            message: '内容保存成功',
            url:'/admin/content_edit?id='+ id
        })
    })
})

/*
* 内容删除
* */
router.get('/content_delete',function(req,res){
    var id = req.query.id || '';
    Content.remove({
        _id: id
    }).then(function () {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: "删除成功",
            url: "/admin/content"
        });
    })
})

module.exports = router;




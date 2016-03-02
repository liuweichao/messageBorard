var express = require('express');
var User = require('../models/user');
var Comment = require('../models/comment');


module.exports = function(app){
  //pre handle user
  app.use(function(req,res,next){
    app.locals.user = req.session.user;
    next();
  });


  /* GET home page. */
  app.get('/', function(req, res, next) {
    //判断是否是第一页，并把请求的页数转换成 number 类型
    var page = req.query.p ? parseInt(req.query.p) : 1;
    Comment.fetchPage(page,function (err, comments) {
      if(err){
        req.flash('error', err);
        console.log(err)
      }
      var total;
      Comment.fetchCount(function(err,count){
        total= count;
        //console.log(req.flash('success').toString());
        res.render('index', {
          title: 'alex留言板',
          comments:comments,
          isFirstPage: (page - 1) == 0,
          isLastPage: ((page - 1) * 10 + comments.length) == total,
          page:page,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        });
      });

    });

  });

  //注册
  app.post('/user/signup', function (req, res, next) {
    var _user = req.body.user;
    User.findOne({name:_user.name},function(err,user){
      if(err){
        console.log(err)
      }
      if(user){
        req.flash('error','该用户以存在');
        res.redirect('/');
      }else{
        var user = new User(_user);
        user.save(function(err,user){
          if(err){
            req.flash('error', err);
            console.log(err);
          }
          req.flash('success','注册成功,请登录');
          res.redirect('/');

        })
      }
    })
  });

  //登录
  app.post('/user/signin',function(req,res){
    var _user = req.body.user;
    var name = _user.name;
    var password = _user.password;

    User.findOne({name:name},function(err,user){
      if(err){
        req.flash('error', err);
        console.log(err)
      }
      if(!user){
        req.flash('error', '用户名不存在');
        return res.redirect('/')
      }
      user.comparePassword(password,function(err,isMatch){
        if(err){
          req.flash('error', err);
          console.log(err)
        }
        if(isMatch){
          req.session.user = user;
          req.flash('success', '登录成功');
          return res.redirect('/');
        }else{
          req.flash('error', '用户名密码输入错误');
          res.redirect('/');
        }
      })
    })
  });

  //退出
  app.get('/logout',function(req,res){
    delete req.session.user;
    //delete app.locals.user
    req.flash('success', '退出成功');
    res.redirect('/')
  });

  app.post('/comment', function (req,res) {
    var _comment = req.body.comment;
    var _user = req.session.user;

    if(_user && _comment) {
      var comment = new Comment(_comment);
      comment.save(function (err) {
        if (err) {
          req.flash('error', err);
          console.log(err)
        }
        req.flash('success', '评论成功');
        res.redirect('/');
      })
    }else{
      res.redirect('/');
    }
  });
};

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var Comment = new mongoose.Schema({
    from:String,
    content:String,
    meta:{
        createAt:{
            type:Date,
            default:Date.now()
        },
        updateAt:{
            type:Date,
            default:Date.now()
        }
    }
});

Comment.pre('save',function(next){
    if(this.isNew){
        this.meta.createAt = this.meta.updateAt = Date.now()
    }else{
        this.meta.updateAt = Date.now()
    }
    next()
});

Comment.statics = {
    fetchPage:function(page,cb){
        return this
            .find()
            .skip((page - 1)*10)
            .limit(10)
            .sort({
                'meta.updateAt':-1
            })
            .exec(cb)
    },
    findeById:function(id,cb){
        return this
            .findOne({_id:id})
            .exec(cb)
    },
    fetchCount:function(cb){
        return this
            .count()
            .exec(cb);
    }
};

module.exports = Comment;
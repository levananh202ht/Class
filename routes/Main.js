//Models
var User = require("../models/User");
var Token = require("../models/Token");

var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const secretString = "*(79123abjfjk012jdO*Y@*ODHljashdho9a28yd82ohd";

module.exports = function(app){

    app.post("/register", function(req, res){
        if(!req.body.username || !req.body.password || !req.body.email){
            res.json({result:0, message:"Lack of parameters"});
        }else{
            // check username/email
            var un = req.body.username.trim();
            var em = req.body.email.trim();
            var pw = req.body.password;
            if(un.length<=5 || em.length<=5 || pw.length<=5){
                res.json({result:0, message:"Wrong parameters"});
            }else{
                User.find({$or:[{username:un}, {email:em}]}, function(err, users){
                    if(err || users.length>0){
                        res.json({result:0, message:"Username/email is not availble"});
                    }else{
                        bcrypt.genSalt(10, function(err, salt) {
                            bcrypt.hash(pw, salt, function(err, hash) {
                                if(err){
                                    res.json({result:0, message:"Hash password error"});
                                }else{
                                    var newUser = new User({
                                        username:un,
                                        password:hash,

                                        email:em,
                                        email_active:false,   // true da acitve, false chua active

                                        type:0, //  0 Client, 1 Administrator

                                        status:1,      // 1 active, 0 block

                                        dateCreated:Date.now(),

                                        currentPoint:0,
                                        point_deposit_blockchain:0, // tien user da nap
                                        point_deposit_bank:0, // tien user da nap
                                        point_withdraw_blockchain:0,
                                        point_withdraw_bank:0,

                                        bet_volume:0, //    tong tien da cuoc
                                        bet_win:0,
                                        bet_lose:0
                                    });
                                    newUser.save(function(e){
                                        if(e){
                                            res.json({result:0, message:"Save user error"});
                                        }else{
                                            res.json({result:1, message:"User has been registered successfully."});
                                        }
                                    });
                                }
                            });
                        });
                    }
                });
            }
        }
    });

    app.post("/login", function(req, res){
        if(!req.body.username || !req.body.password){
            res.json({result:0, message:"Lack of parameters"});
        }else{
            // check username/email
            var un = req.body.username.trim();
            var pw = req.body.password;
   
            User.findOne({username:un}, function(err, user){
                if(err){
                    res.json({result:0, message:"User info error"});
                }else{
                    if(user==null){ 
                        res.json({result:0, message:"Username is not availble"});
                    }else{
                        bcrypt.compare(pw, user.password, function(err, res2) {
                            if(err || res2===false){
                                res.json({result:0, message:"Wrong password"});
                            }else{
                                
                                user.password = "***";
                                jwt.sign({data:user}, secretString, { expiresIn: '72h' }, function(err2, token){
                                    if(err2){
                                        console.log(err2);
                                        res.json({result:0, message:"Token created error"});
                                    }else{
                                        var newToken = new Token({
                                            token:token,
                                            idUser:user._id, 
                                            dateCreated:Date.now(),
                                            status:true
                                        });
                                        newToken.save(function(e3){
                                            if(e3){
                                                res.json({result:0, message:"Token saved error"});
                                            }else{
                                                res.json({result:1, token:token});
                                            }
                                        });
                                    }
                                });

                            }
                        });
                    }
                }
            });
            
        }
    });

    app.post("/verifyToken", function(req, res){
        if(!req.body.token){
            res.json({result:0, message:"Lack of parameters"});
        }else{
            Token.findOne({token:req.body.token, status:true}, function(e, token){
                if(e || token==null){
                    res.json({result:0, message:"Token is not exist"});
                }else{
                    jwt.verify(req.body.token, secretString, function(err, decoded) {
                        if(err || decoded==undefined){
                            res.json({result:0, message:"Token is invalid"});
                        }else{
                            res.json({result:1, userInfo:decoded});
                        }
                    });
                }
            });
        }
    });

    app.post("/logout", function(req, res){
        if(!req.body.token){
            res.json({result:0, message:"Lack of parameters"});
        }else{
            Token.findOne({token:req.body.token.trim(), status:true}, function(e, token){
                if(e || token==null){
                    res.json({result:0, message:"Token is not exist"});
                }else{
                    Token.findOneAndUpdate({
                        token:req.body.token.trim(),
                    },{status: false, dateLogout:Date.now()}, function(e){
                        if(e){
                            res.json({result:0, message:"Logout error!"});
                        }else{
                            res.json({result:1, message:"Logout Successfully"});
                        }
                    })
                }
            });
        }
    });

}
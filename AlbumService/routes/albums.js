var cors = require('cors');
var express = require('express'); 
var cookieParser = require('cookie-parser');
var router = express.Router();
var fs = require('file-system');
var S = require('string');
const stream = require('stream');
const multer = require('multer');
const path = require('path');
module.exports = router;

router.use(cookieParser());

router.use(function(req, res, next) {
  res.header('Content-Type', 'application/json;charset=UTF-8')
  res.header('Access-Control-Allow-Credentials', true)
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  next()
})

const corsOptions = {
  origin: 'http://localhost:3000',    // reqexp will match all prefixes
  methods: "GET,HEAD,POST,PATCH,DELETE,OPTIONS,PUT",
  credentials: true,                // required to pass
  allowedHeaders: "Content-Type, Authorization, X-Requested-With",
}

/*
 * POST to login.
 */
router.post('/login', cors(corsOptions), function(req, res) {
  var db = req.db;
  var collection = db.get('userList');
  collection.find({"username": req.body.username, "password": req.body.password}, {}, function(err, docs){
    if (err === null){
      if(docs.length === 0){
        res.send({msg: "Login Failure"});
      }
      else{
        res.cookie("userId", docs[0]._id, { maxAge:3600000})
        var temp = docs[0].friends;
        var friends_ = "";
        var output = [];
        collection.find({"username":{$in: temp}}, {_id:1, username:1}, function(err, docs){
          friends_ = docs;
          for(var i=0; i<friends_.length; i++){
            output.push([friends_[i]._id, friends_[i].username]);
          }
          res.json(output);
        });
      }
    }
    else res.send({msg: "Login Failure"});
  });
});

/*
* GET to init.
*/
router.get('/init', cors(corsOptions), function(req, res) { 
  const checkCookie = req.cookies['userId'];
  var db = req.db;
  var collection = db.get('userList'); 
  if(!checkCookie){
    res.send({msg: ""});
  }
  if(checkCookie){
    collection.find({"_id":req.cookies['userId']},{'_id':0},function(err,docs){
    if (err === null){
      var temp = docs[0].friends;
      var friends_ = "";
      var output = [];
      output.push(docs[0].username)
      collection.find({"username":{$in: temp}}, {_id:1, username:1}, function(err, docs){
        friends_ = docs;
        for(var i=0; i<friends_.length; i++){
          output.push([friends_[i]._id, friends_[i].username]);
        }
        res.json(output);
      });
    }
    else res.send({msg: err});
    }); 
  }
});

/*
* GET to logout
*/
router.get('/logout', cors(corsOptions), function(req, res){
  res.clearCookie('userId');
  res.send({msg: ""});
})

/*
* GET to getalbum
*/
router.get('/getalbum/:userid', cors(corsOptions), function(req, res){
  var db = req.db;
  var collection = db.get('photoList')
  if(req.params.userid === "0"){
    collection.find({"userid": req.cookies['userId']},{},function(err, docs){
      if (err === null){
        var temp = docs;
        var output = []
        for(var i = 0; i<temp.length; i++){
          output.push([temp[i]._id, temp[i].url, temp[i].likedby])
        }
        res.json(output);
      }
      else res.send({msg: err});
    })
  }
  else{
    collection.find({"userid": req.params.userid},{},function(err, docs){
      if (err === null){
        var temp = docs;
        var output = []
        for(var i = 0; i<temp.length; i++){
          output.push([temp[i]._id, temp[i].url, temp[i].likedby])
        }
        res.json(output);
      }
      else res.send({msg: err});
    })
  }
})

/*
* PUT to updatelike
*/
router.put('/updatelike/:photoid', cors(corsOptions), function(req, res){
  var db = req.db;
  var collection1 = db.get('userList')
  var collection2 = db.get('photoList')
  var username = "";
  collection1.find({'_id': req.cookies['userId']}, {}, function(err, docs){
    username = docs[0].username;
    if(err === null){
      collection2.update({'_id': req.params.photoid},{$addToSet: {"likedby": username}}, function(err, result){
        if(err===null){
          collection2.find({'_id':req.params.photoid}, {}, function(err, docs){
            if(err===null){
              res.json(docs[0].likedby)
            }
            else{
              res.send({msg: err})
            }
          })
        }
        else{
          res.send({msg:err})
        }
      })
    }
    else{
      res.send({msg: err})
    }
  })

})

/*
* DELETE to deletephoto
*/
router.delete('/deletephoto/:photoid', cors(corsOptions), function(req, res){
  var db = req.db;
  var collection = db.get('photoList');
  var url = '';
  collection.find({'_id':req.params.photoid}, {}, function(err,docs){
    if(err===null){
      url=docs[0].url;
      var photolocation ='./public/'+S(url).chompLeft('http://localhost:3002/').s
      fs.unlink(photolocation, (err)=>{
        if(err) throw err;
      })
      collection.remove({'_id':req.params.photoid}, {}, function(err, docs){
        if(err===null){
          res.send({msg:''})
        }
        else{
          res.send({msg: err})
        }
      })
    }
    else{
      res.send({msg:err})
    }
  })
})

const storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: function(req, file, cb){
     cb(null,Math.random() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits:{fileSize: 1000000},
}).single("image");

/*
*POST to uploadphoto
*/
router.post('/uploadphoto', cors(corsOptions), function(req, res){
  var db = req.db;
  var collection = db.get('photoList');
  var userid = req.cookies['userId'];
  var empty = [];
  upload(req, res, (err) => {
    var filename = req.file.filename;
    var output = []
    collection.insert({"url":"http://localhost:3002/uploads/"+filename, "userid":userid, "likedby":empty},{}, function(err, result){
      if(err===null){
        collection.find({'url': "http://localhost:3002/uploads/"+filename}, {}, function(err, docs){
          if(err===null){
            output.push([docs[0]._id, docs[0].url])
            res.send(output)
          }
          else{
            res.send({msg: err})
          }
        })
      }
      else{
        res.send({msg: err})
      }
    })
 });
})


/*
 * Handle preflighted request
 */
router.options('*', cors(corsOptions))
// router.options("/*", cors());

router.withCredentials = true;
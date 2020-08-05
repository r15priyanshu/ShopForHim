const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const passportLocalMongoose = require("passport-local-mongoose");
const bcrypt = require('bcrypt');
var flash = require('connect-flash');
const multer=require("multer");
const path=require("path");
const fs=require("fs");
var ObjectID=require("mongodb").ObjectID;



const app=express();
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({  extended: true}));



//initializing session before database connection
app.use(session({
  secret: "There is no any secret",
  resave: false,
  saveUninitialized: false
}));

//initialising passport
app.use(passport.initialize());

//passport to use session
app.use(passport.session());

//setting flash after session
app.use(flash());

// Global Vars
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});



//multer setting for image upload for server !! not for client (only to upload products to the product collection)
var storage=multer.diskStorage({
  destination:function(req,file,cb){
    cb(null,"./public/uploads/shopforhim");
  },
  filename:function(req,file,cb){
    cb(null,file.fieldname+'-'+ Date.now() + path.extname(file.originalname));
  }
});

var upload=multer({
  storage:storage,
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files are allowed!'));
    }
    cb(null, true);
  }
}).single("myimage");


//mongoose connection
mongoose.connect("mongodb://localhost:27017/ShopForMenDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(function(){
  console.log("database connected");
});

//creating user schema
const userSchema = new mongoose.Schema({
  fname: String,
  lname: String,
  username: String,
  uniqueusername:String,
  password: String,
  mobile: String,
  address:String,
  cart:[{
    product_id:String,
    selected_size:String
  }],
  purchased:[{
    product_unique_id:String,
    person_fullname:String,
    person_delivery_address:String,
    person_mobile:String,
    person_email:String,
    person_selected_size:String,
    ordered_by_account:String,
    cancelled:Number,
    price:Number
  }]
});

//creating product schema
const productSchema = new mongoose.Schema({
  brand: String,
  title: String,
  price: Number,
  category:String,
  size:String,
  description:String,
  image:String
});

//creating order schema
const orderSchema = new mongoose.Schema({
  product_id:String,
  person_fullname:String,
  person_delivery_address:String,
  person_mobile:String,
  person_email:String,
  person_selected_size:String,
  ordered_by_account:String,
  cancelled:Number
});


//setting up passportLocalMongoose
userSchema.plugin(passportLocalMongoose);

//user model
const User = new mongoose.model("User",userSchema);

//product model
const Product=new mongoose.model("Product",productSchema);

//orders model
const Order=new mongoose.model("Order",orderSchema);

//CREATING LOCAL createStrategy
var localStrategy = require("passport-local").Strategy;
passport.use(new localStrategy(
  function(username, password, done) {
    User.findOne({
      username: username
    }, function(err, foundData) {
      if (err) {
        return done(err);
      }
      if (!foundData) {
        return done(null, false,{message:"User doesnot exists"}); //data not found so authentication is not successfull so null,false
      }
      bcrypt.compare(password,foundData.password,function(err,match){
        if(err){
          return done(null,false);
        }
        if(!match){
          return done(null,false,{message:"Password incorrect"});
        }
        if(match){
          return done(null,foundData);
        }
      });
    });
  }
));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



//gte route for Signup page
app.get("/home/signup",function(request,response){
  response.render("signup");
})

//post request for SignUp page
app.post("/home/signup", function(req, res) {
  var err;
  var username = req.body.username;
  var fname = req.body.fname;
  var lname = req.body.lname;
  var password = req.body.password;
  var uniqueusername=req.body.uniqueusername;
  //validation check
  if (!username || !fname || !lname || !password || !uniqueusername ) {
    err = "please enter all details!";
    console.log("enter all details");
    res.render("signup", {
      err: err
    });
  }
  if (typeof err == "undefined") {
    User.findOne({
      username: req.body.username
    }, function(error, foundData) {
      if (error) console.log(error);
      if (foundData) {

        User.findOne({
          uniqueusername: req.body.uniqueusername
        }, function(error, foundData) {
          if (error) console.log(error);
          if (foundData) {

            console.log("username taken");
            req.flash("error_msg","User name taken ! please provide unique Username.");
            res.redirect("/home/SignUp");
          }
          else{
            console.log("user already exists");
            req.flash("error_msg","user already exists");
            res.redirect("/home/signup");
          }

        });
              }
              else {
        bcrypt.hash(req.body.password, 10, function(err, hash) {
          // Store hash in your password DB.
          if (err) throw err;
          password = hash;
          const user = new User({
            username: req.body.username,
            password: password,
            fname: req.body.fname,
            lname: req.body.lname,
            uniqueusername:req.body.uniqueusername
          });
          user.save(function(err, data) {
            if (err) throw err;
            else{
              req.flash("success_msg","Registered successfully... Login to continue");
              res.redirect("/home/login");
            }
          });
        });
      }
    });
  }
});

//routing login page
app.get("/home/login",function(request,response){
  response.render("login");
});

//post request for login
app.post('/home/login',
  passport.authenticate('local', { failureRedirect: '/home/login' ,failureFlash:true}),
  function(req, res) {
    //onsuccessfull login
    res.redirect("/profile");
  });


//logout
app.get("/home/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

//routing home page
app.get("/",function(req,res){
  res.render("home",{user:req.user});
});


//get route for products homepage
app.get("/products",function(req,res){
      Product.find({},function(err,foundData){
      if(err) console.log(err);
      if(foundData){
          res.render("products",{products:foundData,user:req.user});
      }else{
        console.log("no products available");
      }
    });
});


//post request for showing products by category
  app.post("/category",function(req,res){
    if(req.body.category=="all"){
      Product.find({},function(err,foundData){
        if(err) console.log(err);
        if(foundData){
            res.render("products",{products:foundData,user:req.user});
        }else{
            res.redirect("/products");
        }

      });
    }
    else{

      Product.find({category:req.body.category},function(err,foundData){
        if(err) console.log(err);
        if(foundData){
          res.render("products",{products:foundData,user:req.user});
        }else{
          res.redirect("/products");
        }
      });
    }
  });

//profile section
app.get("/profile",function(req,res){
    if(req.isAuthenticated())
    {
      //here i am extracting the all the items in the cart field of database (it contains the _id , producti id and selected size)
      //now using that product id i will fetch all data from the product database and store it in cartItems array to send it to front end for displaying purpose
      //created separate object for each product which also contains _id(primary key) of cart field of user database
      //this unique id will help to remove a particular cart item from the cart list
      var cartItems=[];
      var sum=0;
      if(req.user.cart.length>=1){
          //display cart items only if item is present in the cart
                for(let eachItems of req.user.cart)
                {
                Product.findOne({_id:eachItems.product_id},function(err,foundData){
                    if(err) throw err;
                    else{
                      sum=sum+foundData.price;
                      var obj={
                        cart_item_id:eachItems._id,
                        product_id:foundData._id,
                        brand:foundData.brand,
                        title:foundData.title,
                        price:foundData.price,
                        image:foundData.image,
                        selected_size:eachItems.selected_size
                      };
                      cartItems.push(obj);
                    }
                  });
                }
          setTimeout(function(){res.render("profile",{user:req.user,cartItems:cartItems,sum:sum})},1500);
        }
        else{
          //initially when user login for first time there willnot be any item in cart
          setTimeout(function(){res.render("profile",{user:req.user})},500);
        }
    }
    else
    {
        res.redirect("/home/login");
    }
});

//handling post request for updating user Profile
app.post("/profile/updateProfile", function(req, res){
  User.updateOne({
    username: req.user.username
  }, {
    fname: req.body.fname,
    lname: req.body.lname,
    mobile:req.body.mobile,
    address:req.body.address,

  }, function(err) {
    if (err)
      console.log(err);
    else {
      console.log("profile updated by "+req.user.username);
      res.redirect("/profile");
    }

  });
});


//post route for handling add to cart feature
app.post("/products/addToCart/:productId",function(req,res){

  if(req.isAuthenticated()){
    //first of all find the product from the products table and then grab its _id field and store it in cart option of user details
    var product_id=req.params.productId;
    Product.find({_id:product_id},function(err,foundData){
      if(err) console.log(err);
      else{
        User.updateOne({uniqueusername:req.user.uniqueusername},{$push:{cart:{product_id:product_id,selected_size:req.body.Selected_Size}}},function(err){
          if(err) throw err;
          else{
                req.flash("success_msg","Item added to cart successfully.");
                res.redirect("/products");
            }
        });
      }
    });
  }else{
    req.flash("error_msg","Please Login First !!");
    res.redirect("/home/login");
  }
});


//removing items from the cart
app.post("/products/removeFromCart/:cart_item_id",function(req,res){
    User.updateOne({uniqueusername:req.user.uniqueusername},{$pull:{cart:{_id:req.params.cart_item_id}}},function(err){
      if(err) throw err;
      else{
        req.flash("success_msg","One Item Successfully Removed From Cart ");
        res.redirect("/profile");
      }
    });
});


//post route for CheckOut
app.get("/profile/checkout",function(req,res){
  if(req.isAuthenticated())
  {
    //here i am extracting the all the items in the cart field of database (it contains the _id , producti id and selected size)
    //now using that product id i will fetch all data from the product database and store it in cartItems array to send it to front end for displaying purpose
    //created separate new javascript object for each product which also contains _id(primary key) of cart field of user database,
    //this unique id will help to remove a particular cart item from the cart list
    var cartItems=[];
    var sum=0;
      if(req.user.cart.length>=1){
              for(let eachItems of req.user.cart)
              {
              Product.findOne({_id:eachItems.product_id},function(err,foundData){
                  if(err) throw err;
                  else{
                    sum=sum+foundData.price;
                    var obj={
                      cart_item_id:eachItems._id,
                      product_id:foundData._id,
                      brand:foundData.brand,
                      title:foundData.title,
                      price:foundData.price,
                      image:foundData.image,
                      selected_size:eachItems.selected_size
                    };
                    cartItems.push(obj);
                  }
                });
              }
            setTimeout(function(){res.render("checkout",{user:req.user,cartItems:cartItems,sum:sum})},1500);
        }else{
              res.render("checkout",{user:req.user});
        }

  }else{
    res.redirect("/home/login");
  }

});


//handling post route for placing orders
app.post("/profile/placeOrder",function(req,res){
  if(req.isAuthenticated()){

        for(let eachItems of req.user.cart)
       {
                const newOrder=new Order({
                  product_id:eachItems.product_id,
                  person_fullname:req.body.fullname,
                  person_delivery_address:req.body.address,
                  person_mobile:req.body.mobile,
                  person_email:req.body.email,
                  person_selected_size:eachItems.selected_size,
                  ordered_by_account:req.user.username,
                  cancelled:Number("0"),
                  price:eachItems.price
                });

                newOrder.save().then(function(){
                    User.updateOne({username:req.user.username},{$pull:{cart:{_id:eachItems._id}}},function(err){
                      if(err) throw err;
                      else{
                        console.log("one item ordered Successfully");
                      }
                    });
                });
       }
       setTimeout(function(){
         req.flash("success_msg","order placed successfully");
         res.redirect("/profile/myOrders");
       },1500);
  }
  else{
      res.redirect("/home/login");
  }
});


//get route for displaying all orders
app.get("/profile/myOrders",function(req,res){
  if(req.isAuthenticated())
  {
      Order.find({ordered_by_account:req.user.username},function(err,foundData){
      if (err) throw err;

      if(foundData){
          for(let eachItems of foundData){

            var purchased=[];
            Product.findOne({_id:eachItems.product_id},function(err,Data){
                if(err) throw err;
                if(Data){
                  var obj={
                    order_id:eachItems._id,
                    brand:Data.brand,
                    title:Data.title,
                    price:Data.price,
                    image:Data.image,
                    description:Data.description,
                    person_fullname:eachItems.person_fullname,
                    person_delivery_address:eachItems.person_delivery_address,
                    person_mobile:eachItems.person_mobile,
                    person_email:eachItems.person_email,
                    person_selected_size:eachItems.person_selected_size,
                    cancelled:eachItems.cancelled
                  };
                  purchased.push(obj);
                }else{
                  console.log("no products found");
                }
              });
          }
          setTimeout(function(){res.render("myorders",{user:req.user,purchased:purchased})},2000);
      }
      else{
        res.render("myorders",{user:req.user});
      }
    });
  }
  else
  {
      res.redirect("/home/login");
  }
});

//post route for cancelling the order
app.post("/profile/myOrders/cancelOrder/:order_id",function(req,res){
    Order.updateOne({_id:req.params.order_id},{cancelled:Number("1")},function(err){
      if(err) throw err;
      else{
        console.log("one order cancelled Successfully");
        res.redirect("/profile/myOrders");
      }
    });
});















//add clothes route
app.get("/add",function(req,res){
  res.render("add");
});

//post request to add products to the products collection
app.post("/add",function(req,res){
  upload(req,res,function(err){
    if(err) {
        req.flash("error_msg",'Only image files are allowed!');
        res.redirect("/home");
    }
    else{
        const newproduct = new Product({
        brand:req.body.brand,
        title:req.body.title,
        description:req.body.description,
        category:req.body.category,
        price:req.body.price,
        size:req.body.size,
        image:req.file.filename,
      });
        newproduct.save();
        req.flash("success_msg",'Product added successfully!');
        res.redirect("/add");
      }
    });
});

app.use("/",function(req,res){
  res.send("<h1>ERROR 404!! Page Not Found !!</h1>")
});

//server
app.listen(3000,function(){
  console.log("server started in development mode on port 3000");
});

const express=require('express');
const morgan=require('morgan');
const bodyParser=require('body-parser');
const cors=require('cors');
require('dotenv').config();
const{check,validationResult}=require('express-validator');
const { matchedData, sanitize }   = require('express-validator');
var port=process.env.port;
const bcrypt=require('bcryptjs');

//const UserController=require('./controllers/user.js');
const User=require('./models/user');
require('./database_connect.js');

var app=express();
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public')); 
app.use(bodyParser.urlencoded({ 
    extended: true
}));

app.get('/',function(req,res){
	res.set({
		'Access-Control-Allow-Origin' : '*'
	});
	return res.redirect('index.html');
}).listen(3000);

app.post('/signup',[
    check('email').isEmail().withMessage('Please enter a valid email address').normalizeEmail(),
    check('password').not().isEmpty().isLength({ min: 8 }).
    withMessage('Password must be at least 5 chars long').
    trim().escape().
    custom((value,{req, loc, path}) => {
        if (value !== req.body.confirm) {
            // throw error if passwords do not match
            throw new Error("Passwords don't match");
        } else {
            return value;
        }
    }),
    check('confirm').not().isEmpty().trim().escape()
],function(req,res){
    const errors=validationResult(req);
    if(!errors.isEmpty())
    {
        return res.status(422).json({
            Status:false,
            message:'Form Validation Error',
            errors:errors.array()
        });
    }
    var hashedPassword=bcrypt.hashSync(req.body.password,10);
    var temp=new User({
        email:req.body.email,
        password:hashedPassword
    });
        temp.save(function(error,result){
            if(error)
            {
                return res.json({
                    status:false,
                    message:'Not inserted successfully',
                    error:error
                })
            }
            return res.json({
                status:true,
                message:'Inserted successfully',
                error:error
            })
        })
});



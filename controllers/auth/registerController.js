import Joi from "joi";
import { RefreshToken, User } from "../../models";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import bcrypt from "bcrypt";
import JwtService from "../../services/JwtService";
import { REFRESH_SECRET } from "../../config";

const registerController =  {

    async register(req, res, next){

        //validation - Schema

        const registerSchema = Joi.object({

                name : Joi.string().min(3).max(30).required(),
                email : Joi.string().email().required(),
                password : Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
                repeat_password : Joi.ref('password'),

        });


        //validating
        const {error} = registerSchema.validate(req.body, { abortEarly: false });

        if(error){
            return next(error);
        }

        //check if user is present in databse
        try{
            const exist = await User.exists({ email: req.body.email });

            if(exist){

                return next( CustomErrorHandler.alreadyExist('User already exists'));

            }

        }catch( error){

            return next(error);

        }



        //bcrypting the password
        const { name, email, password } = req.body

        const hashedPassword = await bcrypt.hash(password, 10);
        

        const user = new User( {
            name,
            email,
            password: hashedPassword
        })
        

        let access_token;
        let refresh_token;

        try{
            const result = await user.save();

            //Token
            access_token = JwtService.sign({ _id: result._id, role : result.role });
            refresh_token = JwtService.sign({ _id: result._id, role : result.role }, '1y', REFRESH_SECRET);

            //saving refrsh token
            await RefreshToken.create({ token: refresh_token });
        
        
        }catch(error){

            return next(error);
        }

        res.json({access_token, refresh_token});
    
    },   


};



export default registerController;
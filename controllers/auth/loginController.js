import Joi from "joi";
import { RefreshToken, User } from "../../models";
import bcrypt from "bcrypt";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import JwtService from "../../services/JwtService";
import { REFRESH_SECRET } from "../../config";

const loginController = {
  async login(req, res, next) {
    const loginSchema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string()
        .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
        .required(),
    });

    const { error } = loginSchema.validate(req.body);

    if (error) {
      return next(error);
    }

    try {
      const user = await User.findOne({ email: req.body.email });

      if (!user) {
        return next(CustomErrorHandler.wrongCredentials());
      }

      //comparing password;
      const match = await bcrypt.compare(req.body.password, user.password);

      if (!match) {
        return next(CustomErrorHandler.wrongCredentials());
      }

      //token
      const access_token = JwtService.sign({ _id: user._id, role: user.role });

      const refresh_token = JwtService.sign(
        { _id: user._id, role: user.role },
        "1y",
        REFRESH_SECRET
      );

      //saving refrsh token
      await RefreshToken.create({ token: refresh_token });

      return res.json({ access_token, refresh_token });
    } catch (err) {
      return next(err);
    }
  },

  async logout(req, res, next) {
    const logoutSchema = Joi.object({
      refresh_token: Joi.string().required(),
    });

    const { error } = logoutSchema.validate(req.body);

    if (error) {
      return next(error);
    }

    try {
      await RefreshToken.deleteOne({ token: req.body.refresh_token });
    } catch (error) {
      return next(new Error("Something went wrong"));
    }

    res.json({ status: 1 });
  },
};

export default loginController;

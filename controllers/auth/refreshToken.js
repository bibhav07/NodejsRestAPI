import Joi from "joi";
import { REFRESH_SECRET } from "../../config";
import { RefreshToken, User } from "../../models";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import JwtService from "../../services/JwtService";

const refreshToken = {
  async refresh(req, res, next) {
    const refreshToken = Joi.object({
      token: Joi.string().required(),
    });

    const { error } = refreshToken.validate(req.body);
    if (error) {
      return next(error);
    }

    let checkToken;

    try {
      const checkToken = await RefreshToken.findOne({ token: req.body.token });

      if (!checkToken) {
        return next(CustomErrorHandler.unAuthorized("Invalid refresh token"));
      }

      let userId;
      try {
        const { _id } = await JwtService.verify(
          checkToken.token,
          REFRESH_SECRET
        );

        userId = _id;
      } catch (error) {
        return next(CustomErrorHandler.unAuthorized("Invalid refresh token"));
      }

      const user = User.findOne({ _id: userId });
      if (!user) {
        return next(CustomErrorHandler.unAuthorized("No user found"));
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
    } catch (error) {
      return next(new Error("Something went wrong"));
    }
  },
};

export default refreshToken;

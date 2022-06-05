import Joi from "joi";
import { Product } from "../../models";
import multer from "multer";
import path from "path";
import fs from "fs";
import CustomErrorHandler from "../../services/CustomErrorHandler";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    //uniqueName will be somethinng like this = 646546-76567.png
    cb(null, uniqueName);
  },
});

const handleMultipartData = multer({
  storage,
  limits: { fileSize: 1000000 * 5 },
}).single("image"); //5mb limit and it's a single image and file name is image

const productController = {
  async store(req, res, next) {
    handleMultipartData(req, res, async (err) => {
      if (err) {
        return next(new Error(err.message));
      }

      console.log(req.file);
      const filepath = req.file.path;

      //validating
      const productSchema = Joi.object({
        name: Joi.string().required(),
        price: Joi.number().required(),
      });

      const { error } = productSchema.validate(req.body);

      if (error) {
        //if we are getting an error we well delete the uploaded image
        fs.unlink(`${appRoot}/${filepath}`, (error) => {
          if (error) {
            return next(error);
          }
        });

        return next(error);
      }

      const { name, price } = req.body;
      let document;

      try {
        document = await Product.create({
          name,
          price,
          image: filepath,
        });
      } catch (error) {
        return next(error);
      }

      res.status(201).json(document);
    });
  },

  async update(req, res, next) {
    handleMultipartData(req, res, async (err) => {
      if (err) {
        return next(new Error(err.message));
      }

      let filepath;
      if (req.file) {
        //   console.log(req.file);
        filepath = req.file.path;
      }

      //validating
      const productSchema = Joi.object({
        name: Joi.string().required(),
        price: Joi.number().required(),
      });

      const { error } = productSchema.validate(req.body);

      if (error) {
        //if we are getting an error we well delete the uploaded image
        if (req.file) {
          fs.unlink(`${appRoot}/${filepath}`, (error) => {
            if (error) {
              return next(error);
            }
          });
        }

        return next(error);
      }

      const { name, price } = req.body;
      let document;

      try {
        document = await Product.findOneAndUpdate(
          { _id: req.params.id },
          {
            name,
            price,
            ...(req.file && { image: filepath }),
          },
          { new: true }
        );
      } catch (error) {
        return next(error);
      }

      res.status(201).json(document);
    });
  },

  async delete(req, res, next) {
    try {
      const document = await Product.findOneAndRemove({ _id: req.params.id });

      if (!document) {
        return next(new Error("Nothing to delete"));
      }

      //deleting the image
      const imagePath = document._doc.image;

      fs.unlink(`${appRoot}/${imagePath}`, (err) => {
        if (err) {
          return next(CustomErrorHandler.serverError());
        }
      });

      res.json(document);
    } catch (error) {
      return next(CustomErrorHandler.serverError());
    }
  },

  async index(req, res, next) {
    try {
      const allproducts = await Product.find({})
        .select("-updatedAt -__v")
        .sort({ _id: -1 });

      res.json(allproducts);
    } catch (error) {
      return next(CustomErrorHandler.serverError());
    }
  },

  async show(req, res, next) {
    try {
      const singleProduct = await Product.findById({
        _id: req.params.id,
      }).select("-__v -updatedAt");
      res.json(singleProduct);
    } catch (error) {
      return next(CustomErrorHandler.serverError());
    }
  },
};

export default productController;

// auth.js

import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const checkUser = async (req, res, next) => {
  const token = req.cookies.jwt;

  try {
    if (token) {
      jwt.verify(token, process.env.SECRET_TOKEN, async (err, decodedToken) => {
        if (err) {
          console.log(err.message);
          res.locals.user = null;
          next();
        } else {
          const user = await User.findById(decodedToken.userId);
          res.locals.user = user;

          if (req.originalUrl === '/' && User) {
            // Check if the user is authenticated before redirecting
            res.redirect('/users/dashboard');
          } else {
            next();
          }
        }
      });
    } else {
      res.locals.user = null;

      // Kullanıcı giriş yapmamışsa ve isteği index sayfasıysa, direkt olarak dashboard sayfasına yönlendir
      if (req.originalUrl === '/' && !User) {
        // Check if the user is not authenticated before redirecting
        next();
      } else {
        next();
      }
    }
  } catch (error) {
    console.error('Error in checkUser middleware:', error);
    next(error);
  }
};
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (token) {
      jwt.verify(token, process.env.SECRET_TOKEN, (err) => {
        if (err) {
          console.log(err.message);
          res.redirect("/login");
        } else {
          next();
        }
      });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    res.status(401).json({
      succeeded: false,
      error: "Not authorized"
    });
  }
};

export { authenticateToken, checkUser };
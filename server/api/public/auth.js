const express = require('express');
const router = express.Router();
const User = require('../../models/userModel');
// const recaptcha = require('express-recaptcha');
// const allowSignUp = require('middlewares').allowSignUp;
// const mailer = require('mailer').mailer;
const _ = require('lodash');
const validator = require('validator');

router.post('/users/login', postLogin);
// router.post('/users/register', [recaptcha.middleware.verify, allowSignUp], postRegister);
router.post('/users/register', postRegister);

module.exports = {
  addRouter(app) {
    app.use('/api/public', router);
  },
};

async function postLogin(req, res, next) {
  if ( req.session && req.session.login ) {
    if (req.session.username === req.body.username) {
      return res.status(200).json({
        status: 200,
        message: 'Already logged in.',
        data: {
          token: req.session.username,
        },
      });
    }
    return next({
      status: 400,
      message: 'Someone else is already logged in.',
    });
  }

  const username = req.body.username;
  const password = req.body.password;

  try {
    const user = await User.findOne({
        username,
      }).exec();

    if (!user) {
      return next({
        status: 400,
        message: 'User not found.',
      });
    }

    if (await user.comparePassword(password)) {
      req.session.login = true;
      req.session.emailVerified = user.emailVerified;
      if (!user.emailVerified) req.session.emailVerificationValue = user.emailVerificationValue;
      req.session.email = user.email;
      req.session.roles = user.roles;
      req.session.username = user.username;
      req.session.userId = user._id;

      return res.status(200).json({
        status: 200,
        message: 'Successfully logged in',
        data: {
          token: req.session.username,
        },
      });
    } else {
      return next({
        status: 400,
        message: 'Password did not match',
      });
    }
  } catch (err) {
    return next(err);
  }
}

async function postRegister(req, res, next) {
  // if (req.recaptcha.error) {
  //   return next({
  //     status: 400,
  //     message: 'Recaptcha validation failed',
  //   });
  // }

  // TODO: Validate user input

  const username = req.body.username;
  const usernameRegex = /^[A-Za-z_0-9.]+$/g;
  if ( !usernameRegex.test(username) ) {
    return next({
      status: 400,
      message: `INVALIDPARAM Username: ${username} failed regex ${usernameRegex}.`,
    });
  }

  if (validator.isEmail(req.body.email) === false) {
    return next({
      status: 400,
      message: `INVALIDPARAM Email: ${email} is invalid.`,
    });
  }

  const email = User.normalizeEmail(req.body.email);
  if (req.body.password.length < 6) {
    return next({
      status: 400,
      message: `INVALIDPARAM Password length is less than 6.`,
    });
  }
  const password = await User.createHash(req.body.password);


  const user = new User({
    username: username,
    email,
    password,
    emailVerificationValue: _.random(100000, 999999),
    roles: ['user'],
  });

  try {
    await user.save();
  } catch (err) {
    if (err.code === 11000) {
      return next({
        status: 400,
        message: `${err.message.includes('email')?'Email address': 'Username'} already exists`,
        error: err,
      });
    } else {
      return next({
        status: 500,
        message: `An error occured while creating user. Error code: ${err.code}`,
        error: err,
      });
    }
  }

  return res.status(201).json({
     status: 201,
     message: 'Successfully Registered. Try logging in.',
   });

  // try {
  //   await sendEmailVerification(user.email, user.emailVerificationValue);
  //   return res.status(201).json({
  //     status: 201,
  //     message: 'Successfully Registered. Email verification code sent.',
  //   });
  // } catch (err) {
  //   return next({
  //     status: 500,
  //     message: 'An error occured while sending verification code',
  //   });
  // }
}

// async function sendEmailVerification(emailAddress, emailVerificationValue) {
//   const email = {
//     to: [emailAddress],
//     from: 'CPPS BACS <no-reply@bacsbd.org>',
//     subject: 'Verfication Code for CPPS',
//     text: `Here is your verification code: ${emailVerificationValue}`,
//     html: `Here is your verification code: <b>${emailVerificationValue}</b>`,
//   };
//   return mailer.sendMail(email);
// }

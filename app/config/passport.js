const LocalStrategy = require('passport-local').Strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy
const User = require('../models/user')
const bcrypt = require('bcrypt')

const init = (passport) => {

    passport.use(new LocalStrategy({
        usernameField: 'email'
    },
    async (email, password, done) => {
        try {
            const user = await User.findOne({ email: email })

            if (!user) {
                return done(null, false, { message: 'User does not exist' })
            } else {
                const match = await bcrypt.compare(password, user.password);

                if (!match) {
                    return done(null, false, { message: 'wrong username or password' })
                } else {
                    return done(null, user, { message: 'Logged in successfully!'})
                }
            }

        } catch (error) {

            console.log(error);
            return done(null, false, { message: 'Something went wrong!'})   
        }

    }))

    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/user/auth/google/callback"
      },
    
      (accessToken, refreshToken, profile, cb) => {
        User.findOne(
          {
            email: profile._json.email,
          },
          (err, user) => {
            if (err) {
              return cb(err);
            }
            if (user) {
              return cb(err,user);
            }
    
            const newUser = new User({
                    name: profile.name.givenName,
                    email: profile._json.email,
                    google_id: profile.id
                  });
            // saving new user in DB
            newUser.save(function (err, result) {
              if (err) {
                console.log(err);
                return cb(err);
              } else {
                return cb(null, newUser);
              }
            });
          }
        );
      }
    ))

    passport.serializeUser((user, done) => {
        done(null, user.id)
    })

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user)
        })
    })
}

module.exports = init
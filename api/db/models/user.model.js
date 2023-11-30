const mongoose = require('mongoose');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { resolve } = require('path');

// JWT serets

const jwtSecret = "21306455972087175717sajhfasuoieulkwm";

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    sessions: [{
        token: {
            type: String,
            required: true
        },
        expiresAt: {
            type: Number,
            required: true
        }
    }]
});


// Instance method

UserSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    // return doc expect password and sessios (these will keep as secret)

    return _.omit(userObject, ['password', 'sessions']);
}

UserSchema.methods.generateAccessAuthToken = function () {
    const user = this;
    return new Promise((resolve, reject) => {
        // Create the JSON Web Token and return that
        jwt.sign({ _id: user._id.toHexString() }, jwtSecret, { expiresIn: "15m" }, (err, token) => {
            if (!err) {
                resolve(token);
            } else {
                // there is an error and have to reject
                reject();
            }
        })
    }
    );
}

UserSchema.methods.generateRefreshAuthToken = function () {
    // This method generates a 64bytes hex string , It will not save it to data base , saveSessionToDatabase() will do that stuff.


    return new Promise((resolve, reject) => {
        crypto.randomBytes(64, (err, buf) => {
            if (!err) {
                // no error
                let token = buf.toString('hex');

                return resolve(token);
            }
            else {
                reject();
            }
        })
    })

}

UserSchema.methods.createSession = function () {
    let user = this;

    return user.generateRefreshAuthToken().then((refreshToken) => {
        return saveSessionToDatabase(user, refreshToken);
    }).then((refreshToken) => {
        //  saved to database successfully
        // now return the refresh token 
        return refreshToken;
    }).catch((e) => {
        return Promise.reject('Failed to save the session to database.\n' + e);
    })
}

// Model methods (static methods)

UserSchema.static.findByIdAndToken = function (_id, token) {
    // finds user by id and token
    // used in auth middleware (verifySession)

    const User = this;
    return User.findOne({
        _id,
        'session.token': token
    })
}

UserSchema.statics.findByCredentials = function (email, password) {
    let User = this;
    return User.findOne({ email }).then((user) => {
        if (!user) {
            return Promise.reject();
        } else {
            return new Promise((resolve, reject) => {
                bcrypt.compare(password, user.password, (err, res) => {
                    if (res) {
                        resolve(user);

                    } else {
                        reject();
                    }
                })
            })
        }
    })

}

UserSchema.static.hasRefreshTokenExpire = (expiresAt) => {
    let secondsSinceEpoch = Date.now() / 1000;
    if (expiresAt > secondsSinceEpoch) {
        // hasn't expired yet
        return false;
    }
    else {
        // has expired
        return true;
    }
}

// Middleware
// Before a user document is saved , this code runs
UserSchema.pre('save', function (next) {
    let user = this;
    let costFactor = 10;
    if (user.isModified('password')) {
        // if the password field edited/changed then run this code 

        // Generate salt and hash password
        bcrypt.genSalt(costFactor, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            })
        })
    } else {
        next();
    }
});

// Helper methods

let saveSessionToDatabase = (user, refreshToken) => {
    // Save session to database
    return new Promise((resolve, reject) => {
        let expiresAt = generateRefreshTokenExpiryTime();

        user.sessions.push({ 'token': refreshToken, expiresAt });
        user.save().then(() => {
            // saved session successfully
            return resolve(refreshToken);
        }).catch((e) => {
            reject(e);
        });
    });
}

let generateRefreshTokenExpiryTime = () => {
    let daysUntilExpire = "10";
    let secondsUntilExpire = ((daysUntilExpire * 24) * 60) * 60;
    return ((Date.now() / 1000) + secondsUntilExpire);
}

const User = mongoose.model('User', UserSchema);

module.exports = { User }
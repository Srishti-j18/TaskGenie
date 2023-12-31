const express = require('express');
const app = express();

const { mongoose } = require('./db/mongoose');
const bodyParser = require('body-parser');

// Load in the mongoose models
const { List, Task, User } = require('./db/models');

const jwt = require('jsonwebtoken');

// MIDDLEWARE

//Load middleware
app.use(bodyParser.json());

// CORS HEADERS MIDDLEWARE
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "YOUR-DOMAIN.TLD");
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token, x-refresh-token, _id");

    res.header(
        'Access-Control-Expose-Headers',
        'x-access-token, x-refresh-token'
    );
    next();
});

// check whether the request has a valid JWT access token
let authenticate = (req, res, next) => {
    let token = req.header('x-access-token');

    // verify JWT
    jwt.verify(token, User.getJWTSecret(), (err, decoded) => {
        if (err) {
            // there was an error 
            // jwt is invalid *DO NOT AUTHENTICATE*
            res.status(401).send(err);
        } else {
            // jwt is valid
            req.user_id = decoded._id;
            next();
        }
    });
}


// Verify Refresh Token Middleware (which will be verifying the session)
let verifySession = (req, res, next) => {
    // grab the refresh token from the request header
    let refreshToken = req.header('x-refresh-token');

    // grab the id from req header
    let _id = req.header('_id');

    User.findByIdAndToken(_id, refreshToken).then((user) => {
        if (!user) {
            // user not exist
            return Promise.reject({
                'error': 'User not found .Make sure that the refresh token and user id are correct'
            });
        }

        // if user found then session is valid , then the refresh token exists in database but we still have to check if it expired or not

        req.user_id = user._id;
        req.userObject = user;
        req.refreshToken = refreshToken;


        let isSessionValid = false;

        user.sessions.forEach((session) => {
            if (session.token === refreshToken) {
                // if session expire
                if (User.hasRefreshTokenExpire(session.expiresAt) === false) {
                    // refresh token hasn't expire
                    isSessionValid = true;

                }
            }
        });
        if (isSessionValid) {
            // if the session valid - call next() to continue with the processing this web request
            next();
        } else {
            // session is not valid
            return Promise.reject({
                'error': 'Refresh Token is expired or the session is invalid'
            });
        }
    }).catch((e) => {
        res.status(401).send(e);
    });
};


// END MIDDLEWARE


// Root Handlers

// list Routes
// Get list
// Propose : Get all lists


app.get('/lists', authenticate, (req, res) => {
    // We want to return an array of all the lists that belongs to the authenticated users
    List.find({
        _userId: req.user_id
    }).then((lists) => {
        res.send(lists);
    }).catch((e) => {
        res.send(e);
    })
});

// Post /lists
// Purpose: Create a list
app.post('/lists', authenticate, (req, res) => {
    // We want to create a new list and return the new list document back (which includes the Id)
    // The list information (fields) will be passed in via the JSON request body
    let title = req.body.title;

    let newList = new List({
        title,
        _userId: req.user_id
    });
    newList.save().then((listDoc) => {
        // the full list document is returned (incl. id)
        res.send(listDoc);
    })
});

// Patch /lists/:id
// Purpose: Update a specific list
app.patch('/lists/:id', authenticate, (req, res) => {
    // We want to update the specific list (list document with id in the URL) with the new values specified in the JSON body
    List.findOneAndUpdate({
        _id: req.params.id,
        _userId: req.user_id

    },
        {

            $set: req.body
        }
    ).then(() => {
        res.send({ 'message': 'updated successfully' });
    });
});



// Post /lists/:id
// Purpose:  delete a specified list
app.delete('/lists/:id', authenticate, (req, res) => {
    // We want to delete the specified list (document with id in the URL) 
    List.findOneAndDelete({
        _id: req.params.id,
        _userId: req.user_id
    }).then((removedListDoc) => {
        res.send(removedListDoc);

        // delete all the tasks that are in the deleted list
        deleteTasksFromList(removedListDoc._id);
    });
});

// GET /lists/:listId/tasks
// Purpose: Get all tasks in a specific list
app.get('/lists/:listId/tasks', authenticate, (req, res) => {
    // we want to return all tasks that belongs to specific list (specified by listId)
    Task.find({
        _listId: req.params.listId
    }).then((tasks) => {
        res.send(tasks);
    })
})

app.get('/lists/:listId/tasks/:taskId', (req, res) => {
    Task.findOne({
        _id: req.params.taskId,
        _listId: req.params.listId
    }).then((task) => {
        res.send(task);
    })

})

// POST /lists/:listId/tasks
// Purpose: Create a new task in a specific list
app.post('/lists/:listId/tasks', authenticate, (req, res) => {
    // we want create a new task that belongs to specific list (specified by listId)

    List.findOne({
        _id: req.params.listId,
        _userId: req.user_id
    }).then((list) => {
        if (list) {
            // list object is valid
            // therefore user can create the task
            return true;
        }
        return false;
    }).then((canCreateTask) => {
        if (canCreateTask) {
            let newTask = new Task({
                title: req.body.title,
                _listId: req.params.listId
            });
            newTask.save().then((newTaskDoc) => {
                res.send(newTaskDoc);
            })
        } else {
            res.sendStatus(404);
        }
    })



})

// PATCH /lists/:listId/tasks/:taskId
// Purpose : Update an existing task

app.patch('/lists/:listId/tasks/:taskId', authenticate, (req, res) => {
    // We want to update an existing task (specified by taskId)

    List.findOne({
        _id: req.params.listId,
        _userId: req.user_id
    }).then((list) => {
        if (list) {
            // list object is valid
            // therefore user can make updates
            return true;
        }
        return false;
    }).then((canUpdateTasks) => {
        if (canUpdateTasks) {
            // the current authenticated user can update tasks\
            Task.findOneAndUpdate({
                _id: req.params.taskId,
                _listId: req.params.listId
            }, {
                $set: req.body
            }).then(() => {
                res.send({ message: 'Updated successfully.' });
            });
        } else {
            res.sendStatus(404);
        }
    })


});

// Post /lists/:listId/tasks/:taskId
// Purpose:  delete a task
app.delete('/lists/:listId/tasks/:taskId', authenticate, (req, res) => {
    // We want to delete a task

    List.findOne({
        _id: req.params.listId,
        _userId: req.user_id
    }).then((list) => {
        if (list) {
            // list object is valid
            // therefore user can make updates
            return true;
        }
        return false;
    }).then((canDeleteTasks) => {
        if (canDeleteTasks) {
            Task.findOneAndDelete({
                _id: req.params.taskId,
                _listId: req.params.listId
            }).then((removedTaskDoc) => {
                res.send(removedTaskDoc);
            });
        } else {
            res.sendStatus(404);
        }
    });


});

// User roots

// Post/ users
// purpose: Sign Up 

app.post('/users', (req, res) => {
    // User sign up

    let body = req.body;
    let newUser = new User(body);

    newUser.save().then(() => {
        return newUser.createSession();
    }).then((refreshToken) => {
        // Session created -refreshToken returned
        // now we generate an access auth token for the user

        return newUser.generateAccessAuthToken().then((accessToken) => {
            // access auth token generated successfully , 
            // now we can return an object containing auth token

            return { accessToken, refreshToken };
        });
    }).then((authTokens) => {
        // Now we construct and send the response to the user with their auth tokens
        res
            .header('x-refresh-token', authTokens.refreshToken)
            .header('x-access-token', authTokens.accessToken)
            .send(newUser);
    }).catch((e) => {
        res.status(400).send(e);
    })
});

// Post/ users/login
// purpose: Login Up 

app.post('/users/login', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    User.findByCredentials(email, password).then((user) => {
        return user.createSession().then((refreshToken) => {
            // Session created -refreshToken returned
            // now we generate an access auth token for the user

            return user.generateAccessAuthToken().then((accessToken) => {
                // access auth token generated successfully , 
                // now we can return an object containing auth token

                return { accessToken, refreshToken };
            });
        }).then((authTokens) => {
            // Now we construct and send the response to the user with their auth tokens
            res
                .header('x-refresh-token', authTokens.refreshToken)
                .header('x-access-token', authTokens.accessToken)
                .send(user);
        })
    }).catch((e) => {
        res.status(400).send(e);
    });
});

// GET /users/me/access-token
// Purpose: generates and return an access token

app.get('/users/me/access-token', verifySession, (req, res) => {
    // we know that the user/caller is authenticated, we have user_id and user

    req.userObject.generateAccessAuthToken().then((accessToken) => {
        res.header('x-access-token', accessToken).send({ accessToken });
    }).catch((e) => {
        res.status(400).send(e);
    })

})

// Helper Method
let deleteTasksFromList = (_listId) => {
    Task.deleteMany({
        _listId
    }).then(() => {
        console.log("Tasks from" + _listId + "were deleted");
    })
}

app.listen(3000, () => {
    console.log("Server is listening on port 3000");
})
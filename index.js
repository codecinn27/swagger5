const express = require('express')
const app = express()
const port = process.env.PORT || 3000;
const mongoose = require('mongoose');
const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require('swagger-jsdoc');

const Visit = require('./model/visit');
const User = require('./model/user');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const JWT_SECRET = 'hahaha';


app.use(express.json())

const options = {
    definition:{
        openapi: "3.0.3",
        info:{
            title: "Visitor Management System BERR G6",
            version: "0.1",
            description:"Visitor Management System with admin, host, visitors. A system to issue visitors pass and store the record into the cloud database, Mongodb Atlas.",
            contact:{
                name: "Hee Yee Cinn",
                url:"cinn.com",
                email:"b022110115@student.utem.edu.my"
            },

        },
        tags:[
            {name: 'Test', description: "testing"},
            {name:'Login', description:"Default endpoints"},
            {name: 'Admin', description:"Admin operation"},
            {name: 'Host', description:"Host operation"},
        ],
        components:{
            securitySchemes:{
                Authorization:{
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    value: "Bearer <JWT token here>",
                    description: "This is for authentication, you must logout to change the JWT token"
                }
            }
        },

    },
    //all the route.js file store inside the route file 
    apis:["./index.js"],
};
const spacs = swaggerJSDoc(options);
app.use("/g6", swaggerUi.serve, swaggerUi.setup(spacs));

mongoose.connect('mongodb+srv://codecinnpro:9qLtJIAG9k8G1Pe8@cluster0.egrjwh1.mongodb.net/vms_2?')
.then(()=>{
    console.log('connected to mongodb');
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
     })
}).catch((error)=>{
    console.log(error);
})

/**
 * @swagger
 * /:
 *  get:
 *      summary: This api is for testing
 *      description: This api is used for testing
 *      tags:
 *        - Test
 *      responses:
 *          200:
 *              description: to test get api
 */
app.get('/', (req, res) => {
    res.send('Hello World!')
 })
 

/**
* @swagger
* /login:
*   post:
*     summary: Login for admin or host
*     description: Authenticate a user and generate a JWT token
*     tags: 
*       - Login
*     requestBody:
*       required: true
*       content: 
*         application/json:
*           schema:
*             type: object
*             properties:
*               username:
*                 type: string
*               password:
*                 type: string
*     responses:
*       200:   
*         description: Successful login
*         content:
*           application/json:
*             schema: 
*               type: object    
*               properties:
*                 username: 
*                   type: string
*                   description: Username
*                 message:
*                   type: string
*                   description: Success message
*                 token: 
*                   type: string
*                   description: JWT token for authentication
*                 category: 
*                   type: string
*                   description: User category (host or admin)
*                 redirectLink:
*                   type: string
*                   description: Redirect link based on user category
*       401:
*         description: Unauthorized - Wrong password
*         content:
*           text/plain:
*             schema:
*               type: string
*               example: Unauthorized Wrong password
*       404:
*         description: Username not found
*         content:
*           text/plain:
*             schema:
*               type: string
*               example: Username not found
*       409:
*         description: User is already logged in
*         content:
*           text/plain:
*             schema:
*               type: string
*               example: User is already logged in
*       500: 
*         description: Internal Server Error
*         content:
*           application/json:
*             schema: 
*               type: object
*               properties: 
*                 error:
*                   type: string
*                   description: Error message
*                   example: Internal Server Error
*/


app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
      const user = await User.findOne({ username});
      if (user == null) {
        res.status(404).send('Username not found');
      } else {
        if (user.login_status == true) {
          res.status(409).send('User is already logged in');
        } else {
          const c = await bcrypt.compare(password, user.password);
          if (!c) {
            res.status(401).send('Unauthorized: Wrong password');
          } else {
            await User.updateOne({ username}, { $set: { login_status: true } });
            const login_user = await User.findOne({username});
            const access_token = jwt.sign(
              { userId: login_user._id, username: login_user.username, category: login_user.category },
              JWT_SECRET
            );
            res.json({
              username: login_user.username,
              message: 'Login successful',
              accesstoken: access_token,
              _id: user._id,
              redirectLink: `/${login_user.category}/${login_user._id}`,
            });
          }
        }
      }
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: error.message });
    }
  });
  


/**
* @swagger
* /admin/visits:
*   get:
*     summary: Get all visits data 
*     description: Retrieve all visit data 
*     tags: 
*       - Admin
*     responses:
*       200:
*         description: Successful operation
*         content:
*           application/json:
*             schema:
*               type: array
*               items:
*                 $ref: '#/components/schemas/Visit'
*       401:
*         description: Unauthorized - Invalid or missing token
*       403:
*         description: Forbidden - Insufficient permissions
*       500:
*         description: Internal Server Error
*/

app.get('/admin/visits',async(req,res)=>{
    try {
        const allVisits = await Visit.find({});
        res.send(allVisits);
    } catch (error) {
        console.error('Error fetching visits:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }  
});




/**
 * @swagger
 * components:
 *   schemas:
 *     Visit:
 *       type: object
 *       required:
 *         - purposeOfVisit
 *         - phoneNumber
 *       properties:
 *         purposeOfVisit:
 *           type: string
 *           description: The purpose of the visit
 *         visitTime:
 *           type: string
 *           format: date-time
 *           description: The time of the visit
 *       example:
 *         purposeOfVisit: Meeting
 *
 *     Visitor:
 *       type: object
 *       required:
 *         - name
 *         - phoneNumber
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the visitor
 *         phoneNumber:
 *           type: number
 *           description: Phone number of the visitor
 *         visits:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Visit'
 *       example:
 *         name: John Doe
 *         phoneNumber: 1234567890
 *         visits:
 *           - purposeOfVisit: Meeting
 *             visitTime: '2023-01-01T12:00:00Z'
 *
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - password
 *         - email
 *         - phoneNumber
 *         - category
 *       properties:
 *         username:
 *           type: string
 *           description: The username of the user
 *         password:
 *           type: string
 *           description: The password of the user
 *         email:
 *           type: string
 *           format: email
 *           description: The email address of the user
 *         phoneNumber:
 *           type: number
 *           description: The phone number of the user
 *         category:
 *           type: string
 *           enum:
 *             - host
 *             - admin
 *           description: The category of the user (host or admin)
 *         visitors:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Visitor'
 *       example:
 *         username: user123
 *         password: password123
 *         email: user@exa\mple.com
 *         phoneNumber: 1234567890
 *         category: host
 *         visitors:
 *           - name: John Doe
 *             visits:
 *               - purposeOfVisit: Meeting
 *                 phoneNumber: 1234567890
 *                 visitTime: '2023-01-01T12:00:00Z'
 */




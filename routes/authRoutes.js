const express = require('express');
const router = express.Router();
const authController= require('../controllers/authControllers');
const verifySignUp = require('../middlewares/verifySignUp');
const { methods } = require('express/lib/utils');

// Importarcion de verificacio
let verifyToken;

try{
    const authJwt= require('../middlewares/authJwt');
    verifyToken = authJwt.verifyToken;
    console.log('[AuthRoutes] verifyToken importando  correctamente :',typeof verifyToken);
}catch(error){
    console.error('[AuthRoutes] ERROR al importar verifyToken',error);
    throw error;
}


// Middleware de  diagnostico
router.use((req,res,next)=>{
console.log('\n[AuthRoutes] Peticion recibida:',{
    method:req.methods,
    path:req.path,
    Headers:{
        authorization:req.headers.authorization ? '***':'NO',
        'x-access-token':req.headers['x-access-token']?'***':'NO'
    }
});
next();
});

// Rutas de lign (sin proteccion)
router.post('/signin',authController.signin);

// Ruta de registro 
router.post('/signup',(req,res,next)=>{
    console.log('[AuthRoutes] Middleware de verificacion de registro');
    next();
},


verifySignUp.checkDuplicateUsernameOrEmail,
verifySignUp.checkRolesExisted,
authController.singup
);

// Verificacion final de rutas
console.log('[AuthRotes] Rutas  configuradas:',router.stack.map(layer =>{
    return {
        path:layer.route?.path,
        methods:layer.route?.methods
    };
}));

module.exports = router;
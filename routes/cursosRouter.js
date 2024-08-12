const express=require('express');
const router=express.Router();
const cursoController=require('../controllers/cursoController');

router.get('/',cursoController.consultarTodos);
router.post('/',cursoController.insertar);

router.route('/:id')
    .get(cursoController.consultarUno)
    .put(cursoController.modificar)
    .delete(cursoController.eliminar);

module.exports=router;
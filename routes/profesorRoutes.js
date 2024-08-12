const express=require('express');
const router=express.Router();
const profesorController=require('../controllers/profesoresController');

router.get('/',profesorController.consultarTodos);
router.post('/',profesorController.insertar);

router.route('/:id')
    .get(profesorController.consultarUno)
    .put(profesorController.modificar)
    .delete(profesorController.eliminar);

module.exports=router;
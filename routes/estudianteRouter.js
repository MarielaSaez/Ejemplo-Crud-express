const express=require('express');
const router=express.Router();
const estudianteController=require('../controllers/estudianteController');

router.get('/', estudianteController.constultarTodos);
router.post('/', estudianteController.insertar);

router.route('/:id')
    .get(estudianteController.constultarUno)
    .put(estudianteController.modificar)
    .delete(estudianteController.eliminar);

module.exports=router;
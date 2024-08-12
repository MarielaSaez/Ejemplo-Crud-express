const express=require('express');
const router=express.Router();
const incripcionController=require('../controllers/inscripcionController');

router.get('/',incripcionController.consultarInscripciones);
router.get('/xAlumno/:id',incripcionController.consultarxAlumno );
router.get('/xCurso/:id',incripcionController.consultarxCurso );

router.post('/',incripcionController.inscribir );
router.delete('/:estudiante_id/:curso_id',incripcionController.cancelarInscripcion);

module.exports=router;
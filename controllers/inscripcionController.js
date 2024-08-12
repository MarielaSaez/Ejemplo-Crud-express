const {json}=require('express');
const db=require('../database/conexion');
const Joi = require('joi');

class InscripcionController{
    constructor(){}
    async consultarInscripciones(req,res){
        try{
            const [rows]=await db.query(`SELECT estudiantes.nombre AS estudiante, cursos.nombre AS curso 
                                    FROM cursos_estudiantes
                                    INNER JOIN cursos ON  cursos_estudiantes.curso_id=cursos.id 
                                    INNER JOIN estudiantes ON  cursos_estudiantes.estudiante_id=estudiantes.id`);
            res.status(200).json(rows);
        }
        catch(err){
            res.status(500).send(err.message);
        }
    }
    async consultarxAlumno(req,res){
        const {id}=req.params;
        try{
            const [rows]= await db.query(`SELECT estudiantes.nombre AS estudiante, cursos.nombre AS curso 
                                    FROM cursos_estudiantes
                                    INNER JOIN cursos ON  cursos_estudiantes.curso_id=cursos.id 
                                    INNER JOIN estudiantes ON  cursos_estudiantes.estudiante_id=estudiantes.id
                                    WHERE estudiantes.id=?`,[id]);
            res.status(200).json(rows);
        }
        catch(err){
            res.status(500).send(err.message);
        }
    }
    async consultarxCurso(req,res){
        const {id}=req.params;
        try{
            const [rows]= await db.query(`SELECT estudiantes.nombre AS estudiante, cursos.nombre AS curso 
                                    FROM cursos_estudiantes
                                    INNER JOIN cursos ON  cursos_estudiantes.curso_id=cursos.id 
                                    INNER JOIN estudiantes ON  cursos_estudiantes.estudiante_id=estudiantes.id
                                    WHERE cursos.id=?`,[id]);
            res.status(200).json(rows);
        }
        catch(err){
            res.status(500).send(err.message);
        }
    }


async inscribir(req, res) {

    const { estudiante_id, curso_id } = req.body;
    const conn = await db.getConnection();
    

  // Esquema de validación con Joi
  const schema = Joi.object({
    estudiante_id: Joi.number().integer().required(),
    curso_id: Joi.number().integer().required(),
  });

  // Validar la solicitud
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ mens: error.details[0].message });
  }

  

  try {
    await conn.beginTransaction();

    // Verificar si el estudiante existe
    const [estRes] = await conn.query(`SELECT COUNT(*) AS cant FROM estudiantes WHERE id=?`, [estudiante_id]);
    if (estRes[0].cant === 0) {
      await conn.rollback();
      return res.status(400).json({ mens: 'Estudiante no existe' });
    }

    // Verificar si el curso existe
    const [curRes] = await conn.query(`SELECT COUNT(*) AS cant FROM cursos WHERE id=?`, [curso_id]);
    if (curRes[0].cant === 0) {
      await conn.rollback();
      return res.status(400).json({ mens: 'Curso no existe' });
    }

    // Verificar si ya está inscrito
    const [existsRes] = await conn.query(`SELECT COUNT(*) AS cant FROM cursos_estudiantes WHERE estudiante_id=? AND curso_id=?`, [estudiante_id, curso_id]);
    if (existsRes[0].cant > 0) {
      await conn.rollback();
      return res.status(400).json({ mens: 'El estudiante ya está inscrito en este curso' });
    }

    // Insertar inscripción
    await conn.query(`INSERT INTO cursos_estudiantes (estudiante_id, curso_id) VALUES (?, ?);`, [estudiante_id, curso_id]);

    await conn.commit();
    res.status(200).json({ mens: 'Inscripción realizada' });
  } catch (err) {
    try {
      await conn.rollback();
    } catch (errRoll) {
      res.status(500).send(errRoll.message);
    }
    res.status(500).send(err.message);
  } finally {
    conn.release();
  }
}

    
    async cancelarInscripcion(req, res) {
        const { estudiante_id, curso_id } = req.params;
        const conn = await db.getConnection();
      
        try {
          await conn.beginTransaction();
      
          // Verificar si el estudiante existe
          const [estRes] = await conn.query(`SELECT COUNT(*) AS cant FROM estudiantes WHERE id=?`, [estudiante_id]);
          if (estRes[0].cant === 0) {
            await conn.rollback();
            return res.status(400).json({ mens: 'Estudiante no existe' });
          }
      
          // Verificar si el curso existe
          const [curRes] = await conn.query(`SELECT COUNT(*) AS cant FROM cursos WHERE id=?`, [curso_id]);
          if (curRes[0].cant === 0) {
            await conn.rollback();
            return res.status(400).json({ mens: 'Curso no existe' });
          }
      
          // Verificar si la inscripción existe
          const [existsRes] = await conn.query(`SELECT COUNT(*) AS cant FROM cursos_estudiantes WHERE estudiante_id=? AND curso_id=?`, [estudiante_id, curso_id]);
          if (existsRes[0].cant === 0) {
            await conn.rollback();
            return res.status(400).json({ mens: 'La inscripción no existe' });
          }
      
          // Cancelar la inscripción
          await conn.query(`DELETE FROM cursos_estudiantes WHERE estudiante_id=? AND curso_id=?`, [estudiante_id, curso_id]);
      
          await conn.commit();
          res.status(200).json({ mens: 'Inscripción cancelada' });
        } catch (err) {
          try {
            await conn.rollback();
          } catch (errRoll) {
            res.status(500).send(errRoll.message);
          }
          res.status(500).send(err.message);
        } finally {
          conn.release();
        }
      }
      

}
module.exports=new InscripcionController();
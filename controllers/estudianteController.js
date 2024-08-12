const {json}=require('express');
const db=require('../database/conexion');

class EstudianteController{
    constructor(){}
    async constultarTodos(req,res){
        try{
            const [rows]= await db.query('SELECT * FROM estudiantes');
            res.status(200).json(rows);
        }
        catch(err){
            res.status(500).send(err.message);
        }
    }

    async constultarUno(req,res){
        const {id}=req.params;
        try{
            const [rows]= await db.query(`SELECT * FROM estudiantes WHERE id=?`,[id]);
            if(rows.length>0){
                res.status(200).json(rows[0]);
            }
            else{
                res.status(400).json({mens:'Estudiante no encontrado'});
            }
            
        }
        catch(err){
            res.status(500).send(err.message);
        }
    }

    async insertar(req,res){
        const {dni, nombre, apellido, email}=req.body;
        try{
            const [rows]= await db.query(`INSERT INTO estudiantes (id,dni, nombre, apellido, email) VALUES (NULL,?,?,?,?);`,
                [dni, nombre, apellido, email]);
            
                res.status(201).json({id:rows.insertId});
            
        }
        catch(err){
            res.status(500).send(err.message);
        }
    }

    async modificar(req,res){
        const {id}=req.params;
        const {dni, nombre, apellido, email}=req.body;
        try{
            const [rows]= await db.query(`UPDATE estudiantes  SET dni=?, nombre=?, apellido=?, email=? WHERE id=?;`,
                [dni, nombre, apellido, email, id]);
            if (rows.affectedRows===1){
                res.status(200).json({mens:'Estudiante modificado'});
            }
            else{
                res.status(400).json({mens:'Estudiante no encontrado'});
            }
            
        }
        catch(err){
            res.status(500).send(err.message);
        }
    }
    
    async eliminar(req,res){
        const {id}=req.params;
        const conn=await db.getConnection();
        try{
           await conn.beginTransaction();
           const[curRes]=await conn.query(`SELECT COUNT(*) AS cant FROM cursos_estudiantes WHERE estudiante_id=?;`, [id]); 
           if(curRes[0].cant>0){
               await conn.rollback();
               return res.status(400).json({mens:'Estudiante cursando materias no se puede eliminar'});
           }
           const [deleteRes]= await conn.query(`DELETE FROM estudiantes WHERE id=?;`,[id]);
           if (deleteRes.affectedRows===1){
              await conn.commit();
              res.status(200).json({mens:'Estudiante eliminado'});
           }
           else {
            await conn.rollback();
            res.status(400).json({mens:'El estudiante no see encuentra'});
           }
        }
        catch(err){

            try{
                await conn.rollback();
            }
            catch(errRoll){
                res.status(500).send(errRoll.message);
            }
            res.status(500).send(err.message);
        }
        finally{
            conn.release();
        }
    }

}

module.exports=new EstudianteController();
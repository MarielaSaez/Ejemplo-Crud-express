const {json}=require('express');
const bd=require('../database/conexion');

class CursoController{
    async consultarTodos(req, res){
        try{
            const [rows]= await bd.query(`SELECT * FROM cursos`);
            res.status(200).json(rows);
        }
        catch(err){
            res.status(500).send(err.message);
        }
    }

    async consultarUno(req, res){
        const {id}=req.params;
        try{
            const [rows]= await bd.query(`SELECT * FROM cursos WHERE id=?`,[id]);
            if(rows.length>0){
                res.status(200).json(rows[0]);
            }
            else{
                res.status(400).json({mens:'curso no encontrado'});
            }         
        }
        catch(err){
            res.status(500).send(err.message);
        }
    }

    async insertar(req, res){
        const {nombre,descripcion,profesor_id}=req.body;
        const conn=await bd.getConnection();
        try{
            await conn.beginTransaction();
            const [cursRes]=await conn.query( `SELECT COUNT(*) AS cant FROM profesores WHERE id=?;`,[profesor_id]);
            if(cursRes[0].cant==0){
                await conn.rollback();
                return res.status(400).json({mens:'El profesor no existe'});
            }
            const [insertEst]=await conn.query(`INSERT INTO cursos (id,nombre,descripcion,profesor_id) VALUES (NULL,?,?,?);`,
                [nombre,descripcion,profesor_id]);
            if(insertEst.affectedRows===1){
                await conn.commit();
                res.status(200).json({id:insertEst.insertId});

            }
           
        }
        catch(err){
            res.status(500).send(err.message);
            try{
                await conn.rollback();
            }
            catch(errRoll){
                res.status(500).send(errRoll.message);
            }

        }
        finally{
              conn.release();
        }
    }

    async modificar(req, res){
        const {id}=req.params;
        const {nombre,descripcion,profesor_id}=req.body;
        const conn=await bd.getConnection();
        try{
            await conn.beginTransaction();
            const [cursRes]=await conn.query( `SELECT COUNT(*) AS cant FROM profesores WHERE id=?;`,[profesor_id]);
            if(cursRes[0].cant==0){
                await conn.rollback();
                return res.status(400).json({mens:'El profesor no existe'});
            }
            const [insertEst]=await conn.query(`UPDATE cursos SET nombre=?,descripcion=?,profesor_id=? WHERE id=?;`,
                [nombre,descripcion,profesor_id,id]);
            if(insertEst.affectedRows===1){
                await conn.commit();
                res.status(200).json({id:insertEst.insertId});

            }
           
        }
        catch(err){
            res.status(500).send(err.message);
            try{
                await conn.rollback();
            }
            catch(errRoll){
                res.status(500).send(errRoll.message);
            }

        }
        finally{
              conn.release();
        }
    }

    async eliminar(req, res){
        const {id}=req.params;
        try{
            const [rows]= await bd.query(`DELETE FROM cursos WHERE id=?`,[id]);
            if(rows===1){
               
                res.status(200).json({mens:'Curso borrado'});

            }
            else{
                res.status(404).json({mens:'Curso no encontrado'});
            }
            
        }
        catch(err){
            res.status(500).send(err.message);
        }
    }

}
module.exports=new CursoController();
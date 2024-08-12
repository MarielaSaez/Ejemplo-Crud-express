const {json}=require('express');
const bd=require('../database/conexion');

class ProfesorController{
    constructor(){}
    async consultarTodos(req, res){
        try{
            const [rows]= await bd.query(`SELECT * FROM profesores`);
            res.status(200).json(rows);
        }
        catch(err){
            res.status(500).send(err.message);
        }
    }

    async consultarUno(req, res){
        const {id}=req.params;
        try{
            const [rows]= await bd.query(`SELECT * FROM profesores WHERE id=?`,[id]);
            if(rows.length>0){
                res.status(200).json(rows[0]);
            }
            else{
                res.status(400).json({mens:'profesor no encontrado'});
            }         
        }
        catch(err){
            res.status(500).send(err.message);
        }
    }

    async insertar(req, res){
        const {dni,nombre,apellido,email,profesion,telefono}=req.body;
        try{
            const [rows]= await bd.query(`INSERT INTO profesores (id,dni,nombre,apellido,email,profesion,telefono) VALUES (NULL,?,?,?,?,?,?);`,
                [dni,nombre,apellido,email,profesion,telefono]);
            res.status(200).json({id:rows.insertId});
                  
        }
        catch(err){
            res.status(500).send(err.message);
        }
    }

    async modificar(req, res){
        const {dni,nombre,apellido,email,profesion,telefono}=req.body;
        const {id}=req.params;
        try{
            const [rows]= await bd.query(`UPDATE profesores SET dni=?, nombre=?, apellido=?, email=?, profesion=?,telefono=? WHERE id=?;`,
                [dni,nombre,apellido,email,profesion,telefono,id]);
            if(rows.affectedRows===1){
                res.status(200).json({mens:'profesor actualizado'});
            }
            else{
                res.status(400).json({mens:'profesor no encontrado'});
            }         
        }
        catch(err){
            res.status(500).send(err.message);
        }
    }

    async eliminar(req, res){
        const {id}=req.params;
        const conn=await bd.getConnection();
        try{
            await conn.beginTransaction();
            const [cursRes]=await conn.query( `SELECT COUNT(*) AS cant FROM cursos WHERE profesor_id=?;`,[id]);
            if(cursRes[0].cant>0){
                await conn.rollback();
                return res.status(400).json({mens:'El profesor se encuentra dictando materias'});
            }
            const [deleteEst]=await conn.query(`DELETE FROM profesores WHERE id=?;`,[id]);
            if(deleteEst.affectedRows===1){
                await conn.commit();
                res.status(200).json({mens:'profesor eliminado'});

            }
            else{
                await conn.rollback();
                res.status(400).json({mens:'profesor no encontrado'});
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

}
module.exports=new ProfesorController();
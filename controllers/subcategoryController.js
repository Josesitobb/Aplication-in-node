const Subcategory = require('../models/Subcategory');
const Category = require('../models/Category');

// Crear subcategoria
exports.createSubcategory = async(req,res) =>{
    try{
        const {name, description, category} = req.body;
        // Validar que la categoria existe
        const parentCategory = await Category.findById(category);
        if(!parentCategory){
            return res.status(404).json({
                success:false,
                message:'La categoria no existe'
            });
        }
        
        const newSubcategory = new Subcategory({
            name: name.trim(),
            description:description.trim(),
            category
        });

        await newSubcategory.save();

        res.status(201).json({
            success:true,
            message:'Subcategoria creada exitosamente',
            data: newSubcategory
        });
    }catch(error){
        console.error("Error al crear la subcategoria:", error);

        if(error.message.includes('duplicate Key') || error.message.includes('Ya existe')){
            return res.status(404).json({
                success:false,
                message:'Ya exite una subcateogria con ese nombre'
            })
        }
        res.status(500).json({
            success:false,
            message: error.message || 'Error la crear subcategoria'
        });
    }
};
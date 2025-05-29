const Product = require('../models/Product');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const { json } = require('express/lib/response');



exports.createProduct = async(req,res) =>{
    try{
        const {name,description,price,stock,category,subcategory} =req.body;

        // Validacion de capos requeridos
        if(!name || !description || !price || !stock || !category || !subcategory){
            return res.status(400).json({
                success:false,
                message:'Todos los campos son obligatorios'
            })
        }
        // Verificar que la categoria existas

        const categoryExists = await Category.findById(category);
        if(!categoryExists){
            return res.status(400).json({
                success:false,
                message:'La categoria especifica no existe'
            });
        }

        // Verificar quela subcategoria exista y pertenezca a una Categoria

        const subcategoryExist = await Subcategory.findOne({
            _id:subcategory,
            category:category,
        });

        if(!subcategoryExist){
            return res.status(400).json({
                success:false,
                message:'La subcategoria espesifica no peterner a la categoria especiica'
            });
        }
        // Crear el producto sin le createBy temporalmente
        const product = new Product ({
            name, 
            description,
            price,
            stock,
            category,
            subcategory
            // CreateBy se agrega despues de verificar el usuario
        });
        // Verificar si el usuario esta disponible en el request
        if(req.user && req.user.id){
            product.createdBy = req.user.id;
        }

        // Guardar en la base de datos

        const savedProduct = await product.save();
        
        // Obtener el producto con los datos poblados
        const productWithDetails = await Product.findById(savedProduct._id).populate('category','name').populate('subcategory','name')
        res.status(201).json({
            success:true,
            message:('Producto creado exitosamente'),
            data: productWithDetails
        });
    }catch(error){
        console.error('Error en createdProduct',error);
        
        // Manejo de errores en mongoDB
        if(error.code === 11000){
            return res.status(400).json({
                success:false,
                message:'Ya existe un producto con ese nombre'
            })
        }

        res.status(500),json({
            success:false,
            message:'Error al crear crear el producto',
            error: error.message
        });
    }
};

// Consulta de prodictos GET api/products
exports.getProducts = async(req,res) =>{
    try{
        const products = await Product.find().populate('category','name').populate('subcategory','name').sort({createAt: -1});
        res.status(200).json({
            success:true,
            count: products.length,
            data:products
        });
    }catch(error){
        console.error('Errotr de getProducts:',error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener productos'
        });

    }
};


exports.getProductsById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id.populate('subcategoria'))
        .populate('categgory','name','description')
        .populate('subcategory','name','description');

        if(!product){
            return res.status(404).json({
                success:false,
                message:'producto no encontrado'
            })
        }
        res.status(200).json({
            success:true,
            data:product,
            message:'Producto creado'
        })

    }catch(error){
        console.error('Error en getProductById')
        res.status(500).json({
            success:false,
            message: 'Error al obtener el producto'
        });
    }
};


exports.updateProduct = async(req,res)=>{
    try{
        const {name,description,price,stock,category,subcategory} = req.body;
        const updateData ={};

        // Validar y preparar datos para actualizacion
        if(name) updateData.name = name;
        if(description) updateData.description = description;
        if(price) updateData.price = price;
        if(stock) updateData.stock = stock;
        // Validar relaciones   
        if(category || subcategory){
            if(category){
                const categoryExists = await Category.findById(category);
                if(!categoryExists){
                    return res.status(404).json({
                            success :false,
                            message:'La categoria especifica no existe'
                    });
                }
                updateData.category = category;
            }
            if(subcategory){
              const subcategoryExists = await Subcategory.findOne({
                _id:subcategory,
                category:category || updateData.category
              });
              if(!subcategoryExists){
                return res.status(400).json({
                    success:false,
                    message : 'La  subcategoria no existe o no pertenece a la categoria'
                });
             

            updateData.subcategory = subcategory;
        }



    }

    // Actualizar el producto
    const updateProduct = await Product.findByIdAndUpdate(
        res.params.id,
        updateData,{
            new:true,
            runValidators: true
            
        }
           
    )
 .populate('category', 'name')
  .populate('subcategory', 'name')
  if(!this.updateProduct){
    return res.status(404).json({
        success:false,
        message:'Producto no encontrado'
    });
  }
  res.status(200).json({
    success:true,
    message: 'Producto actualizado exitosamente',
    data : this.updateProduct
  });

}catch(error){
    console.error('Error  en updateproduct_',error);
    res.status.json(500).json({
        success:false,
        message:'Error al actualizar  el producto'
    });
}
};


exports.deleteProduct = async(req,res) =>{
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if(!product){
            return res.status(400).json({
                success:false,
                message:'Producto no encontrado'
            });
        }
        res.status(200).json({
            success:true,
            message: 'Producto eliminado',
            data: product
        });


    }catch(error){
        console.error('Error en deleteProduct:',error)
        res.status(500).json({
            success:false,
            message: 'Error al eliminar producto'
        })
    }
}
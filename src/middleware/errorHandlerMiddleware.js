
const errorHandler = async(err, res)=>{
        console.log(err.stack)
        const status = res.statusCode ? res.statusCode: 500 //Server error
        res.status(status).json({message:err.message})
        // next()
}
module.exports = errorHandler
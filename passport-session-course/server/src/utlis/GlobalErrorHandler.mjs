

export const globalErrorHandling = (err,req,res,next)=>{
  if(err)
  {
      return res.status(err.cause||500).json({status:'Failed',message:err.message,err,stack:err.stack})
  }
}


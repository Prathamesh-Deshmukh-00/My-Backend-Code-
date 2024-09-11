const asyncHandler = (resquestHandler) => {
   return (req, res, next) => {
        Promise.resolve(resquestHandler(req, res, next)).catch((error) => next(error))
    }
}

export {asyncHandler}

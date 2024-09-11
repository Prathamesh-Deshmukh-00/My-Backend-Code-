class ApiResponse { 
    constructor(statusCode , data ,massage = "success"){
        this.statusCode = statusCode 
        this.data = data 
        this.massage = massage
        this.succuss = statusCode < 400 
    }
}
export {ApiResponse}
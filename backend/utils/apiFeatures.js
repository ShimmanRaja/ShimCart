class APIFeatures{
    constructor(query, queryStr){
        this.query = query;
        this.queryStr = queryStr
    }
    // Search Function
    search(){
        let keyword = this.queryStr.keyword ? {
            name : {
                $regex : this.queryStr.keyword, // to find keyword
                $options : 'i' // no case sensitivity 
            }
        } : {};

        this.query.find({...keyword})
        return this;
    }


    // Filter Function
    filter(){

        const queryStrCopy = {...this.queryStr};        

        //removing Fields from Query
        const removeFields = ['keyword','limit','page'];
        removeFields.forEach((field) => delete queryStrCopy[field]);     
        
        //make all values in queryStrCopy : Strings and Case Sensitivity 
        // Object.keys(queryStrCopy).forEach((key) => {
        //     if (typeof queryStrCopy[key] === "string") {
        //         queryStrCopy[key] = new RegExp(queryStrCopy[key], "i");
        //     }
        // });
        
        //Price Filter
        let queryStr = JSON.stringify(queryStrCopy);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)/g, match =>`$${match}`)

        // console.log(queryStr);

        queryStr =  JSON.parse(queryStr);

        this.query.find(queryStr);
        return this;
    }
     
    paginate(resPerPage){

        const currentPage = Number(this.queryStr.page) || 1;
        const skip = resPerPage * (currentPage - 1);

        this.query.limit(resPerPage).skip(skip);
        return this;

    }






}

module.exports = APIFeatures;
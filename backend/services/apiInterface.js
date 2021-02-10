/** MyClass description */
class ApiInterface {
    // eslint-disable-next-line require-jsdoc
    constructor(query, queryObject) {
        this.query = query;
        this.queryObject = queryObject;
    }

    // eslint-disable-next-line require-jsdoc
    filter() {
        let optionalTags = {};
        let mandoTags = {};
        // builds part of mongoDB query to match tags
        if (this.queryObject.tags) optionalTags = Sale.convertTagsStringIntoQueryObject(true, this.queryObject.tags);
        if (this.queryObject.manTags)
            mandoTags = Sale.convertTagsStringIntoQueryObject(false, this.queryObject.manTags);

        //  formatting query for MongoDB/mongoose.find() query
        const formattedQueryObject = { ...this.queryObject, ...optionalTags, ...mandoTags };
        const excludedParams = ['page', 'limit', 'fields', 'tags', 'manTags', 'sort'];

        // removing specific params
        for (const param of excludedParams) delete formattedQueryObject[param];

        // fixings params for mongoDB operations eg., gte -> $gte
        const queryString = JSON.stringify(formattedQueryObject).replace(
            /\b(gte|gt|lte|lt|exists|or|and|all)\b/g,
            (match) => `$${match}`,
        );
        // executing the query
        this.query = this.query.find(JSON.parse(queryString));
        // for chaining
        return this;
    }

    // eslint-disable-next-line require-jsdoc
    sort() {
        // sorting
        if (this.queryObject.sort) {
            const sortParams = this.queryObject.sort.split(',').join(' ');

            this.query = this.query.sort(sortParams);
        } else {
            // default is to sort by newest ie., createdAt DESC order and than by name
            this.query = this.query.sort('-createdAt title');
        }
        return this;
    }

    // eslint-disable-next-line require-jsdoc
    limitFields() {
        if (this.queryObject.fields) {
            const fields = this.queryObject.fields.split(',').join(' ');
            // select is mongoose method expects string of keys to include formatted like: 'key1 key2'
            this.query = this.query.select(fields);
        } else {
            // includes everything but version key (only backend needs it)
            this.query = this.query.select('-__v');
        }
        return this;
    }

    // eslint-disable-next-line require-jsdoc
    paginate() {
        const page = this.queryObject.page * 1 || 1;
        const limit = this.queryObject.limit * 1 || 100;
        const skip = (page - 1) * limit;
        /* 
            skip and limit are moongoose methods to help select current page and results per page
            limit === numbers of results per page
            skip === number of results to skip -> page * limit
        */

        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}

module.exports = ApiInterface;

/** A Util Class to help controllers manage incoming/outcoming requests
 * 1 instance per request
 */
class ApiInterface {
    /**
     * @param {Object} query - mongoose object with protype methods for building our DB query. It yields a promise with query results.
     * @param {Object} queryObject - regular object created from the incoming browser req.query.
     */
    constructor(query, queryObject) {
        this.query = query;
        this.queryObject = queryObject;
    }

    /**
     * builds/applies filters to this.query by using Model.find() with formated version of this.queryObject.
     * @return {Object} returns itself(this) for chain method calls.
     */
    filter() {
        let optionalTags = {};
        let mandoTags = {};

        // builds individual filter objects for optional and mandatory tags
        if (this.queryObject.tags) optionalTags = Sale.convertTagsStringIntoQueryObject(true, this.queryObject.tags);
        if (this.queryObject.manTags) {
            mandoTags = Sale.convertTagsStringIntoQueryObject(false, this.queryObject.manTags);
        }

        //  merges the filter objects into new, singular filter Object
        const formattedQueryObject = {
            ...this.queryObject,
            ...optionalTags,
            ...mandoTags,
        };

        if (this.queryObject.title) {
            Object.assign(formattedQueryObject, { $text: { $search: this.queryObject.title } });
        }

        // params not used for filtering or  that needed to be formatted into the merged query Object
        const excludedParams = ['page', 'limit', 'fields', 'tags', 'manTags', 'sort', 'title'];

        // removing the params so they dont affect filtering
        for (const param of excludedParams) delete formattedQueryObject[param];

        // convert filter object into string and modify params for their mongoDB $ counterparts eg., gte -> $gte
        const queryString = JSON.stringify(formattedQueryObject).replace(
            /\b(gte|gt|lte|lt|exists|or|and|all)\b/g,
            (match) => `$${match}`,
        );
        // save filters to mongoose query
        this.query = this.query.find(JSON.parse(queryString));
        // for chaining
        return this;
    }

    /**
     * builds/applies sorting to this.query by using Model.sort() with formated version of this.queryObject.sort.
     * @return {Object} returns itself(this) for chain method calls.
     */
    sort() {
        // checking for sorting queryParams
        if (this.queryObject.sort) {
            // Model.sort method expects string of keys to include formatted like: 'key1 key2'
            const sortParams = this.queryObject.sort.split(',').join(' ');
            this.query = this.query.sort(sortParams);
        } else {
            // default is to sort by newest ie., createdAt DESC order and than by name 2nd
            this.query = this.query.sort('-createdAt title');
        }
        return this;
    }

    /**
     * builds/applies limits to what keys this.query's results will include by using Model.select() with formated version of this.queryObject.
     * @return {Object} returns itself(this) for chain method calls.
     */
    limitFields() {
        if (this.queryObject.fields) {
            // Model.select method expects string of keys to include formatted like: 'key1 key2'
            const fields = this.queryObject.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            // includes everything but version key (only backend needs it)
            this.query = this.query.select('-__v');
        }
        return this;
    }

    /**
     * builds/applies pagination to this.query's results using page and limit query params.
     * @return {Object} returns itself(this) for chain method calls.
     */
    paginate() {
        // defaults -> page 1, 50 results
        const page = this.queryObject.page * 1 || 1;
        const limit = this.queryObject.limit * 1 || 50;
        const skip = (page - 1) * limit;
        /* 
            skip and limit are Model methods to help select current page and results per page
            limit === numbers of results per page
            skip === number of results to skip -> page * limit
        */

        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}

module.exports = ApiInterface;

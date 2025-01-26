class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  // Filters the query based on request parameters (gte, gt, lte, lt).
  filter() {
    const { page, sort, limit, fields, ...queryObj } = this.queryStr;
    let queryString = JSON.stringify(queryObj).replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    this.query.find(JSON.parse(queryString));
    return this;
  }

  // Sorts results based on specified fields, defaults to '-createdAt' if none provided.
  sort() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  // Limits the fields returned in the query response.
  limitField() {
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  // Paginates the query results based on 'page' and 'limit' parameters.
  paginate() {
    const page = Math.max(this.queryStr.page * 1 || 1, 1);
    const limit = Math.max(this.queryStr.limit * 1 || 100, 1);
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  search() {
    if (this.queryStr.search) {
      const searchQuery = this.queryStr.search;
      this.query = this.query.find({
        $or: [
          { name: { $regex: searchQuery, $options: "i" } },
          { category: { $regex: searchQuery, $options: "i" } },
        ],
      });
    }
    return this;
  }
}

export default APIFeatures;

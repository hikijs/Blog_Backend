const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
class PagnigationHelper 
{
	constructor(totalRecords, page = DEFAULT_PAGE, limit = DEFAULT_LIMIT) {
		this.totalRecords = totalRecords;
		this.limit = limit;
		this.page = page;
		this.totalPages = Math.ceil(this.totalRecords / this.limit);
		if(page > this.totalPages) {
			throw new Error('Page must be less than total page');
		}
		else if(page < 1)
		{
			throw new Error('Page must be greater than 0');
		}
		this.nextPage = null;
		this.prevPage = null;
		this.processingPagination();
	}

	processingPagination() {
		this.numberPage = Math.ceil(this.totalRecords / this.limit);
		this.offset = (this.page - 1) * this.limit;
		this.setPrevAndNextPage();
	}

	getInfo()
	{
		return { totalPage: this.totalRecords,
			currentPage: this.page,
			limit: this.limit,
			offset: this.offset,
			nextPage: this.nextPage,
			prevPage: this.prevPage
		};
	}

	setPrevAndNextPage() {
		this.nextPage = null;
		this.prevPageq = null;
		if (this.page < this.totalRecords && this.page > 1)
		{
			this.nextPage = this.page + 1; // max is numberPages
			this.prevPage = this.page - 1; // min is 1
		}
		else if(this.page == this.totalRecords && this.page > 1)
		{
			this.prevPage = this.page - 1;
			this.nextPage = null;
		} 
		else if(this.page == 1 && this.page < this.totalRecords)
		{
			this.nextPage = this.page + 1;
			this.prevPage = null;
		}
	}
}

module.exports = {
	PagnigationHelper,
};
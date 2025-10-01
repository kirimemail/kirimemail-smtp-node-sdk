/**
 * Pagination model
 */
export interface PaginationData {
  total?: number;
  per_page?: number;
  current_page?: number;
  last_page?: number;
  count?: number;
  offset?: number;
  limit?: number;
}

export class Pagination {
  public readonly total?: number;
  public readonly perPage?: number;
  public readonly currentPage?: number;
  public readonly lastPage?: number;
  public readonly count?: number;
  public readonly offset?: number;
  public readonly limit?: number;

  constructor(data: PaginationData = {}) {
    this.total = data.total;
    this.perPage = data.per_page;
    this.currentPage = data.current_page;
    this.lastPage = data.last_page;
    this.count = data.count;
    this.offset = data.offset;
    this.limit = data.limit;
  }

  /**
   * Check if there are more pages
   */
  public hasNextPage(): boolean {
    if (!this.currentPage || !this.lastPage) return false;
    return this.currentPage < this.lastPage;
  }

  /**
   * Check if this is not the first page
   */
  public hasPreviousPage(): boolean {
    if (!this.currentPage) return false;
    return this.currentPage > 1;
  }

  /**
   * Check if this is the first page
   */
  public isFirstPage(): boolean {
    return this.currentPage === 1;
  }

  /**
   * Check if this is the last page
   */
  public isLastPage(): boolean {
    if (!this.currentPage || !this.lastPage) return true;
    return this.currentPage === this.lastPage;
  }

  /**
   * Get next page number
   */
  public getNextPage(): number | null {
    if (!this.hasNextPage()) return null;
    return (this.currentPage || 0) + 1;
  }

  /**
   * Get previous page number
   */
  public getPreviousPage(): number | null {
    if (!this.hasPreviousPage()) return null;
    return (this.currentPage || 0) - 1;
  }

  /**
   * Get total number of pages
   */
  public getTotalPages(): number {
    return this.lastPage || 0;
  }

  /**
   * Get total number of items
   */
  public getTotalItems(): number {
    return this.total || 0;
  }

  /**
   * Get number of items per page
   */
  public getItemsPerPage(): number {
    return this.perPage || this.limit || 0;
  }

  /**
   * Get number of items in current page
   */
  public getCurrentPageItems(): number {
    return this.count || 0;
  }

  /**
   * Calculate offset for a given page number
   */
  public getOffsetForPage(page: number): number {
    const itemsPerPage = this.getItemsPerPage();
    if (itemsPerPage <= 0) return 0;
    return (page - 1) * itemsPerPage;
  }

  /**
   * Calculate which page an item at a given index would be on
   */
  public getPageForItemIndex(itemIndex: number): number {
    const itemsPerPage = this.getItemsPerPage();
    if (itemsPerPage <= 0) return 1;
    return Math.floor(itemIndex / itemsPerPage) + 1;
  }

  /**
   * Check if pagination data is valid and complete
   */
  public isValid(): boolean {
    return !!(this.currentPage && this.perPage && this.total);
  }

  /**
   * Get pagination summary as a readable string
   */
  public getSummary(): string {
    if (!this.isValid()) {
      return 'Invalid pagination data';
    }

    const start = this.offset ? this.offset + 1 : 1;
    const end = this.count ? start + this.count - 1 : start;
    const total = this.total || 0;
    const page = this.currentPage || 1;
    const lastPage = this.lastPage || 1;

    return `Showing ${start}-${end} of ${total} items (page ${page} of ${lastPage})`;
  }

  /**
   * Convert to plain object
   */
  public toJSON(): PaginationData {
    return {
      total: this.total,
      per_page: this.perPage,
      current_page: this.currentPage,
      last_page: this.lastPage,
      count: this.count,
      offset: this.offset,
      limit: this.limit,
    };
  }

  /**
   * Create Pagination from API response
   */
  public static fromAPI(data: any): Pagination {
    return new Pagination(data);
  }

  /**
   * Create Pagination from list response and items count
   */
  public static fromResponse(
    data: { total?: number; per_page?: number; current_page?: number; last_page?: number },
    itemCount?: number
  ): Pagination {
    return new Pagination({
      ...data,
      count: itemCount,
    });
  }

  /**
   * Convert to string representation
   */
  public toString(): string {
    return `Pagination(page=${this.currentPage}/${this.lastPage}, total=${this.total}, per_page=${this.perPage})`;
  }
}
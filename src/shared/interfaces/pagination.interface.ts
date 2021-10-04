/**
 * @swagger
 * definitions:
 *  PaginationMetadataLinks:
 *    description: All necessary links (including the same query parameters that were passed)
 *    properties:
 *      self:
 *        type: string
 *        description: Requested route url
 *      first:
 *        type: string
 *        description: First page route url
 *      previous:
 *        type: string
 *        nullable: true
 *        description: Previous page route url
 *      next:
 *        type: string
 *        nullable: true
 *        description: Next page route url
 *      last:
 *        type: string
 *        nullable: true
 *        description: Last page route url
 */
interface PaginationLinks {
  self: string;
  first: string;
  previous: string;
  next: string;
  last: string;
}

/**
 * @swagger
 * definitions:
 *  PaginationMetadata:
 *    description: Provides all the necessary values to navigate through a paginated resource
 *    properties:
 *      page:
 *        type: number
 *        description: The current page
 *      perPage:
 *        type: number
 *        description: Number of requested items per page
 *      pageCount:
 *        type: number
 *        description: Total number of page given the current configuration
 *      totalItems:
 *        type: number
 *        description: Total number of items given the current configuration
 *      links:
 *        $ref: '#/definitions/PaginationMetadataLinks'
 */
export interface PaginationMetadata {
  page: number;
  perPage: number;
  pageCount: number;
  totalItems: number;
  links: PaginationLinks;
}

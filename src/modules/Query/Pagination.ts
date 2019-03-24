export class Pagination {
  public page: number
  public perPage: number

  constructor (page: number = 1, perPage: number = 15) {
    this.page = page
    this.perPage = perPage
  }
}

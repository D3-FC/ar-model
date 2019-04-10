import ArModel from '../Model/ArModel'
import { Dto } from '../DAO/Dto'

export class ArCollection {
  protected $items: ArModel[] = []

  constructor (items: ArModel[] = []) {
    this.$items = items
  }

  public toObject (): Dto {
    return this.$items.map((item: ArModel) => item.toObject())
  }

}

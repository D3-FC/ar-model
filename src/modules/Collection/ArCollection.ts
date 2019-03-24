import ArModel from '../Model/ArModel'
import { Dao } from '../DAO/Dao'

export class ArCollection {
  protected $items: ArModel[] = []

  constructor (items: ArModel[] = []) {
    this.$items = items
  }

  public toObject (): Dao {
    return this.$items.map((item: ArModel) => item.toObject())
  }
}

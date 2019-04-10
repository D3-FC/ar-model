import ArModel from '../Model/ArModel'
import { Dto } from '../DAO/Dto'
import { arrayFindByCriteria, arrayRemove, arrayRemoveByCriteria } from '../Helper/ArrayHelpers'

type Criteria = Dto | ((item: ArModel) => boolean)

export class ArCollection {
  protected $items: ArModel[] = []

  constructor (items: ArModel[] = []) {
    this.$items = items
  }

  toObject (): Dto {
    return this.$items.map((item: ArModel) => item.toObject())
  }

  find (criteria: Dto | Criteria): ArModel | null {
    return arrayFindByCriteria(this.$items, criteria)
  }

  protected removeItem (item: ArModel) {
    arrayRemove(this.$items, item)
  }

  protected removeByCriteria (criteria: Criteria) {
    arrayRemoveByCriteria(this.$items, criteria)
  }

  remove (itemOrCriteria: ArModel | Criteria) {
    if (itemOrCriteria instanceof ArModel) return this.removeItem(itemOrCriteria)

    return this.removeByCriteria(itemOrCriteria)
  }
}

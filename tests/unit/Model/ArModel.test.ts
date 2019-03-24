import ArModel from '../../../src/modules/Model/ArModel'
import { QueryContract } from '../../../src/modules/Model/QueryContract'
import { Dao } from '../../../src/modules/DAO/Dao'
import { LaravelApi } from '../../../src/modules/Api/LaravelApi'
import { ApiMock } from '../Query/ApiMock'
import { ArCollection } from '../../../src/modules/Collection/ArCollection'

describe('ArModel', () => {
  class QueryMock implements QueryContract {
    async delete (payload?: object, url?: string): Promise<any> {
      return undefined
    }

    expandUrl (url?: string | number | null): this {
      return this
    }

    async get (payload?: Dao, url?: string): Promise<any> {
      return undefined
    }

    async paginate (page?: number, perPage?: number): Promise<any> {
      return undefined
    }

    async post (payload?: object, url?: string): Promise<any> {
      return undefined
    }

    async put (payload?: object, url?: string): Promise<any> {
      return undefined
    }

    setPayload (payload: object): this {
      return this
    }

    to (resource: string | ArModel): this {
      return this
    }
  }

  class Model extends ArModel {
    constructor (data: Dao = {}) {
      super(new ApiMock())
    }
  }

  test('fill should assign all keys from given Object', () => {
    const m = new Model()
    m.fill({ name: 'my model', someObject: { id: 1 } })
    expect(m).toMatchObject({ name: 'my model', someObject: { id: 1 } })
  })

  describe('map ', () => {
    test('should assign all keys from given Object', () => {
      const m = new Model()
      const scheme = { name: 'my model', someObject: { id: 1 } }
      m.map(scheme)
      expect(m).toMatchObject(scheme)
    })
    test('mutation of scheme keys should not affect on mapped model', () => {
      const m = new Model()
      const scheme = { name: 'my model', someObject: { id: 1 } }
      m.map(scheme)
      scheme.someObject.id = 2
      expect(m).toMatchObject({ name: 'my model', someObject: { id: 1 } })
    })
  })

  describe('mapOrNull ', () => {
    test('should assign all keys from given Object', () => {
      const m = new Model()
      const scheme = { name: 'my model', someObject: { id: 1 } }
      const result = m.mapOrNull(scheme)
      expect(result).toMatchObject(scheme)
    })
    test('should return null if nothing given', () => {
      const m = new Model()
      const result = m.mapOrNull(undefined)
      expect(result).toBeNull()
    })
  })

  describe('getId ', () => {
    test('should return value of "$idKey" key ', () => {
      class MyModel extends Model {
        $idKey = 'id'
        id?: number
      }

      const m = new MyModel()
      m.id = 1
      const result = m.getId()
      expect(result).toEqual(1)
    })
    test('should be true if value of $idKey key exists', () => {
      class MyModel extends Model {
        id?: number
      }

      const m = new MyModel()
      m.id = 1
      const result = m.isExisting
      expect(result).toBeTruthy()
    })
    test('should be false if value of $idKey key exists', () => {
      const m = new Model()
      const result = m.isExisting
      expect(result).toBeFalsy()
    })
  })

  describe('toObject ', () => {
    test('should plain Object with keys of original model', () => {
      class MyModel extends Model {
        $idKey = 'id'
        id = 1
        model = new Model().fill({ name: 'related model' })
        listOfAny = [
          new Model().fill({ name: 'related model 2' }),
          new ArCollection([new Model().fill({ name: 'related model' })]),
          1,
          { name: 'name' }
        ]
        collection = new ArCollection([new Model().fill({ name: 'related model' })])
        listOfPrimitives = [{ name: 'primitive' }, 1]
        plainObject = { name: 'plain object' }
      }

      const m = new MyModel()
      const result = m.toObject()

      expect(result).toMatchObject({
        'id': 1,
        'model': {
          'name': 'related model'
        },
        'listOfAny': [
          {
            'name': 'related model 2'
          },
          [
            {
              'name': 'related model'
            }
          ],
          1,
          {
            'name': 'name'
          }
        ],
        'collection': [
          {
            'name': 'related model'
          }
        ],
        'listOfPrimitives': [
          {
            'name': 'primitive'
          },
          1
        ],
        'plainObject': {
          'name': 'plain object'
        }
      })
    })

  })

})

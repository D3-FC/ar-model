import ArModel from '../../../src/modules/Model/ArModel'
import { QueryContract } from '../../../src/modules/Model/QueryContract'
import { Dto } from '../../../src/modules/DAO/Dto'
import { ApiMock } from '../Query/ApiMock'
import { ArCollection } from '../../../src/modules/Collection/ArCollection'
import { ValidationError } from '../../../src/modules/Error/Validation/ValidationError'
import PropertyCollectionError from '../../../src/modules/Error/Validation/PropertyCollectionError'
import { PropertyError } from '../../../src/modules/Error/Validation/PropertyError'

describe('ArModel', () => {
  class QueryMock implements QueryContract {

    url?: string | ArModel
    payload?: Dto

    async delete (payload?: object, url?: string): Promise<any> {
      return undefined
    }

    expandUrl (url?: string | number | null): this {
      return this
    }

    async get (payload?: Dto, url?: string): Promise<any> {
      return undefined
    }

    async paginate (page?: number, perPage?: number): Promise<any> {
      return undefined
    }

    async post (payload?: object, url?: string): Promise<any> {
      this.url = url
      if (payload) { this.payload = payload }
      return 'response'
    }

    async put (payload?: object, url?: string): Promise<any> {
      return undefined
    }

    setPayload (payload: object): this {
      this.payload = payload
      return this
    }

    to (resource: string | ArModel): this {
      if (resource instanceof ArModel) {
        this.url = resource.constructor.name
      }
      this.url = resource
      return this
    }

    setCriteria (criteria: object): this {
      return this
    }
  }

  class QueryMockThrowableValidationError implements QueryContract {
    async delete (payload?: object, url?: string): Promise<any> {
      throw new ValidationError()
    }

    expandUrl (url?: string | number | null): this {
      return this
    }

    async get (payload?: Dto, url?: string): Promise<any> {
      throw new ValidationError()
    }

    async paginate (page?: number, perPage?: number): Promise<any> {
      throw new ValidationError()
    }

    async post (payload?: object, url?: string): Promise<any> {
      throw new ValidationError({
        errors: new PropertyCollectionError({
          errors: [new PropertyError({ key: 'name', value: 'required' })]
        })
      })
    }

    async put (payload?: object, url?: string): Promise<any> {
      throw new ValidationError()
    }

    setPayload (payload: object): this {
      return this
    }

    to (resource: string | ArModel): this {
      return this
    }

    setCriteria (criteria: object): this {
      return this
    }
  }

  class Model extends ArModel {
    constructor (data: Dto = {}) {
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

  describe('toObject and toRequest', () => {
    test('should return plain Object with keys of original model', () => {
      class MyModel extends Model {
        $idKey = 'id'
        id = 1
        model = new Model().fill({ name: 'related model' })
        listOfAny = [
          new Model().fill({ name: 'related model 2' }),
          new ArCollection([new Model().fill({ name: 'related model 3' })]),
          1,
          { name: 'name' }
        ]
        collection = new ArCollection([new Model().fill({ name: 'related model' })])
        listOfPrimitives = [{ name: 'primitive' }, 1]
        plainObject = { name: 'plain object' }
      }

      const m = new MyModel()
      const expected = {
        id: 1,
        model: { name: 'related model' },
        listOfAny: [{ name: 'related model 2' }, [{ name: 'related model 3' }], 1, { name: 'name' }],
        collection: [{ name: 'related model' }],
        listOfPrimitives: [{ name: 'primitive' }, 1],
        plainObject: { name: 'plain object' }
      }
      const result1 = m.toObject()
      const result2 = m.toObject()

      expect(result1).toMatchObject(expected)
      expect(result2).toMatchObject(expected)
    })
  })

  test('clear errors', async () => {
    class Model extends ArModel {
      constructor (data: Dto = {}) {
        super(new ApiMock())
      }

      protected query (): QueryContract {
        const q = new QueryMock()
        q.post = () => {
          throw new ValidationError({
            errors: new PropertyCollectionError({
              errors: [new PropertyError({ key: 'name', value: 'required' })]
            })
          })
        }
        return q
      }
    }

    const m = new Model()
    try {
      const result = await m.storeAction()
    } catch (e) {
      m.clearErrors()
      expect(m.hasError).toBeFalsy()
    }
  })

  describe('post', () => {
    test('should set validation error on model if validation Error was thrown from cb', async () => {
      class Model extends ArModel {
        constructor (data: Dto = {}) {
          super(new ApiMock())
        }

        protected query (): QueryContract {
          const q = new QueryMock()
          q.post = () => {
            throw new ValidationError({
              errors: new PropertyCollectionError({
                errors: []
              })
            })
          }
          return q
        }
      }

      const m = new Model()
      try {
        const result = await m.storeAction()
      } catch (e) {
        expect(m.errorsFor('name')).toEqual([])
        expect(m.errorFor('name')).toEqual('')
      }
    })

    test('should set validation error on model if validation Error was thrown from cb', async () => {
      class Model extends ArModel {
        constructor (data: Dto = {}) {
          super(new ApiMock())
        }

        protected query (): QueryContract {
          const q = new QueryMock()
          q.post = () => {
            throw new ValidationError({
              errors: new PropertyCollectionError({
                errors: [new PropertyError({ key: 'name', value: 'required' })]
              })
            })
          }
          return q
        }
      }

      const m = new Model()
      try {
        const result = await m.storeAction()
      } catch (e) {
        expect(m.errorsFor('name')).toEqual(['required'])
        expect(m.errorFor('name')).toEqual('required')
        expect(m.hasError).toBeTruthy()
      }
    })

    test('should set mocked query payload with "scheme" data', async () => {
      const q = new QueryMock()

      class Model extends ArModel {
        constructor (data: Dto = {}) {
          super(new ApiMock())
        }

        protected query (): QueryContract {
          return q
        }
      }

      const m = new Model()
      m.id = '111'
      const result = await m.storeAction()
      expect(q.payload).toEqual({ id: '111' })
    })
  })

  describe('merge', () => {
    test('should merge one model to another', async () => {
      class Model extends ArModel {
        constructor (data: Dto = {}) {
          super(new ApiMock())
        }
      }

      const m1 = new Model()
      m1.name = 'name 1'
      const m2 = new Model()
      m2.id = 'new id'
      m2.name = 'name 2'
      m2.merge(m1)
      expect(m2.toObject()).toEqual({ id: 'new id', name: 'name 1' })
    })

    test('changing model2 should not lead changes in model1', async () => {
      class Model extends ArModel {
        constructor (data: Dto = {}) {
          super(new ApiMock())
        }
      }

      const m1 = new Model()
      m1.name = 'name 1'
      const m2 = new Model()
      m2.name = 'name 2'
      m2.merge(m1)
      m2.name = 'name 2'
      expect(m1.name).toEqual('name 1')
    })
  })

  test('restore from snapshot', async () => {
    class Model extends ArModel {
      constructor (data: Dto = {}) {
        super(new ApiMock())
        this.fill(data)
      }
    }

    const m1 = new Model({ name: 'name' })
    m1.snapshot()
    m1.name = 'name 1'
    m1.reset()
    expect(m1.name).toEqual('name')
  })

  describe('clone', async () => {
    class Model extends ArModel {
      constructor (data: Dto = {}) {
        super(new ApiMock())
        this.fill(data)
      }
    }

    test('nested date should be cloned', async () => {
      const m1 = new Model({
        date: new Date()
      })
      const m2 = m1.clone()
      m1.date.setHours(5)
      expect(m2.date === m1.date).toBeFalsy()
    })
    test('nested expanded date should be cloned', async () => {
      class ExpandedDate extends Date {
        clone () {
          return new ExpandedDate(this)
        }
      }

      const m1 = new Model({
        date: new ExpandedDate()
      })
      const m2 = m1.clone()
      m1.date.setHours(5)
      expect(m2.date === m1.date).toBeFalsy()
      expect(m2.date).toBeInstanceOf(ExpandedDate)
    })
    test('nested object should be cloned', async () => {
      const m1 = new Model({
        object1: {
          object2: {
            name: 1
          }
        }
      })
      const m2 = m1.clone()
      m1.object1.object2.name = 2
      expect(m2.object1.object2.name).toEqual(1)
    })
    test('nested array should be cloned', async () => {
      const m1 = new Model({
        arr1: [
          {
            arr2: [
              1
            ]
          }
        ]
      })
      const m2 = m1.clone()
      m1.arr1[0].arr2[0] = 2
      expect(m2.arr1[0].arr2[0]).toEqual(1)
    })
    test('nested Model should be cloned', async () => {
      const m1 = new Model({
        mNested1: new Model({
          mNested2: new Model({
            name: 1
          })
        })
      })
      const m2 = m1.clone()
      m1.mNested1.mNested2.name = 2
      expect(m2.mNested1.mNested2.name).toEqual(1)
    })
    test('nested ArCollection should be cloned', async () => {
      const m1 = new ArCollection([
        new Model({
          cl: new ArCollection([
            new Model({
              name: 1
            })
          ])
        })
      ])
      const m2 = m1.clone()
      m1.first.cl.first.name = 2
      expect(m2.first.cl.first.name).toEqual(1)
    })
  })
})

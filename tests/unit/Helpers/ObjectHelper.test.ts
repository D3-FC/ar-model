import { objectPropsToCamelCase } from '../../../src/modules/Helper/ObjectHelper'

describe('ObjectHelpers', () => {
  test('objectPropsToCamelCase', () => {
    const data = {
      some_name: 'some name',
      relation_one: {
        some_name: 'some name'
      },
      relation_list: [
        {
          some_name: 'some name'
        }
      ]
    }
    const expected = {
      someName: 'some name',
      relationOne: {
        someName: 'some name'
      },
      relationList: [
        {
          someName: 'some name'
        }
      ]
    }

    const result = objectPropsToCamelCase(data)
    expect(result).toEqual(expected)
  })
})

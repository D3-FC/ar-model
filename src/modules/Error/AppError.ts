import { Dao } from '../DAO/Dao'

export class AppError extends Error {
  message: string = 'Woops! Something went wrong. :('

  constructor (data: Dao = {}) {
    super()
  }
}

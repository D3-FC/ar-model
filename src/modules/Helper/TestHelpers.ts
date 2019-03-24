export async function expectThrow (cb: Function, error: any) {
  try {
    await cb()
  } catch (e) {
    expect(e).toBeInstanceOf(error)
  }
}

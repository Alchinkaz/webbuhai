export type Warehouse = {
  id: string
  name: string
  type: string
  resourceCount: number
}

export type Resource = {
  id: string
  warehouseId: string
  name: string
  type: string
  quantity: number
  unit: string
  price: number
}

export interface Asset {
  name: string
  headers : {
    'content-type': string,
    'content-length': number
  }
  file: Buffer
}

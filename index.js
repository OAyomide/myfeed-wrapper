import axios from 'axios'

class Wrapper {
  constructor(token) {
    this.token = token
    super()
  }


  //encoding encodes the user token as per the docs, to make the request tot eh endpoint
  encode() {
    return Buffer.from(this.token).toString('base64')
  }
}
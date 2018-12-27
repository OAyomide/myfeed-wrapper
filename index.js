import axios from 'axios'

class Wrapper {
  constructor(token) {
    this.token = token
    super()
  }

  async playerStats(name, options) {
    try {
      const { season, date, team, rosterstatus, player, position, country, sort, offset, limit, force, format } = options
      const fmt = format || 'json'
      const request = await axios({
        method: 'get',
        url: `https://api.mysportsfeeds.com/v2.0/pull/nhl/players.${fmt}`
      })
      return request.data
    } catch (e) {
      console.log(`ERROR FINDING THE PLAYER SCORES`)
    }
  }


  //encoding encodes the user token as per the docs, to make the request tot eh endpoint
  encode() {
    return Buffer.from(this.token).toString('base64')
  }
}
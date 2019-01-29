const axios = require('axios')
const _ = require('lodash')
const Btoa = () => Buffer.from('API-KEY HERE').toString('base64') // TODO: Get this from the instantiation of the class

/**
 *@description a class for the endpoints to get the data needed from mysportsfeed
 */
class Feed {
  /**
   * @description this constructor takes the gameID as argument
   * @param {string} gameId the game ID of the tournament
   */
  constructor(gameId) {
    this.gameID = gameId
  }
  /**
   * @description gets the winning team for a particualar game
   * @return {string|number} the winning team
   */
  async WinningTeam() {
    try {
      const request = await axios({
        method: 'get',
        url: `https://api.mysportsfeeds.com/v2.0/pull/nhl/current/games/${this.gameID}/playbyplay.json?playtype=goal&period=1`,
        headers: {
          'Authorization': 'Basic ' + Btoa()
        }
      })
      const { abbreviation: winner }  = request.data.plays[0].goal.team
      return winner
    } catch (e) {
      throw new Error('Error getting the win team')
    }
  }

  /**
   * @description a method that allows us precalculate what score a player shot.
   * @param {string} playername name of the player we want to get their name
   * @return {string|number} the player score
   */
  async PlayerScore(playername) {
    try {
      const request = await axios({
        method: 'get',
        url: `https://api.mysportsfeeds.com/v2.0/pull/nhl/current/games/${this.gameID}/boxscore.json`,
        headers: {
          'Authorization': 'Basic ' + Btoa()
        }
      })

      const { players: awayPlayers } = request.data.stats.away
      const { players: homePlayers } = request.data.stats.home

      const arr = []
      for (const player of awayPlayers) {
        const playerScore = player.playerStats[0].scoring.goals
        const name = `${player.player.firstName} ${player.player.lastName}`
        const obj = {
          name: name,
          score: playerScore
        }
        arr.push(obj)
      }

      for (const player of homePlayers) {
        const playerScore = player.playerStats[0].scoring.goals
        const name = `${player.player.firstName} ${player.player.lastName}`
        const obj = {
          name: name,
          score: playerScore
        }
        arr.push(obj)
      }

      const { score } = _.find(arr, (x) => x.name === playername)
      return score
    } catch (e) {
      throw new Error('Error getting the player score')
    }
  }

  /**
   * @description WinningScore returns the highest score between the teams in a game
   * @param {string} gameId
   * @return {string} the response
   */
  async WinningScore() {
    try {
      const request = await axios({
        method: 'get',
        url: `https://api.mysportsfeeds.com/v2.0/pull/nhl/current/games/${this.gameID}/playbyplay.json?playtype=goal`,
        headers: {
          'Authorization': 'Basic ' + Btoa()
        }
      })

      return request.data
    } catch (e) {
      throw new Error(`ERROR GETTING THE WINNING SCORE FROM THE ENPOINT`, e)
    }
  }

  /**
   * @description this method returns the total goals scored in the tournament
   * @param {string} param the team to find the total score. If empty, the sum of the home and away scores are returned
   * @return {string|number} the total goals scored in the tournament
   */
  async TotalGoals(param) {
    try {
      const request = await axios({
        method: 'get',
        url: `https://api.mysportsfeeds.com/v2.0/pull/nhl/current/games/${this.gameID}/boxscore.json`,
        headers: {
          'Authorization': 'Basic ' + Btoa()
        }
      })

      const { scoring } = request.data
      if (!param) {
        // we want to get the scores of both home and away team. Adding them together
      // will give us the total game score
        const { awayScoreTotal, homeScoreTotal } = scoring
        const totalScore = awayScoreTotal + homeScoreTotal
        return totalScore
      }
      const team = param.toLowerCase()
      if (team === 'home') {
        return scoring.homeScoreTotal
      } else if (team === 'away') {
        return scoring.awayScoreTotal
      }
    } catch (e) {
      throw new Error(`Error getting the total goals in the tournament::${e}`)
    }
  }

  /**
   *
   * @param {string} param the team we want to get the total shots played
   * @return {string} the team that shot the highest number of shots
   */
  async TotalShots(param) {
    try {
      const request = await axios({
        method: 'get',
        url: `https://api.mysportsfeeds.com/v2.0/pull/nhl/current/games/${this.gameID}/playbyplay.json?playtype=shot`,
        headers: {
          'Authorization': 'Basic ' + Btoa()
        }
      })
      const { plays, game } = request.data
      const { homeTeam, awayTeam } = game
      const home = homeTeam.abbreviation
      const away = awayTeam.abbreviation
      const ps = plays.map((x, y) => {
        return {
          firstName: x.shotAttempt.shootingPlayer.firstName,
          lastName: x.shotAttempt.shootingPlayer.lastName,
          team: x.shotAttempt.team.abbreviation
        }
      })

      const count = _.countBy(ps, (x) => {
        return x.team
      })

      if (!param) {
        return null
      }

      const team = param.toLowerCase()

      if (team === 'away') {
        const result = count[away]
        return result
      } else if (team === 'home') {
        const result = count[home]
        return result
      } else {
        return null
      }
    } catch (e) {
      throw new Error(`ERROR GETTING ALL SHOTS: ${e}`)
      //console.log(`ERROR GETTING ALL SHOTS`, e)
    }
  }

  /**
   * @description the class method to get the powerplay for a team for a particular game
   * @param {string} param the team we want to get the power play for
   * @return {number} the power play for the particular team
   */
  async PowerPlay(param) {
    try {
      const { data } = await axios({
        method: 'get',
        url: `https://api.mysportsfeeds.com/v2.0/pull/nhl/current/games/${this.gameID}/playbyplay.json?playtype=penalty`,
        headers: {
          'Authorization': 'Basic ' + Btoa()
        }
      })

      const { plays, game } = data
      const { homeTeam, awayTeam } = game
      const home = homeTeam.abbreviation
      const away = awayTeam.abbreviation
      const ps = plays.map((x, y) => {
        return {
          team: x.penalty.team.abbreviation,
        }
      })

      const count = _.countBy(ps, (x) => {
        return x.team
      })

      if (!param) {
        throw new Error ('TEAM NOT PASSED. CANNOT FIND THE POWERPLAY FOR AN UNENTERED TEAM')
      }
      const team = param.toLowerCase()

      if (team === 'home') {
        return count[away]
      } else if (team === 'away') {
        return count[home]
      }
    } catch (e) {
      return e
      // console.log(`ERROR GETTING THE POWER PLAY FOR THE TEAM`)
    }
  }
}

module.exports = { Feed }
// const API = new Feed()
// module.exports = { API }

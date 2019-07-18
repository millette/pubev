'use strict'

// npm
const searchUsers = require('rollodeqc-gh-search-users-all')
const hq = require('hyperquest')
const JSONStream = require('jsonstream')
const pThrottle = require('p-throttle')
const pick = require('lodash.pick')
// const pRetry = require('p-retry')

const location = [
  'repentigny',
  'brossard',
  'drummondville',
  'granby',
  'rimouski',
  'sherbrooke',
  'saguenay',
  'chicoutimi',
  'gatineau',
  'laval',
  'longueil',
  'lévis',
  'trois-rivières',
  'terrebonne',
  'yul',
  'montréal',
  'mtl',
  'québec',
  'qc'
]

const query = { o: { location, type: 'user' }, order: 'asc', sort: 'joined' }

// blocked by these users
const following = {
  457296: { id: 457296, login: 'michaelpaquette' },
  615440: { id: 615440, login: 'danielricci' },
  505688: { id: 505688, login: 'psyomn' },
  719796: { id: 719796, login: 'mathdeziel' },
  2342405: { id: 2342405, login: 'mirsaeedi' },
  2364632: { id: 2364632, login: 'ngrigoriev' },
  2625886: { id: 2625886, login: 'ggirard07' },
  3092838: { id: 3092838, login: 'gaudreaujacksoncharles' },
  3188853: { id: 3188853, login: 'fredericplante' },
  5373064: { id: 5373064, login: 'banctilrobitaille' },
  5426916: { id: 5426916, login: 'robotustra' },
  5527618: { id: 5527618, login: 'aLoneStrider' },
  5906650: { id: 5906650, login: 'PapaIbrahimaSene' },
  6231440: { id: 6231440, login: 'jacobrs' },
  6589067: { id: 6589067, login: 'bananemure' },
  7339076: { id: 7339076, login: 'dannycolin' },
  7477547: { id: 7477547, login: 'SKhoo' },
  7544240: { id: 7544240, login: 'DonavanMartin' },
  7634110: { id: 7634110, login: 'Makabey' },
  9411699: { id: 9411699, login: 'drew7721' },
  9595728: { id: 9595728, login: 'dt-rush' },
  10172301: { id: 10172301, login: 'tommyforlini' },
  10481637: { id: 10481637, login: 'polyponik' },
  10710596: { id: 10710596, login: 'Shmeve' },
  11246769: { id: 11246769, login: 'hallshouse' },
  11443637: { id: 11443637, login: 'Paramethod' },
  11564379: { id: 11564379, login: 'igelinas' },
  11967869: { id: 11967869, login: 'platonik93' },
  13917350: { id: 13917350, login: 'Pat559' },
  16087328: { id: 16087328, login: '0x72D0' },
  16311107: { id: 16311107, login: 'Varmoes' },
  16513007: { id: 16513007, login: 'Kalahee' },
  16640625: { id: 16640625, login: 'aboulfad' },
  16748284: { id: 16748284, login: 'WrightLiam' },
  16778995: { id: 16778995, login: 'offol' },
  16808836: { id: 16808836, login: 'CheesyBurrito' },
  18422723: { id: 18422723, login: 'alishobeiri' },
  21031246: { id: 21031246, login: '2b32dn' },
  21992112: { id: 21992112, login: 'Smockwal' },
  22141664: { id: 22141664, login: 'CharlesJebalitherson' },
  22298876: { id: 22298876, login: 'pldelisle' },
  24725635: { id: 24725635, login: 'sebastiancastroobando' },
  24948522: { id: 24948522, login: 'hfakouri' },
  25057940: { id: 25057940, login: 'vaquierm' },
  25408746: { id: 25408746, login: 'cgtcc' },
  25458003: { id: 25458003, login: 'elliottl' },
  29841989: { id: 29841989, login: 'mounirch13' },
  31779709: { id: 31779709, login: 'yingjie-xu' },
  31940190: { id: 31940190, login: 'MaximeGoyette' },
  33403539: { id: 33403539, login: 'arnaveenkumar' },
  34556464: { id: 34556464, login: 'MikaelAbehsera' },
  35231902: { id: 35231902, login: 'rebeccagarner' },
  35378512: { id: 35378512, login: 'john412smith' },
  35871757: { id: 35871757, login: '0xc0ffeee' },
  37561740: { id: 37561740, login: 'wperron' },
  43446063: { id: 43446063, login: 'Vaatik' },
  53022164: { id: 53022164, login: 'Ben3ayed' }
}

const gotUser = (user) => {
  following[user.id] = { id: user.id, login: user.login }
  // console.log('USER:', user)
}

const dealWithX = (x) => {
  const ya = x[0].trim().slice(1, -1)
  // console.log('X:', x, ya)
  return ya
}

const nextLink = (h) => h.link && h.link
  .split(',')
  .map((x) => x.split(';'))
  .filter((x) => x[1].indexOf('next') !== -1)
  .map(dealWithX)[0]

/*
const onePage = (u) => {
  // pRetry
  return onePageImp(u)
}
*/

const onePage = (u) => new Promise((resolve, reject) => {
  // setTimeout(() => {
  if (!u) { u = `https://api.github.com/user/following?per_page=100` }
  // console.log('U:', u)
  const headers = {
    authorization: `token ${process.env.GITHUB_TOKEN}`,
    'user-agent': 'pubev'
  }
  // console.log('H:', u, headers)

  let next
  hq(u, { headers }, (err, res) => {
    if (err) {
      console.log('ERR1', err, u)
      return reject(err)
    }
    next = nextLink(res.headers)
    // console.log('NEXTLINK:', next)
  })
    .pipe(JSONStream.parse('*'))
    .on('data', gotUser)
    .on('end', () => { resolve(next) })
    .on('error', (err2) => {
      console.log('ERR2', err2, u)
      reject(err2)
    })
  // }, 5000)
})

const initFollowing = (p) => onePage(p).then((x) => x && initFollowing(x))
const simpler = (x) => pick(x, ['id', 'login'])

const follow = (d) => {
  d = Object.assign({}, d)
  const u = `https://api.github.com/user/following/${d.login}`
  const headers = {
    authorization: `token ${process.env.GITHUB_TOKEN}`,
    'user-agent': 'pubev'
  }
  return new Promise((resolve, reject) => {
    hq
      .put(u, { headers }, (err, res) => {
        if (err) {
          console.error('FOLLOW ERR:', err)
          return reject(err)
        }
        console.log('follow-step1', d.login, res.statusCode) // expect 204
        d.statusCode1 = res.statusCode
        resolve(d)
        // verify...
        /*
        // following[d.id] = { id: d.id, login: d.login }
        following[d.id] = simpler(d)
        resolve({ login: d.login, statusCode: res.statusCode })
        */
      })
      .end()
  })
    .then((d) => new Promise((resolve, reject) => {
      hq(u, { headers }, (err, res) => {
        if (err) {
          console.error('FOLLOW-confirm ERR:', err)
          return reject(err)
        }
        console.log('follow-step2', d.login, res.statusCode) // expect 204
        if (res.statusCode === 204) {
          following[d.id] = Object.assign({}, d)
          return resolve({
            login: d.login,
            statusCode1: d.statusCode,
            statusCode2: res.statusCode
          })
        }

        if (res.statusCode === 404) {
          const d2 = Object.assign({}, d)
          d2.blockedBy = true
          following[d.id] = d2
          return resolve({
            blockedBy: true,
            id: d.id,
            login: d.login,
            statusCode1: d.statusCode,
            statusCode2: res.statusCode
          })
        }
        return reject(new Error(`Unexpected status code: ${res.statusCode}`))

      // following[d.id] = { id: d.id, login: d.login }
      // following[d.id] = simpler(d)
      // resolve({ login: d.login, statusCode1: d.statusCode, statusCode2: res.statusCode })
      })
    }))
/*
  .then(({ login, statusCode }) => {
    return { login, statusCode }
  })
*/
}

const tFollow = pThrottle(follow, 1, 37000) // 5 or 12

const loop = () => searchUsers(query)
  .then((x) => {
    console.error(JSON.stringify(x.headers, null, ' '))
    x.items = x.items.map(simpler)
    const toFollow = x.items.filter((z) => !following[z.id])
    const alreadyFollow = x.items.filter((z) => following[z.id])
    const renamed = alreadyFollow.filter((z) => z.login !== following[z.id].login)
    console.log('toFollow:', toFollow.length, toFollow.slice(0, 30))
    console.log('alreadyFollow:', alreadyFollow.length, alreadyFollow.slice(0, 30))
    console.log('renamed:', renamed.length, renamed.slice(0, 30))
    return Promise.all(toFollow.map(tFollow))
    // return { toFollow, alreadyFollow, renamed }
  })
  //  .then(({ toFollow, alreadyFollow, renamed }) => {
  .then((x) => {
    console.log('X:', x.length, x.slice(0, 30))
    /*
    console.log('toFollow:', toFollow.length, toFollow)
    console.log('alreadyFollow:', alreadyFollow.length, alreadyFollow)
    console.log('renamed:', renamed.length, renamed)
*/
    console.log('following:', Object.keys(following).length)
  })
  .catch(console.error)

const run = () => initFollowing()
  .then(loop)
  .then(() => setInterval(loop, 4 * 60 * 60 * 1000))

if (require.main === module) {
  run()
    .then(() => console.log('OK'))
    .catch(console.error)
} else {
  module.exports = run
}

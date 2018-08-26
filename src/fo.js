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
  // new blocks
  // 2018-08-25 16h00
  719796: { id: 719796, login: 'mathdeziel' },

  // confirmed blocks
  // 2018-08-24 12h15
  24948522: { id: 24948522, login: 'hfakouri' },
  // 2018-08-24 12h15
  6589067: { id: 6589067, login: 'bananemure' },
  // 2018-08-24 21h42
  29841989: { id: 29841989, login: 'mounirch13' },
  // 2018-08-24 21h42
  3092838: { id: 3092838, login: 'gaudreaujacksoncharles' },
  // 2018-08-24 21h55
  505688: { id: 505688, login: 'psyomn' },
  // 2018-08-24 21h55
  25057940: { id: 25057940, login: 'vaquierm' },
  // 2018-08-24 22h52
  6231440: { id: 6231440, login: 'jacobrs' },
  // 2018-08-24 22h52
  11443637: { id: 11443637, login: 'Paramethod' },
  // 2018-08-25 13h03
  7477547: { id: 7477547, login: 'SKhoo' },
  // 2018-08-25 13h03
  9411699: { id: 9411699, login: 'drew7721' },
  // 2018-08-25 14h05
  5426916: { id: 5426916, login: 'robotustra' },
  // 2018-08-25 14h05
  7634110: { id: 7634110, login: 'Makabey' },
  // 2018-08-25 14h16
  25408746: { id: 25408746, login: 'cgtcc' },
  // 2018-08-25 15h51
  7339076: { id: 7339076, login: 'dannycolin' },
  // 2018-08-25 15h51
  18422723: { id: 18422723, login: 'alishobeiri' },
  // 2018-08-25 16h00
  24725635: { id: 24725635, login: 'sebastiancastroobando' },

  // 2018-08-25 16h47
  33403539: { id: 33403539, login: 'arnaveenkumar' },
  // 2018-08-25 16h47
  16778995: { id: 16778995, login: 'offol' },
  // 2018-08-25 16h47
  10172301: { id: 10172301, login: 'tommyforlini' },

  // 2018-08-25 16h55
  5527618: { id: 5527618, login: 'aLoneStrider' },
  // 2018-08-25 16h55
  35378512: { id: 35378512, login: 'john412smith' },
  // 2018-08-25 16h55
  35871757: { id: 35871757, login: '0xc0ffeee' },

  // 2018-08-25 20h15
  11246769: { id: 11246769, login: 'hallshouse' },

  // 2018-08-25 22h54
  9595728: { id: 9595728, login: 'dt-rush' },

  /*
  // 2018-08-24 15h
  20388583: { id: 20388583, login: 'pbgnz' },
  // 2018-08-24 15h
  27744779: { id: 27744779, login: 'smbatchouAI' },
  // 2018-08-25 14h16
  1678267: { id: 1678267, login: 'devsepaq' },
  // 2018-08-25 16h00
  34557455: { id: 34557455, login: 'krishnasubramani' },
  // 2018-08-25 17h50
  8812813: { id: 8812813, login: 'PhilBoileau' },
  // 2018-08-25 17h50
  31141151: { id: 31141151, login: 'MincuTudor' },
  // 2018-08-25 17h50
  37969996: { id: 37969996, login: 'ntaff' },

  // 2018-08-25 20h15
  37510886: { id: 37510886, login: 'leaveswoods' },
  // 2018-08-25 20h15
  30392487:{ id: 30392487, login: 'Jobine23' },

  // 2018-08-25 20h27
  30525912: { id: 30525912, login: 'PranavBhatia' },
  // 2018-08-25 20h27
  30784101: { id: 30784101, login: 'jcj2249' },
  // 2018-08-25 20h27
  33300743: { id: 33300743, login: 'AlexandreKang' },

  // 2018-08-25 22h54
  38704826: { id: 38704826, login: 'soureya' },

  // 2018-08-25 22h54
  39058840: { id: 39058840, login: 'AntoineLegare' },

  // Next check
  30874966: { id: 30874966, login: 'jifbrodeur' },
  32043245:{ id: 32043245, login: 'madoyon' },
  23446793: { id: 23446793, login: 'sbelharbi' },
  */

  // old blocks
  26785194: { id: 26785194, login: 'ashu6811' },
  28959453: { id: 28959453, login: 'RamiKhalil' },
  39995531: { id: 39995531, login: 'JPLarouche' },
  30480951: { id: 30480951, login: 'gabrielkarras' },
  31040756: { id: 31040756, login: 'Moo-Marc' },
  35788041: { id: 35788041, login: 'anolapalme' },
  35875790: { id: 35875790, login: 'AnaVictoriaLu' },
  36213682: { id: 36213682, login: 'kimnng' },
  41904070: { id: 41904070, login: 'jomtl' },
  10710596: { id: 10710596, login: 'Shmeve' },
  2364632: { id: 2364632, login: 'ngrigoriev' },
  32909203: { id: 32909203, login: 'KevinMwa' },
  39062756: { id: 39062756, login: 'mferderber' },
  37561740: { id: 37561740, login: 'wperron' },
  39343849: { id: 39343849, login: 'mic79' },
  3188853: { id: 3188853, login: 'fredericplante' },
  17690259: { id: 17690259, login: 'Sterithium' },
  14837233: { id: 14837233, login: 'lucasdeschamps' },
  16139396: { id: 16139396, login: 'kiwikik' },
  36643607: { id: 36643607, login: 'carla-doyle' },
  36831295: { id: 36831295, login: 'vbordalo' },
  2625886: { id: 2625886, login: 'ggirard07' },
  2342405: { id: 2342405, login: 'mirsaeedi' },
  18427998: { id: 18427998, login: 'xanderhades' },
  22452192: { id: 22452192, login: 'srsohn' },
  13615467: { id: 13615467, login: 'VinceLambert' },
  14182238: { id: 14182238, login: 'marechal-p' },
  14793470: { id: 14793470, login: 'benjimaclellan' },
  9895004: { id: 9895004, login: 'rfarouni' },
  11354804: { id: 11354804, login: 'diordonez' },
  11360131: { id: 11360131, login: 'coreyarms' },
  11820997: { id: 11820997, login: 'ninkle' },
  12099546: { id: 12099546, login: 'zulander1' },
  12940089: { id: 12940089, login: 'enadeau' },
  12969088: { id: 12969088, login: 'myaa2913' },
  39284029: { id: 39284029, login: 'Nillikis' },
  39303895: { id: 39303895, login: 'cedguill03' }
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

const tFollow = pThrottle(follow, 5, 9000) // 5 or 12

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

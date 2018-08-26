'use strict'

// core
const fs = require('fs')

// npm
const hq = require('hyperquest')
const JSONStream = require('jsonstream')
const range = require('lodash.range')
const omitDeepLodash = require('omit-deep-lodash')
const pify = require('pify')

const om1 = [
  'gravatar_id',
  'url',
  // anything that ends with _url
  'archive_url',
  'assignees_url',
  'avatar_url',
  'blobs_url',
  'branches_url',
  'clone_url',
  'collaborators_url',
  'comments_url',
  'commits_url',
  'compare_url',
  'contents_url',
  'contributors_url',
  'deployments_url',
  'downloads_url',
  'events_url',
  'followers_url',
  'following_url',
  'forks_url',
  'gists_url',
  'git_commits_url',
  'git_refs_url',
  'git_tags_url',
  'git_url',
  'hooks_url',
  'html_url',
  'issue_comment_url',
  'issue_events_url',
  'issues_url',
  'keys_url',
  'labels_url',
  'languages_url',
  'merges_url',
  'milestones_url',
  'notifications_url',
  'organizations_url',
  'pulls_url',
  'received_events_url',
  'releases_url',
  'repos_url',
  'ssh_url',
  'stargazers_url',
  'starred_url',
  'statuses_url',
  'subscribers_url',
  'subscription_url',
  'subscriptions_url',
  'svn_url',
  'tags_url',
  'teams_url',
  'trees_url'
]

let userId
const etags = {}
const fix = (v) => omitDeepLodash(v, om1)
const mkdirImp = pify(fs.mkdir)
const writeFile = pify(fs.writeFile.bind(fs))

const mkdir = (n) => mkdirImp(n)
  .catch((e) => e.code === 'EEXIST' ? Promise.resolve() : Promise.reject(e))
/*
  .catch((e) => {
    if (e.code === 'EEXIST') { return Promise.resolve() }
    return Promise.reject(e)
  })
*/

const writeEventFile = (d) => {
  if (!d) { return Promise.reject(new Error('Oupsy.')) }
  const dObj = new Date(d.created_at)
  const year = dObj.getFullYear()
  const month = dObj.getMonth() + 1
  const date = dObj.getDate()
  // actually, I don't think this will happen, NO_ACTOR
  const actor = '/' + ((d.actor && d.actor.id) || 'NO_ACTOR')
  const obj = { actor: d.actor && d.actor.login, createdAt: d.created_at, id: d.id, type: d.type }
  return mkdir('events')
    .then(() => mkdir(`events/${year}`))
    .then(() => mkdir(`events/${year}/${month}`))
    .then(() => mkdir(`events/${year}/${month}/${date}`))
    .then(() => mkdir(`events/${year}/${month}/${date}${actor}`))
    .then(() => mkdir(`events/${year}/${month}/${date}${actor}/${d.type}`))
    .then(() => writeFile(`events/${year}/${month}/${date}${actor}/${d.type}/${d.id}.json`, JSON.stringify(d), { flag: 'wx' }))
    // .then(() => { return { actor: d.actor && d.actor.login, createdAt: d.created_at, id: d.id, type: d.type, added: true } })
    .then(() => Object.assign({ added: true }, obj))
    .catch((e) => e.code === 'EEXIST'
      // ? Promise.resolve({ actor: d.actor && d.actor.login, createdAt: d.created_at, id: d.id, type: d.type, exists: true })
      ? Promise.resolve(Object.assign({ exists: true }, obj))
      : Promise.reject(e)
    )
/*
    .catch((e) => {
      if (e.code === 'EEXIST') {
        return Promise.resolve({ actor: d.actor && d.actor.login, createdAt: d.created_at, id: d.id, type: d.type, exists: true })
      }
      return Promise.reject(e)
    })
*/
}

const gotEvent = (d) => writeEventFile(d)
  .then((x) => x && x.added && console.log(JSON.stringify(x)))
  .catch(console.error)

const pscb = (p, err, res) => {
  if (err) { return console.error(`Error on page {$p}: ${err}`) }
  if (res.headers.etag) { etags[p] = res.headers.etag }
}

const pageStream = (p) => {
  const headers = {
    authorization: `token ${process.env.GITHUB_TOKEN}`,
    'user-agent': 'pubev'
  }
  if (etags[p]) { headers['if-none-match'] = etags[p] }
  const u = `https://api.github.com/user/${userId}/received_events/public?page=${p}`
  return hq(u, { headers }, pscb.bind(null, p))
}

const doPage = (p) => pageStream(p)
  .pipe(JSONStream.parse('*', fix))
  .on('data', gotEvent)
  .on('end', () => console.log(new Date().toISOString(), p))
  .on('error', (e) => console.error('on error', e))
//  .setMaxListeners(25)

const doPages = (n) => {
  if (!n) { n = 1 }
  range(1, n + 1)
    .reverse()
    .forEach(doPage)
}

const idFromToken = () => new Promise((resolve, reject) =>
  hq('https://api.github.com/user', {
    headers: {
      authorization: `token ${process.env.GITHUB_TOKEN}`,
      'user-agent': 'pubev'
    }
  })
    .pipe(JSONStream.parse('id'))
    .on('data', resolve)
    .on('error', reject)
)

const run = () => idFromToken()
  .then((id) => {
    userId = id
    doPages(10)
    return setInterval(doPages, 3 * 60 * 1000)
  })

if (require.main === module) {
  run()
} else {
  module.exports = run
}

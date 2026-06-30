import https from 'https'

const options = {
  hostname: 'oauth.yandex.ru',
  port: 443,
  path: '/',
  method: 'GET'
}

const req = https.request(options, (res) => {
  console.log('✅ Status:', res.statusCode)
})

req.on('error', (error) => {
  console.error('❌ Error:', error.message)
})

req.end()
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
const mongoose = require('mongoose')
const dns = require('dns')
const urlParser = require('url')

const urls = mongoose.model('urls', new mongoose.Schema({
    original_url: {type: String},
    short_url: {type: Number}
}))

// Basic Configuration
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.urlencoded({extended: true}))
app.use('/public', express.static(`${process.cwd()}/public`))

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
})

// API endpoints
app.post('/api/shorturl', async function(req, res) {
  let counted = await urls.estimatedDocumentCount()
  const url = req.body.url
  
  dns.lookup(urlParser.parse(url).hostname, async (err, value) => {
    if (!value) {
      res.json({ error: 'invalid url' }
      )}
    else {
    await urls.create({ original_url : req.body.url, short_url : counted})
    res.json({ original_url : req.body.url, short_url : counted})
      }
    })
  })

app.get('/api/shorturl/:id', async (req,res) => {
  const pageObj = await urls.findOne({short_url: req.params.id})
  res.redirect(pageObj.original_url)
})

const start = async() => {
await mongoose.connect(process.env.MONGO_URI)
app.listen(port, function() {
  console.log(`Listening on port ${port}`)
})}

start()

const express = require('express')
const http = require('http')
const path = require('path')
const WebSocket = require('ws')
const fs = require('fs')

const app = express()
const PORT = 3000

const server = http.createServer(app)

const wss = new WebSocket.Server({ server })

wss.on('connection', ws => {
	function sendTime() {
		const currentTime = new Date().toLocaleTimeString()
		ws.send(`время: ${currentTime}`)
	}
	

	const interval = setInterval(sendTime, 1000)
	ws.on('close', () => {
		clearInterval(interval)
	})
})

app.get('/time', (req, res) => {
	res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
    </head>
    <body>
      <p class="time"></p>
      <script>
        const ws = new WebSocket('ws://localhost:${PORT}');
        ws.onmessage = (event) => {
          document.querySelector('.time').innerText = event.data;
        };
      </script>
    </body>
    </html>
  `)
})

app.get('/download', (req, res) => {
	const example = path.join(__dirname, 'public', 'docs', 'example.pdf')
	res.send(`скачивание`)
	res.download(example)
})

function admin(req, res, next) {
	if (req.headers['x-admin'] == 'true') next()
	else res.status(403).send('доступ запрещен')
}

app.get('/admin', admin, (req, res) => {
	const files = path.join(__dirname, 'public')
	fs.readdir(files, (err, data) => {
		if (err) return res.status(500).send('ошибка сервера')
		res.send(`<ul>${data.map(file => `<li>${file}</li>`).join('')}</ul>`)
	})
})

server.listen(PORT, () => {
	console.log(`Сервер запущен на http://localhost:${PORT}`)
})

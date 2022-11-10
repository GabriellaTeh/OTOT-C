require('dotenv').config()

const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

app.use(express.json())

const posts = [
    {
        name: 'Kyle',
        title: 'Post 1'
    },
    {
        name: 'Jim',
        title: 'Post 2'
    }
]

let users = []

app.get('/posts', authenticateToken, (req, res) => {
    res.json(posts.filter(post => post.name === req.user.name))
})

app.get('/users', (req, res) => {
    res.json(users)
})

app.post('/signup', async (req, res) => {
    try {
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(req.body.password, salt)
        const user = { name: req.body.name, password: hashedPassword }
        users.push(user)
        res.status(201).json({message: 'User created'})
    } catch {
        res.status(500).send()
    }
})

app.post('/login', async (req, res) => {
    const user = users.find(user => user.name = req.body.name)
    if (user == null) {
        return res.status(400).send('Cannot find user')
    }
    try {
        if (await bcrypt.compare(req.body.password, user.password)) {
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
            res.json({message: 'Logged in', accessToken: accessToken})
        } else {
            res.json({message: 'Not allowed'})
        }
    } catch {
        res.status(500).send()
    }
})

app.post('/logout', (req, res) => {

})

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(" ")[1]
    if (token == null) {
        return res.sendStatus(400)
    } 
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30s'}, (err, user) => {
        if (err) return res.sendStatus(403)
        req.user = user
        next()
    })
}

app.listen(8080, () => console.log("Server started"))
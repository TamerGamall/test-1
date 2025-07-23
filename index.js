const express = require('express');
const path = require('path')
const fs = require('fs')
const multer = require('multer')

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/")
    },
    filename: (req, file, cb) => {
        cb(null, `image-${Date.now()}-${file.originalname}`)
    }
})
const upload = multer(
    {
        storage: storage,
        limits: {
            fileSize: 1 * 1024 * 1024,
            files: 2
        },
        fileFilter: (req, file, cb) => {
            const allowedTypes = ['image/jpeg', 'image/png'];
            if (allowedTypes.includes(file.mimetype)) {
                cb(null, true)
            } else {
                cb(new Error('Only JPG and PNG files are allowed'));
            }
        }

    });

const app = express()
// midleware 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(express.static(path.join(__dirname, 'public')));



app.listen(3000, () => {
    console.log('Server is running on port 3000');
})




// home
app.get('/', (req, res) => {
    res.send("/Home_1")
})

//upload
app.post('/upload', upload.array("photos"), (req, res) => {
    res.send('File uploaded successfully!');
})

//get users
app.get('/users', (req, res) => {
    fs.readFile('db.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading users file');
        }
        res.send(JSON.parse(data));
    });
});

//get user by id
app.get('/users/:id', (req, res) => {
    const userId = req.params.id;
    fs.readFile('db.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading users file');
        }
        const users = JSON.parse(data);
        const user = users.find(u => u.id === parseInt(userId));
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.send(user);
    });
});
// add user
app.post('/users', (req, res) => {
    const newUser = req.body;
    fs.readFile('db.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading users file');
        }
        const users = JSON.parse(data);
        newUser.id = users.length + 1; // Simple ID assignment
        users.push(newUser);
        fs.writeFile('db.json', JSON.stringify(users, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error saving user');
            }
            res.status(201).send(newUser);
        });
    });
})
// update user
app.put('/users/:id', (req, res) => {
    const userId = req.params.id;
    const updatedUser = req.body;
    fs.readFile('db.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading users file');
        }
        const users = JSON.parse(data);
        const userIndex = users.findIndex(u => u.id === parseInt(userId));
        if (userIndex === -1) {
            return res.status(404).send('User not found');
        }
        users[userIndex] = { ...users[userIndex], ...updatedUser };
        fs.writeFile('db.json', JSON.stringify(users, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error saving user');
            }
            res.send(users[userIndex]);
        });
    });
});
// delete user
app.delete('/users/:id', (req, res) => {
    const userId = req.params.id;
    fs.readFile('db.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading users file');
        }
        let users = JSON.parse(data);
        const userIndex = users.findIndex(u => u.id === parseInt(userId));
        if (userIndex === -1) {
            return res.status(404).send('User not found');
        }
        users.splice(userIndex, 1);
        fs.writeFile('db.json', JSON.stringify(users, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error saving user');
            }
            res.send({ message: 'User deleted successfully' });
        });
    });
});


// erorr handel 

app.use((req, res) => {
    res.status(404).send('404: Page Not Found ');
    res.send(`You made a ${req.method} request to ${req.url}`);

})

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const path = require('path'); // Importar el módulo path

// Crear una instancia de Express
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Servir archivos estáticos desde la carpeta 'public'

//Conectar a MongoDB usando la cadena de conexión proporcionada
const mongoURI = 'mongodb+srv://Zozayaboi:Falcone132@server.y3ir6.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(mongoURI)
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('Error al conectar a MongoDB', err));

// Definir el esquema y modelo de usuario
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Registro de usuario
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        await newUser.save();
        sendConfirmationEmail(email);  // Enviar email de confirmación al correo del usuario registrado
        res.status(201).send('Usuario registrado correctamente');
    } catch (err) {
        console.error('Error al registrar el usuario', err);
        res.status(400).send('Error al registrar el usuario');
    }
});

// Inicio de sesión
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (user && (await bcrypt.compare(password, user.password))) {
        res.status(200).send('Inicio de sesión exitoso');
    } else {
        res.status(400).send('Usuario y/o contraseña incorrectos');
    }
});

// Envío de email de confirmación
function sendConfirmationEmail(email) {
    const transporter = nodemailer.createTransport({
        service: 'Hotmail',
        auth: {
            user: 'campusvirtualtec2@hotmail.com', // Credenciales directamente en el código
            pass: 'Campus2024', // Contraseña directamente en el código
        },
    });

    const mailOptions = {
        from: 'campusvirtualtec2@hotmail.com', // El correo remitente
        to: email, // El destinatario es el email registrado
        subject: 'Confirmación de Registro',
        text: 'Gracias por registrarte en Walsh, nuestro Campus Virtual.',
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error al enviar el correo:', error);
        } else {
            console.log('Correo enviado: ' + info.response);
        }
    });
}

// Escuchar en el puerto 3000
app.listen(3000, () => {
    console.log('Servidor en ejecución en http://localhost:3000');
});
